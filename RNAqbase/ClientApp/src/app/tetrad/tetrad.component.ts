import { Component, OnInit, Inject, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Visualization3DComponent } from '../visualization3-d/visualization3-d.component';
import { VisualizationDialogComponent } from '../visualization-dialog/visualization-dialog.component';
import * as JSZip from 'jszip';
import { DomSanitizer } from "@angular/platform-browser";
import { saveAs } from "file-saver";
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-tetrad',
  templateUrl: './tetrad.component.html',
  styleUrls: ['./tetrad.component.css']
})

export class TetradComponent implements OnInit {
  _3d_structure;
  _2d_structure_varna;
  _2d_structure_rchie;
  readonly sequenceLineLength = 60;
  data: Tetrad;
  csvData: Tetrad;
  tetradNucleotides: TetradNucleotides;
  tetradNucleotidesTable: TetradNucleotidesTable[] = [];
  ions: Ions[] = []
  structureTree: StructureTree;
  tetradId: number;
  sub;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.tetradId = +params.get('tetradId');
      this.http.get<Tetrad>(this.baseUrl + 'api/Tetrad/GetTetradById?id=' + this.tetradId).subscribe(result => {
        this.data = result;
        this.data.public_id = this.data.public_id || this.data.basename;
        this.data.quadruplex_public_id = this.data.quadruplex_public_id || this.data.quadruplex_basename;
        this.data.pdb_public_id = this.data.pdb_public_id || this.data.pdb_basename;
        this.data.id = 'T' + this.data.id;
        this.data.quadruplexId = 'Q' + this.data.quadruplexId;
        this.csvData = JSON.parse(JSON.stringify(this.data));

        if (this.data.quadruplexId != '99999999') {
          const quadSummaries$ = this.http.get<QuadruplexSummary[]>(
            this.baseUrl + 'api/Quadruplex/GetQuadruplexSummariesByPdbId?pdbId=' + this.data.pdbId
          );
          const tetradSummaries$ = this.http.get<TetradSummary[]>(
            this.baseUrl + 'api/Tetrad/GetTetradSummariesByPdbId?pdbId=' + this.data.pdbId
          );
          forkJoin([quadSummaries$, tetradSummaries$]).subscribe(([quadSummaries, tetradSummaries]) => {
            this.buildStructureTree(quadSummaries || [], tetradSummaries || []);
          }, error => console.error(error));
        }

        this.http.get<number[]>(this.baseUrl + 'api/Tetrad/GetOtherTetradsInTheSamePdb?tetradId=' + this.tetradId + '&pdbId=' + this.data.pdbId).subscribe(result => {
          if (result) {
            this.data.tetradsInTheSamePdb = result;
            this.csvData.tetradsInTheSamePdb = result.join(";");
          }
          else {
            this.data.tetradsInTheSamePdb = [];
            this.csvData.tetradsInTheSamePdb = '';
          }
          if (this.data.quadruplexId != '-') {
            this.http.get<number[]>(this.baseUrl + 'api/Tetrad/GetOtherTetradsInTheSameQuadruplex?tetradId=' + this.tetradId + '&quadruplexId=' + this.data.quadruplexId.slice(1)).subscribe(result => {
              if (result) {
                this.data.tetradsInTheSameQuadruplex = result;
                this.csvData.tetradsInTheSameQuadruplex = result.join(";");
              }
              else {
                this.data.tetradsInTheSameQuadruplex = [];
                this.csvData.tetradsInTheSameQuadruplex = '';
              }
              this.http.get<Ions[]>(this.baseUrl + '' + 'api/Tetrad/GetIons?id=' + '' + this.tetradId).subscribe(result => {
                this.ions = result;

              }, error => console.error(error));
              this.http.get<TetradNucleotides>(this.baseUrl + 'api/Tetrad/GetTetradNucleotides?Id=' + this.tetradId).subscribe(result => {
                this.tetradNucleotides = result;
                this.tetradNucleotidesTable.push({
                  id: "1",
                  full_name: this.tetradNucleotides.n1_full_name,
                  short_name: this.tetradNucleotides.n1_short_name,
                  chi: this.tetradNucleotides.n1_chi,
                  glycosidic_bond: this.tetradNucleotides.n1_glycosidic_bond
                });
                this.tetradNucleotidesTable.push({
                  id: "2",
                  full_name: this.tetradNucleotides.n2_full_name,
                  short_name: this.tetradNucleotides.n2_short_name,
                  chi: this.tetradNucleotides.n2_chi,
                  glycosidic_bond: this.tetradNucleotides.n2_glycosidic_bond
                });
                this.tetradNucleotidesTable.push({
                  id: "3",
                  full_name: this.tetradNucleotides.n3_full_name,
                  short_name: this.tetradNucleotides.n3_short_name,
                  chi: this.tetradNucleotides.n3_chi,
                  glycosidic_bond: this.tetradNucleotides.n3_glycosidic_bond
                });
                this.tetradNucleotidesTable.push({
                  id: "4",
                  full_name: this.tetradNucleotides.n4_full_name,
                  short_name: this.tetradNucleotides.n4_short_name,
                  chi: this.tetradNucleotides.n4_chi,
                  glycosidic_bond: this.tetradNucleotides.n4_glycosidic_bond
                });
              }, error => console.error(error));
            }, error => console.error(error));
          }
          else {
            this.data.tetradsInTheSameQuadruplex = [];
          }
        }, error => console.error(error));
      }, error => console.error(error));

    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  show3dStructure() {
    let dialogRef = this.dialog.open(Visualization3DComponent, {
      data: {
        pdbId: this.data.pdbIdentifier,
        url: this.baseUrl + 'api/tetrad/GetCifFile?tetradId=' + this.tetradId
      }
    });
  }

