import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { VisualizationDialogComponent } from '../visualization-dialog/visualization-dialog.component';
import * as JSZip from 'jszip';
import { DomSanitizer } from '@angular/platform-browser';
import { Visualization3DComponent } from "../visualization3-d/visualization3-d.component";
import { saveAs } from "file-saver";
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-quadruplex',
  templateUrl: './quadruplex.component.html',
  styleUrls: ['./quadruplex.component.css']
})
export class QuadruplexComponent implements OnInit {
  _3d_structure;
  _3d_layers;
  _2d_structure_varna;
  _2d_structure_rchie;
  readonly sequenceLineLength = 60;
  tetradPublicIdById = new Map<string, string>();

  data: Quadruplex = <Quadruplex>{ quadruplexesInTheSamePdb: [] };
  tetrads: Tetrad[];
  csvData: Quadruplex;
  tetradsTable: TetradInformations[] = [];
  tetradsPairsTable: TetradPairsInformations[] = [];
  nucleotideChiValues: NucleotideChiValues[];
  quadruplexLoops: QuadruplexLoops[] = [];
  ions: Ions[] = []
  structureTree: StructureTree;
  quadruplexId: string;
  sub;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog) {
  }

  ngOnInit() {
    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.quadruplexId = params.get('quadruplexId');
      this.http.get<Quadruplex>(this.baseUrl + '' + 'api/Quadruplex/GetQuadruplexById?id=' + '' + this.quadruplexId).subscribe(result => {
        this.data = result;
        this.data.public_id = this.data.public_id || this.data.basename;
        this.data.pdb_public_id = this.data.pdb_public_id || this.data.pdb_basename;
        this.data.id = 'Q' + this.data.id;
        this.csvData = JSON.parse(JSON.stringify(this.data));

        const quadSummaries$ = this.http.get<QuadruplexSummary[]>(this.baseUrl + 'api/Quadruplex/GetQuadruplexSummariesByPdbId?pdbId=' + this.data.pdbId);
        const tetradSummaries$ = this.http.get<TetradSummary[]>(this.baseUrl + 'api/Tetrad/GetTetradSummariesByPdbId?pdbId=' + this.data.pdbId);
        forkJoin([quadSummaries$, tetradSummaries$]).subscribe(([summaries, tetradSummaries]) => {
          const quadSummaries = summaries || [];
          const otherIds = quadSummaries.map(summary => summary.id).filter(id => id !== Number(this.quadruplexId));
          this.data.quadruplexesInTheSamePdb = otherIds;
          this.csvData.quadruplexesInTheSamePdb = otherIds.join(';');

          this.buildStructureTree(quadSummaries, tetradSummaries || []);
          this.http.get<Tetrad[]>(this.baseUrl + '' + 'api/Tetrad/GetListOfTetrads?id=' + '' + this.quadruplexId).subscribe(result => {
            this.tetrads = result;

            this.data.tetrads = this.tetrads.map(({ id }) => id);
            this.csvData.tetrads = this.data.tetrads.join(';');
            for (let val of result) {
              val.id = 'T' + val.id;
              val.tetrad2_id = 'T' + val.tetrad2_id;
              val.public_id = val.public_id || val.basename;
              if (val.public_id) {
                this.tetradPublicIdById.set(val.id, val.public_id);
              }
            }

            for (let val of result) {
              if (val.tetrad2_id.slice(1) != 0) {
                this.tetradsPairsTable.push({
                  TetradId: val.id,
                  TetradPairId: val.tetrad2_id,
                  TetradPublicId: this.tetradPublicIdById.get(val.id),
                  TetradPairPublicId: this.tetradPublicIdById.get(val.tetrad2_id),
                  twist: val.twist,
                  rise: val.rise,
                  direction: val.direction
                });
              }
            }

            for (let val of result) {
              this.tetradsTable.push({
                id: val.id,
                sequence: val.sequence,
                onzClass: val.onzClass,
                planarity: val.planarity
              });
            }
            this.http.get<NucleotideChiValues[]>(this.baseUrl + '' + 'api/Quadruplex/GetNucleotideChiValues?id=' + '' + this.data.id.slice(1)).subscribe(result => {
              this.nucleotideChiValues = result;
              for (let val of this.nucleotideChiValues) {
                const tetradId = val.tetrad_id;
                val.tetrad_id = 'T' + val.tetrad_id;
                val.tetrad_public_id = this.tetradPublicIdById.get('T' + tetradId);
              }
            }, error => console.error(error));

            this.http.get<QuadruplexLoops[]>(this.baseUrl + '' + 'api/Quadruplex/GetQuadruplexLoops?id=' + '' + this.data.id.slice(1)).subscribe(result => {
              this.quadruplexLoops = result;
              let counter = 1;
              for (let val of this.quadruplexLoops) {
                val.id = 'L' + counter.toString()
                val.loop_length = val.short_sequence.length;
                counter = counter + 1;
              }
            }, error => console.error(error));
            this.http.get<Ions[]>(this.baseUrl + '' + 'api/Quadruplex/GetIons?id=' + '' + this.data.pdbId).subscribe(result => {
              this.ions = result;
            }, error => console.error(error));


          }, error => console.error(error));
        }, error => console.error(error));
      }, error => console.error(error));
    });
  }

  private buildStructureTree(quadruplexes: QuadruplexSummary[], tetrads: TetradSummary[]) {
    const uniqueQuadruplexes = (quadruplexes || []).filter(quadruplex => quadruplex && quadruplex.id > 0);
    if (uniqueQuadruplexes.length === 0) {
      this.structureTree = null;
      return;
    }
    const currentQuadruplexId = Number(this.quadruplexId);
    const quadPublicIds = new Map<number, string>();
    for (let quad of uniqueQuadruplexes) {
      quadPublicIds.set(quad.id, quad.public_id || quad.basename);
    }
    const tetradsByQuad = new Map<number, TetradNode[]>();
    for (let tetrad of tetrads || []) {
      if (!tetradsByQuad.has(tetrad.quadruplex_id)) {
        tetradsByQuad.set(tetrad.quadruplex_id, []);
      }
      tetradsByQuad.get(tetrad.quadruplex_id).push({
        id: tetrad.id,
        public_id: tetrad.public_id || tetrad.basename
      });
    }
    tetradsByQuad.forEach((quadTetrads, quadId) => {
      quadTetrads.sort((a, b) => a.id - b.id);
      tetradsByQuad.set(quadId, quadTetrads);
    });
    this.structureTree = {
      pdbId: this.data.pdbIdentifier,
      assemblyId: this.data.assemblyId,
      quadruplexes: uniqueQuadruplexes
        .sort((a, b) => a.id - b.id)
        .map(quadruplex => ({
          id: quadruplex.id,
          public_id: quadPublicIds.get(quadruplex.id),
          isCurrent: quadruplex.id === currentQuadruplexId,
          tetrads: tetradsByQuad.get(quadruplex.id) || []
        }))
    };
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  show3dStructure() {
    let dialogRef = this.dialog.open(Visualization3DComponent, {
      data: {
        pdbId: this.data.pdbId,
        url: this.baseUrl + 'api/Quadruplex/GetQuadruplex3dVisualizationMethod?id=' + this.quadruplexId
      }
    });
  }

  show2dStructure(type: any) {
    let dialogRef = this.dialog.open(VisualizationDialogComponent, {
      data: { type: type, id: this.data.public_id },
    });
  }

  setTwoNumberDecimal(num) {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  downloadZip(): void {
    this.http.get("/static/pymol/" + this.data.public_id + ".png", { responseType: "arraybuffer" })
      .subscribe(data => {
        this._3d_structure = data;

        this.http.get("/static/varna/" + this.data.public_id + ".svg", { responseType: "arraybuffer" })
          .subscribe(data => {
            this._2d_structure_varna = data;

            this.http.get("/static/rchie/" + this.data.public_id + ".svg", { responseType: "arraybuffer" })
              .subscribe(data => {
                this._2d_structure_rchie = data;

                this.http.get("/static/layers/" + this.data.public_id + ".svg", { responseType: "arraybuffer" })
                  .subscribe(data => {
                    this._3d_layers = data;

                    var zip = new JSZip();
                    let quadruplex = this.generateFile([this.csvData])
                    let tetrads = this.generateFile(this.tetradsTable)
                    let tetradsPairs = this.generateFile(this.tetradsPairsTable)
                    let nucleotides = this.generateFile(this.nucleotideChiValues);
                    let loops = this.generateFile(this.quadruplexLoops);
                    if (this.ions.length != 0) {
                      let ions = this.generateFile(this.ions);
                      zip.file("ions" + ".csv", ions)
                    }
                    zip.file("3d_structure.png", this._3d_structure);
                    zip.file("2d_structure_varna.svg", this._2d_structure_varna);
                    zip.file("2d_structure_rchie.svg", this._2d_structure_rchie);
                    zip.file("3d_structure_layers.svg", this._3d_layers);
                    zip.file("quadruplex" + ".csv", quadruplex);
                    zip.file("tetrads" + ".csv", tetrads);
                    zip.file("tetrads_pairs" + ".csv", tetradsPairs)
                    zip.file("nucleotides_in_quadruplex" + ".csv", nucleotides)
                    zip.file("quadruplex_loops" + ".csv", loops)
                    zip.generateAsync({ type: "blob" })
                      .then(blob => saveAs(blob, 'quadruplex-Q' + this.quadruplexId + '.zip'));

                  });
              });
          });
      });
  }

  formatFixedWidth(value: string, lineLength: number = this.sequenceLineLength): string {
    if (!value) {
      return '';
    }
    const length = Math.max(1, Math.floor(lineLength));
    return value
      .split(/\r?\n/)
      .map(line => {
        let result = '';
        for (let i = 0; i < line.length; i += length) {
          result += line.slice(i, i + length);
          if (i + length < line.length) {
            result += '\n';
          }
        }
        return result;
      })
      .join('\n');
  }

  generateFile(data: any) {
    const replacer = (key, value) => value === null ? '' : value;
    const header = Object.keys(data[0]);
    let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');

    return new Blob([csvArray], { type: 'text/csv' })
  }
}

interface Quadruplex {
  id: any;
  public_id: string;
  basename?: string;
  pdbId: number;
  pdbIdentifier: string;
  pdb_public_id: string;
  pdb_basename?: string;
  title: string;
  assemblyId: number;
  molecule: string;
  experiment: string;
  typeOfStrands: string;
  numberOfTetrads: number;
  type: string;
  sequence: string;
  onzmClass: string;
  quadruplexesInTheSamePdb: any;
  tetrads: any;
  dot_bracket: string;
  loopTopology: string;
  tetradCombination: string;
}

interface Tetrad {
  id: any;
  public_id: string;
  basename?: string;
  sequence: string;
  onzClass: string;
  twist: number;
  rise: number;
  planarity: number;
  tetrad2_id: any;
  direction: string;
}

interface TetradInformations {
  id: any;
  sequence: string;
  onzClass: string;
  planarity: number;
}

interface TetradPairsInformations {
  TetradId: any;
  TetradPairId: any;
  TetradPublicId: string;
  TetradPairPublicId: string;
  twist: number;
  rise: number;
  direction: string;
}

interface NucleotideChiValues {
  tetrad_id: any;
  tetrad_public_id: string;
  n1_chi: number;
  n1_glycosidic_bond: string;
  n2_chi: number;
  n2_glycosidic_bond: string;
  n3_chi: number;
  n3_glycosidic_bond: string;
  n4_chi: number;
  n4_glycosidic_bond: string;
}

interface TetradReference {
  id: number;
  public_id?: string;
  basename?: string;
}

interface StructureTree {
  pdbId: string;
  assemblyId: number;
  quadruplexes: StructureQuadruplex[];
}

interface StructureQuadruplex {
  id: number;
  public_id?: string;
  isCurrent: boolean;
  tetrads: TetradNode[];
}

interface TetradNode {
  id: number;
  public_id?: string;
}

interface QuadruplexSummary {
  id: number;
  public_id?: string;
  basename?: string;
}

interface TetradSummary {
  id: number;
  public_id?: string;
  basename?: string;
  quadruplex_id: number;
}

interface QuadruplexLoops {
  id: string;
  short_sequence: string;
  full_sequence: string;
  loop_type: string;
  loop_length: number;
}

interface Ions {
  count: number;
  ion: string;
  ion_charge: string;
}
