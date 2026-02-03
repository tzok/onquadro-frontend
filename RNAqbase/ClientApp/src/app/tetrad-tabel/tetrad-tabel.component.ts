import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { DomSanitizer } from "@angular/platform-browser";
import { MatDialog } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";


@Component({
  selector: 'tetrad-tabel',
  templateUrl: './tetrad-tabel.component.html',
  styleUrls: ['./tetrad-tabel.component.css']
})
export class TetradTabelComponent implements OnInit {
  selection = new SelectionModel<Tetrad>(true, []);
  dataSource = new MatTableDataSource<Tetrad>();
  csvData: Tetrad[] = [];
  areButtonsHidden: boolean = true;
  filteredDataLength = this.dataSource.data.length;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  defaultDisplayedColumn = 'pdbId';
  displayedColumns = ['id', 'quadruplexId', 'pdbId', "pdbDeposition", 'assemblyId', 'molecule', 'experiment',
    'sequence', 'ion', 'ion_charge', 'onzClass', 'tetradCombination', 'select'];
  columnNames = ['Tetrad ID', 'Quadruplex ID', 'PDB ID', 'PDB Deposition', 'Assembly ID', 'Molecule',
    'Experimental method', 'Sequence', 'Ion', 'Ionic charge', 'ONZ Class', 'Tetrad Combination'];
  value: any;

  constructor(public sanitizer: DomSanitizer, private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.http.get<Tetrad[]>(this.baseUrl + 'api/Tetrad/GetTetrads').subscribe(result => {
      this.csvData = JSON.parse(JSON.stringify(result));

      for (let val of this.csvData) {
        val.public_id = val.public_id || val.basename;
        val.quadruplex_public_id = val.quadruplex_public_id || val.quadruplex_basename;
        val.pdb_public_id = val.pdb_public_id || val.pdb_basename;
        val.id = 'T' + val.id.toString();
        val.quadruplexId = 'Q' + val.quadruplexId.toString();
      }

      this.dataSource = new MatTableDataSource(result);
      for (let val of result) {
        val.public_id = val.public_id || val.basename;
        val.quadruplex_public_id = val.quadruplex_public_id || val.quadruplex_basename;
        val.pdb_public_id = val.pdb_public_id || val.pdb_basename;
        val.tetrad_id = val.id;
        val.quadruplex_id = val.quadruplexId;
        val.id = 'T' + val.id.toString();
        val.quadruplexId = 'Q' + val.quadruplexId.toString();
      }

      this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.pdbId != null && data.pdbId.toString().toUpperCase().includes(filter.toUpperCase()));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.areButtonsHidden = false;
      this.filteredDataLength = this.dataSource.data.length;

    }, error => console.error(error));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.refreshTable(filterValue);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: Tetrad): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  changeFilterPredicate($event: MatSelectChange) {
    switch ($event.value) {
      case 'id':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.id != null && data.id.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'quadruplexId':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.quadruplexId != null && data.quadruplexId.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'pdbId':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.pdbId != null && data.pdbId.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'pdbDeposition':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.pdbDeposition != null && data.pdbDeposition.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'assemblyId':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.assemblyId != null && data.assemblyId.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'molecule':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.molecule != null && data.molecule.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'experiment':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.experiment != null && data.experiment.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'sequence':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.sequence != null && data.sequence.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'ion':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.ion != null && data.ion.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'ion_charge':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.ion_charge != null && data.ion_charge.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'onzClass':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.onzClass != null && data.onzClass.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'tetradCombination':
        this.dataSource.filterPredicate = (data: Tetrad, filter: string) => !filter || (data.tetradCombination != null && data.tetradCombination.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
    }
    this.refreshTable(this.dataSource.filter);
  }

  refreshTable(filter: string) {
    this.dataSource.filter = filter.trim().toLowerCase();
    this.filteredDataLength = this.dataSource.filteredData.length;
  }
}

interface Tetrad {
  id: any;
  public_id: string;
  basename?: string;
  quadruplexId: any;
  quadruplex_public_id: string;
  quadruplex_basename?: string;
  pdbId: string;
  pdb_public_id: string;
  pdb_basename?: string;
  assemblyId: number;
  molecule: string;
  experiment: string;
  sequence: string;
  ion: string;
  ion_charge: string;
  onzClass: string;
  pdbDeposition: string;
  select: boolean;
  tetrad_id: number;
  quadruplex_id: number;
  tetradCombination: string;
}