  private buildStructureTree(quadruplexes: QuadruplexSummary[], tetrads: TetradSummary[]) {
    const uniqueQuadruplexes = (quadruplexes || []).filter(quadruplex => quadruplex && quadruplex.id > 0);
    if (uniqueQuadruplexes.length === 0) {
      this.structureTree = null;
      return;
    }
    const currentQuadruplexId = Number(this.data.quadruplexId.slice(1));
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

                var zip = new JSZip();
                let tetrad = this.generateFile([this.csvData])
                let nucleotides = this.generateFile(this.tetradNucleotidesTable)
                let ions = this.generateFile(this.ions)
                zip.file("3d_structure.png", this._3d_structure);
                zip.file("2d_structure_varna.svg", this._2d_structure_varna);
                zip.file("2d_structure_rchie.svg", this._2d_structure_rchie);
                zip.file("tetrad" + ".csv", tetrad);
                zip.file("tetradNucleotides" + ".csv", nucleotides)
                zip.file("ions" + ".csv", ions)

                zip.generateAsync({ type: "blob" })
                  .then(blob => saveAs(blob, 'tetrad-T' + this.tetradId + '.zip'));

              });
          });
      });
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

interface Tetrad {
  id: any;
  public_id: string;
  basename?: string;
  quadruplexId: any;
  quadruplex_public_id: string;
  quadruplex_basename?: string;
  pdbId: number;
  pdbIdentifier: string;
  pdb_public_id: string;
  pdb_basename?: string;
  title: string;
  assemblyId: number;
  molecule: string;
  sequence: string;
  onzClass: string;
  planarity: string;
  tetradsInTheSameQuadruplex: any;
  tetradsInTheSamePdb: any;
  experiment: string;
  dot_bracket: string;
  tetradCombination: string;
}

interface TetradNucleotides {
  n1_full_name: string;
  n1_short_name: string;
  n1_chi: number;
  n1_glycosidic_bond: string;
  n2_full_name: string;
  n2_short_name: string;
  n2_chi: number;
  n2_glycosidic_bond: string;
  n3_full_name: string;
  n3_short_name: string;
  n3_chi: number;
  n3_glycosidic_bond: string;
  n4_full_name: string;
  n4_short_name: string;
  n4_chi: number;
  n4_glycosidic_bond: string;
}

interface TetradNucleotidesTable {
  id: string;
  full_name: string;
  short_name: string;
  chi: number;
  glycosidic_bond: string;
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

interface Ions {
  ion: string;
  ion_charge: string;
  symbol: string;
  full_name: string;
}
