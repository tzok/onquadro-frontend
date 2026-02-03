import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { VisualizationDialogComponent } from '../visualization-dialog/visualization-dialog.component';
import { SaveFileDialogComponent } from '../save-file-dialog/save-file-dialog.component';
import { Visualization3DComponent } from "../visualization3-d/visualization3-d.component";
import { MatSelectChange } from "@angular/material/select";
import { ActivatedRoute } from "@angular/router";
import { saveAs } from "file-saver";
import * as JSZip from 'jszip';


@Component({
  selector: 'structure-table',
  templateUrl: './structure-table.component.html',
  styleUrls: ['./structure-table.component.css']
})
export class StructureTableComponent implements OnInit {
  selection = new SelectionModel<Structure>(true, []);
  dataSource = new MatTableDataSource<Structure>();
  csvData: Structure[] = [];
  areButtonsHidden: boolean = true;
  filteredDataLength = this.dataSource.data.length;
  query: string = null;

  @ViewChild(MatPaginator)
  paginator: MatPaginator;
  @ViewChild(MatSort)
  sort: MatSort;

  defaultDisplayedColumn = 'pdbIdentifier';
  displayedColumns = [
    'pdbIdentifier', 'pdbDeposition', 'assemblyId', 'molecule',
    'experimentalMethod', 'quadruplexId', 'structure2D', 'structure3D', 'select'
  ];
  columnNames = [
    'PDB ID', 'PDB Deposition', 'Assembly ID', 'Molecule', 'Experimental method', 'Quadruplex ID'
  ];
  value: any;
  checked: boolean;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private dialog: MatDialog, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      if (params.has('query')) {
        this.query = params.get('query');
      }
      this.http.get<Structure[]>(this.baseUrl + 'api/Quadruplex/GetStructures',
        { 'params': new HttpParams().set('query', this.query) }).subscribe(result => {
          this.dataSource = new MatTableDataSource(result);
          for (let val of result) {
            val.quadruplex_id = Array.from(new Set(val.quadruplex_id.split(',')))
            if (typeof val.quadruplex_public_ids === 'string') {
              val.quadruplex_public_ids = Array.from(new Set(val.quadruplex_public_ids.split(',')));
            }
            if (!val.quadruplex_public_ids && typeof val.quadruplex_basenames === 'string') {
              val.quadruplex_public_ids = Array.from(new Set(val.quadruplex_basenames.split(',')));
            }
            val.pdb_public_id = val.pdb_public_id || val.pdb_basename;
          }

          this.csvData = JSON.parse(JSON.stringify(result));
          for (let val of this.csvData) {
            for (let i = 0; i < val.quadruplex_id.length; i++) {
              val.quadruplex_id[i] = 'Q' + val.quadruplex_id[i];
            }
          }

          for (let val of result) {
            val.quadruplex_idetifier = JSON.parse(JSON.stringify(val.quadruplex_id));
            for (let i = 0; i < val.quadruplex_id.length; i++) {
              val.quadruplex_idetifier[i] = 'Q' + val.quadruplex_id[i];
            }
          }

          this.dataSource.filterPredicate = (data: Structure, filter: string) => !filter || (data.pdbId != null && data.pdbId.toString().toUpperCase().includes(filter.toUpperCase()));
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.areButtonsHidden = false;
          this.filteredDataLength = this.dataSource.data.length;
        },
          error => console.error(error))
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.refreshTable(filterValue);
  }

  refreshTable(filter: string) {
    this.dataSource.filter = filter.trim().toLowerCase();
    this.filteredDataLength = this.dataSource.filteredData.length;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: Structure): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.pdbId + 1}`;
  }

  showStructure(type: any, id: any) {
    let dialogRef = this.dialog.open(VisualizationDialogComponent, {
      data: { type: type, id: id },
    });
  }

  show3DStructure(pdbId: number, assembly: number) {
    let dialogRef = this.dialog.open(Visualization3DComponent, {
      data: {
        pdbId: pdbId,
        url: this.baseUrl + 'api/pdb/GetVisualization3dById?pdbid=' + pdbId + '&assembly=' + assembly
      }
    });
  }

  changeFilterPredicate($event: MatSelectChange) {
    switch ($event.value) {
      case 'pdbIdentifier':
        this.dataSource.filterPredicate = (data: Structure, filter: string) => !filter || (data.pdbId != null && data.pdbId.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'pdbDeposition':
        this.dataSource.filterPredicate = (data: Structure, filter: string) => !filter || (data.pdbDeposition != null && data.pdbDeposition.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'assemblyId':
        this.dataSource.filterPredicate = (data: Structure, filter: string) => !filter || (data.assemblyId != null && data.assemblyId.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'molecule':
        this.dataSource.filterPredicate = (data: Structure, filter: string) => !filter || (data.molecule != null && data.molecule.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'experimentalMethod':
        this.dataSource.filterPredicate = (data: Structure, filter: string) => !filter || (data.experiment != null && data.experiment.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'quadruplexId':
        this.dataSource.filterPredicate = (data: Structure, filter: string) => !filter || (data.quadruplex_idetifier != null && data.quadruplex_idetifier.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
    }

    this.refreshTable(this.dataSource.filter);
  }

  openDialog(data: any) {
    let dialogRef = this.dialog.open(SaveFileDialogComponent, { data: { checked: false } });
    dialogRef.afterClosed().subscribe(
      result => {
        if (result != null) {
          this.checked = result;
          this.downloadZIP(data);
        }
      })
  }

  downloadZIP(data: any) {
    var zip = new JSZip();
    let structures = this.generateFile(data);
    zip.file("structures" + ".csv", structures);
    if (this.checked) {
      data.forEach(row => {
        this.http.get("/static/varna/" + row.pdb_public_id + ".svg", { responseType: "arraybuffer" })
          .subscribe(data => {
            zip.file("2d_structure_varna" + row.pdbId + ".svg", data);

            this.http.get("/api/pdb/GetVisualization3dById?pdbid=" + row.pdbId + "&assembly=" + row.assemblyId, { responseType: "arraybuffer" })
              .subscribe(data => {
                zip.file("3d_structure" + row.pdbId + ".cif", data);
                zip.generateAsync({ type: "blob" })
                  .then(blob => saveAs(blob, 'structures.zip'));
              });
          });
      });
    }
    else {
      zip.generateAsync({ type: "blob" })
        .then(blob => saveAs(blob, 'structures.zip'));
    }
  }

  generateFile(data: any) {
    const replacer = (key, value) => value === null ? '' : value;
    const header = Object.keys(data[0]);
    let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(';'));
    csv.unshift(header.join(','));
    let csvArray = csv.join('\r\n');

    return new Blob([csvArray], { type: 'text/csv' })
  }
}

interface Structure {
  quadruplex_id: any;
  quadruplex_idetifier: any;
  quadruplex_public_ids: any;
  quadruplex_basenames?: any;
  pdbId: string;
  pdb_public_id: string;
  pdb_basename?: string;
  pdbDeposition: string;
  assemblyId: number;
  molecule: string;
  experiment: string;
}
