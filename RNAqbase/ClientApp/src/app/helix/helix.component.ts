import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Visualization3DComponent } from '../visualization3-d/visualization3-d.component';
import { VisualizationDialogComponent } from '../visualization-dialog/visualization-dialog.component';
import * as JSZip from 'jszip';
import { DomSanitizer } from "@angular/platform-browser";
import { saveAs } from "file-saver";
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-helix',
  templateUrl: './helix.component.html',
  styleUrls: ['./helix.component.css']
})


export class HelixComponent implements OnInit {
  _3d_structure;
  _3d_layers;
  _2d_structure_varna;
  _2d_structure_rchie;
  readonly sequenceLineLength = 60;
  tetradPublicIdById = new Map<number, string>();
  quadruplexPublicIdById = new Map<number, string>();

  data: HelixReference;
  tetrads: TetradReference[];
  tetradsInformation: TetradInformations[] = [];
  tetradsPairsInformation: TetradPairsInformations[] = [];
  tetradsByQuadruplex: QuadruplexTetrads[] = [];
  structureTree: StructureTree;
  quadruplexes: QuadruplexReference[];
  quadruplexInformation: QuadruplexReference[] = [];
  nucleotideChiValues: NucleotideChiValues[];
  helixId: number;
  sub;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog) {
  }

  ngOnInit() {
    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.helixId = +params.get('helixId');
      this.http.get<HelixReference>(this.baseUrl + 'api/Helix/GetHelixReferenceById?id=' + this.helixId).subscribe(result => {
        this.data = result;
        this.data.public_id = this.data.public_id || this.data.basename;
        this.data.pdb_public_id = this.data.pdb_public_id || this.data.pdb_basename;
        this.data.id = 'H' + this.data.id;
        this.data.sequence = this.truncate(this.data.sequence);
        this.http.get<TetradReference[]>(this.baseUrl + '' + 'api/Tetrad/GetListOfTetradsInHelix?id=' + '' + this.data.id.slice(1)).subscribe(result => {
          this.tetrads = result;
          for (let val of result) {
            val.public_id = val.public_id || val.basename;
            val.quadruplex_public_id = val.quadruplex_public_id || val.quadruplex_basename;
            if (val.public_id) {
              this.tetradPublicIdById.set(val.id, val.public_id);
            }
          }
          for (let val of result) {
            if (val.tetrad2_id != 0) {
              let quadruplex = null;
              if (val.quadruplex_id == val.quadruplex_pair_id)
                quadruplex = 'Q' + val.quadruplex_id;
              this.tetradsPairsInformation.push({
                TetradId: 'T' + val.id,
                TetradPairId: 'T' + val.tetrad2_id,
                TetradPublicId: val.public_id,
                TetradPairPublicId: this.tetradPublicIdById.get(val.tetrad2_id),
                quadruplex_id: quadruplex,
                QuadruplexPublicId: val.quadruplex_public_id,
                twist: val.twist,
                rise: val.rise,
                direction: val.direction
              });
            }
          }
          for (let val of result) {
            this.tetradsInformation.push({
              id: 'T' + val.id,
              quadruplex_id: 'Q' + val.quadruplex_id,
              sequence: val.sequence,
              onzClass: val.onzClass,
              planarity: val.planarity
            });
          }
          this.tetradsByQuadruplex = this.groupTetradsByQuadruplex(result);
        }, error => console.error(error));

        this.http.get<QuadruplexReference[]>(this.baseUrl + '' + 'api/Quadruplex/GetListOfQuadruplex?id=' + '' + this.data.id.slice(1)).subscribe(result => {
          this.quadruplexes = result;
          const helixQuadruplexIds = (result || []).map(quadruplex => quadruplex.id);
          for (let val of result) {
            val.sequence = this.truncate(val.sequence);
            val.public_id = val.public_id || val.basename;
            if (val.public_id) {
              this.quadruplexPublicIdById.set(val.id, val.public_id);
            }
            this.quadruplexInformation.push({
              id: 'Q' + val.id,
              public_id: val.public_id,
              pdbIdentifier: val.pdbIdentifier,
              assemblyId: val.assemblyId,
              molecule: val.molecule,
              experiment: val.experiment,
              typeOfStrands: val.typeOfStrands,
              numberOfTetrads: val.numberOfTetrads,
              type: val.type,
              sequence: val.sequence,
              onzmClass: val.onzmClass
            });
          }
          for (let val of this.tetradsPairsInformation) {
            if (val.quadruplex_id) {
              const quadId = Number(val.quadruplex_id.slice(1));
              val.QuadruplexPublicId = this.quadruplexPublicIdById.get(quadId);
            }
          }
          for (let tetrad of this.tetrads) {
            if (!tetrad.quadruplex_public_id) {
              tetrad.quadruplex_public_id = this.quadruplexPublicIdById.get(tetrad.quadruplex_id);
            }
          }

          const quadSummaries$ = this.http.get<QuadruplexSummary[]>(
            this.baseUrl + 'api/Quadruplex/GetQuadruplexSummariesByPdbId?pdbId=' + this.data.pdbId
          );
          const tetradSummaries$ = this.http.get<TetradSummary[]>(
            this.baseUrl + 'api/Tetrad/GetTetradSummariesByPdbId?pdbId=' + this.data.pdbId
          );
          const helixSummaries$ = this.http.get<HelixSummary[]>(
            this.baseUrl + 'api/Helix/GetHelixSummariesByPdbId?pdbId=' + this.data.pdbId
          );
          forkJoin([quadSummaries$, tetradSummaries$, helixSummaries$]).subscribe(([quadSummaries, tetradSummaries, helixSummaries]) => {
            this.buildStructureTree(quadSummaries || [], tetradSummaries || [], helixSummaries || []);
          }, error => console.error(error));
        }, error => console.error(error));

        this.http.get<NucleotideChiValues[]>(this.baseUrl + '' + 'api/Helix/GetNucleotideChiValues?id=' + '' + this.data.id.slice(1)).subscribe(result => {
          this.nucleotideChiValues = result;
          for (let val of this.nucleotideChiValues) {
            const tetradId = val.tetrad_id;
            val.tetrad_id = 'T' + val.tetrad_id;
            val.tetrad_public_id = this.tetradPublicIdById.get(tetradId);
          }
        }, error => console.error(error));
      }, error => console.error(error));
    });
  }

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
                    let helix = this.generateFile([this.data]);
                    let quadruplex = this.generateFile(this.quadruplexInformation);
                    let tetrads = this.generateFile(this.tetradsInformation)
                    let tetradsPairs = this.generateFile(this.tetradsPairsInformation);
                    let nucleotides = this.generateFile(this.nucleotideChiValues);

                    zip.file("3d_structure.png", this._3d_structure);
                    zip.file("2d_structure_varna.svg", this._2d_structure_varna);
                    zip.file("2d_structure_rchie.svg", this._2d_structure_rchie);
                    zip.file("3d_structure_layers.svg", this._3d_layers);
                    zip.file("helix" + ".csv", helix);
                    zip.file("quadruplex" + ".csv", quadruplex);
                    zip.file("tetrads" + ".csv", tetrads);
                    zip.file("nucleotides_in_helice" + ".csv", nucleotides)
                    zip.file("tetrads_pairs" + ".csv", tetradsPairs)
                    zip.generateAsync({ type: "blob" })
                      .then(blob => saveAs(blob, 'g4helix-H' + this.helixId + '.zip'));

                  });
              });
          });
      });
  }

  generateFile(data: any) {
    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');

    return new Blob([csvArray], { type: 'text/csv' })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  show3dStructure() {
    let dialogRef = this.dialog.open(Visualization3DComponent, {
      data: {
        pdbId: this.data.pdbId,
        url: this.baseUrl + 'api/Helix/GetHelix3dVisualizationMethod?id=' + this.data.id.slice(1)
      }
    });
  }

  show2dStructure(type: any) {
    let dialogRef = this.dialog.open(VisualizationDialogComponent, {
      data: { type: type, id: this.data.public_id, isHelix: true },
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

  private buildStructureTree(quadruplexes: QuadruplexSummary[], tetrads: TetradSummary[], helixSummaries: HelixSummary[]) {
    const uniqueQuadruplexes = (quadruplexes || []).filter(quadruplex => quadruplex && quadruplex.id > 0);
    if (uniqueQuadruplexes.length === 0) {
      this.structureTree = null;
      return;
    }
    const helixQuadruplexIds = new Set((this.quadruplexes || []).map(quadruplex => quadruplex.id));
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

    const buildQuadNode = (quadruplex: QuadruplexSummary): StructureQuadruplex => ({
      id: quadruplex.id,
      public_id: quadPublicIds.get(quadruplex.id),
      isInHelix: helixQuadruplexIds.has(quadruplex.id),
      tetrads: tetradsByQuad.get(quadruplex.id) || []
    });

    // Build helix nodes from helix summaries
    const helixMap = new Map<number, { public_id: string; quadruplex_ids: Set<number> }>();
    for (let hs of helixSummaries || []) {
      if (!helixMap.has(hs.id)) {
        helixMap.set(hs.id, { public_id: hs.public_id, quadruplex_ids: new Set() });
      }
      helixMap.get(hs.id).quadruplex_ids.add(hs.quadruplex_id);
    }

    const quadruplexIdsInHelices = new Set<number>();
    const helices: HelixNode[] = [];
    for (let [helixId, helixData] of Array.from(helixMap.entries()).sort((a, b) => a[0] - b[0])) {
      const helixQuads = uniqueQuadruplexes
        .filter(q => helixData.quadruplex_ids.has(q.id))
        .sort((a, b) => a.id - b.id)
        .map(q => buildQuadNode(q));
      Array.from(helixData.quadruplex_ids).forEach(qId => {
        quadruplexIdsInHelices.add(qId);
      });
      helices.push({
        id: helixId,
        public_id: helixData.public_id,
        isCurrent: helixId === this.helixId,
        quadruplexes: helixQuads
      });
    }

    // Standalone quadruplexes not in any helix
    const standaloneQuadruplexes = uniqueQuadruplexes
      .filter(q => !quadruplexIdsInHelices.has(q.id))
      .sort((a, b) => a.id - b.id)
      .map(q => buildQuadNode(q));

    this.structureTree = {
      pdbId: this.data.pdbIdentifier,
      assemblyId: this.data.assemblyId,
      helices: helices,
      quadruplexes: standaloneQuadruplexes
    };
  }

  private groupTetradsByQuadruplex(tetrads: TetradReference[]): QuadruplexTetrads[] {
    const map = new Map<number, number[]>();
    for (let tetrad of tetrads || []) {
      if (!map.has(tetrad.quadruplex_id)) {
        map.set(tetrad.quadruplex_id, []);
      }
      map.get(tetrad.quadruplex_id).push(tetrad.id);
    }
    return Array.from(map.entries())
      .map(([quadruplexId, tetradIds]) => ({
        quadruplexId,
        tetradIds: tetradIds.sort((a, b) => a - b)
      }))
      .sort((a, b) => a.quadruplexId - b.quadruplexId);
  }

  setTwoNumberDecimal(num) {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  truncate(source) {
    let size = 30;
    let result = source.slice(0, 4);
    for (let i = 4; i < source.length; i += 4) {
      result += ',' + source.slice(i, i + 4);
    }
    return result.length > size ? result.slice(0, size - 1) + "…" : result;
  }
}

interface HelixReference {
  id: string;
  public_id: string;
  basename?: string;
  pdbId: string;
  pdbIdentifier: string;
  pdb_public_id: string;
  pdb_basename?: string;
  title: string;
  assemblyId: number;
  molecule: string;
  experiment: string
  sequence: string;
  typeOfStrands: string;
  numberOfQuadruplexes: number;
  numberOfTetrads: number;
  dot_bracket: string;
}

interface QuadruplexReference {
  id: any;
  public_id: string;
  basename?: string;
  pdbIdentifier: string;
  assemblyId: number;
  molecule: string;
  experiment: string;
  typeOfStrands: string;
  numberOfTetrads: number;
  type: string;
  sequence: string;
  onzmClass: string;
}

interface TetradReference {
  id: any;
  public_id: string;
  basename?: string;
  quadruplex_id: any;
  quadruplex_pair_id: any;
  quadruplex_public_id: string;
  quadruplex_basename?: string;
  sequence: string;
  onzClass: string;
  twist: number;
  rise: number;
  planarity: number;
  tetrad2_id: number;
  direction: string;
}

interface TetradInformations {
  id: any;
  quadruplex_id: any;
  sequence: string;
  onzClass: string;
  planarity: number;
}

interface TetradPairsInformations {
  TetradId: any;
  TetradPairId: any;
  TetradPublicId: string;
  TetradPairPublicId: string;
  quadruplex_id: any;
  QuadruplexPublicId: string;
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

interface QuadruplexTetrads {
  quadruplexId: number;
  tetradIds: number[];
}

interface StructureTree {
  pdbId: string;
  assemblyId: number;
  helices: HelixNode[];
  quadruplexes: StructureQuadruplex[];
}

interface HelixNode {
  id: number;
  public_id?: string;
  isCurrent: boolean;
  quadruplexes: StructureQuadruplex[];
}

interface StructureQuadruplex {
  id: number;
  public_id?: string;
  isInHelix: boolean;
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

interface HelixSummary {
  id: number;
  public_id?: string;
  quadruplex_id: number;
}
