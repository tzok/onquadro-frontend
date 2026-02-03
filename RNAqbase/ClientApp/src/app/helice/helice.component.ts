import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSelectChange } from "@angular/material/select";

@Component({
  selector: 'app-helice',
  templateUrl: './helice.component.html',
  styleUrls: ['./helice.component.css']
})
export class HeliceComponent implements OnInit {

  selection = new SelectionModel<Helix>(true, []);
  dataSource = new MatTableDataSource<Helix>();
  csvData: Helix[] = [];
  areButtonsHidden: boolean = true;
  filteredDataLength = this.dataSource.data.length;

  @ViewChild(MatPaginator)
  paginator: MatPaginator;
  @ViewChild(MatSort)
  sort: MatSort;

  defaultDisplayedColumn = 'pdbId';
  displayedColumns = [
    'id', 'pdbId', 'pdbDeposition', 'assemblyId', 'molecule', 'experiment',
    'sequence', 'type_strand', 'numberOfQuadruplexes', 'quadruplexId', 'numberOfTetrads', 'select'
  ];
  columnNames = [
    'G4Helix ID', 'PDB ID', 'PDB Deposition', 'Assembly ID', 'Molecule', 'Experimental method', 'Sequence of tetrads',
    'Type (by no. of strands)', 'No. of quadruplexes', 'Quadruplex ID', 'No. of tetrads'
  ];
  value: any;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
  }

  ngOnInit() {
    this.http.get<Helix[]>(this.baseUrl + 'api/Helix/GetHelices').subscribe(result => {
      this.dataSource = new MatTableDataSource(result);

      for (let val of result) {
        val.quadruplexesIds = Array.from(new Set(val.quadruplexesIds.split(',')))
        val.sequence = this.truncate(val.sequence);
        val.public_id = val.public_id || val.basename;
        val.pdb_public_id = val.pdb_public_id || val.pdb_basename;
        if (typeof val.quadruplexesPublicIds === 'string') {
          val.quadruplexesPublicIds = Array.from(new Set(val.quadruplexesPublicIds.split(',')));
        }
        if (!val.quadruplexesPublicIds && typeof val.quadruplexesBasenames === 'string') {
          val.quadruplexesPublicIds = Array.from(new Set(val.quadruplexesBasenames.split(',')));
        }
      }

      this.csvData = JSON.parse(JSON.stringify(result));
      for (let val of result) {
        val.helix_id = 'H' + val.id;
      }

      for (let val of this.csvData) {
        for (let i = 0; i < val.quadruplexesIds.length; i++) {
          val.quadruplexesIds[i] = 'Q' + val.quadruplexesIds[i];
        }
      }
      for (let val of this.csvData) {
        val.id = 'H' + val.id;
      }

      for (let val of result) {
        val.quadruplexesIds = JSON.parse(JSON.stringify(val.quadruplexesIds));
        for (let i = 0; i < val.quadruplexesIds.length; i++) {
          val.quadruplexesIds[i] = 'Q' + val.quadruplexesIds[i];
        }
      }

      this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.pdbId != null && data.pdbId.toString().toUpperCase().includes(filter.toUpperCase()));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.areButtonsHidden = false;
      this.filteredDataLength = this.dataSource.data.length;
    },
      error => console.error(error))

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
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: Helix): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  truncate(source) {
    let size = 30;
    let result = source.slice(0, 4);
    for (let i = 4; i < source.length; i += 4) {
      result += ',' + source.slice(i, i + 4);
    }
    return result.length > size ? result.slice(0, size - 1) + "…" : result;
  }

  changeFilterPredicate($event: MatSelectChange) {
    switch ($event.value) {
      case 'id':
        this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.helix_id != null && data.helix_id.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'pdbId':
        this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.pdbId != null && data.pdbId.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'pdbDeposition':
        this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.pdbDeposition != null && data.pdbDeposition.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'assemblyId':
        this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.assemblyId != null && data.assemblyId.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'molecule':
        this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.molecule != null && data.molecule.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'experiment':
        this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.experiment != null && data.experiment.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'sequence':
        this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.sequence != null && data.sequence.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'type_strand':
        this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.typeOfStrands != null && data.typeOfStrands.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'numberOfQuadruplexes':
        this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.numberOfQuadruplexes != null && data.numberOfQuadruplexes.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'quadruplexId':
        this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.quadruplexesIds != null && data.quadruplexesIds.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'numberOfTetrads':
        this.dataSource.filterPredicate = (data: Helix, filter: string) => !filter || (data.numberOfTetrads != null && data.numberOfTetrads.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
    }

    this.refreshTable(this.dataSource.filter);
  }
}

interface Helix {
  id: string;
  helix_id: any;
  public_id: string;
  basename?: string;
  quadruplexesIds: any;
  quadruplexesPublicIds: any;
  quadruplexesBasenames?: any;
  pdbId: string;
  pdb_public_id: string;
  pdb_basename?: string;
  assemblyId: number;
  molecule: string;
  experiment: string;
  sequence: string;
  typeOfStrands: string;
  numberOfQuadruplexes: number;
  numberOfTetrads: number;
  pdbDeposition: string;
}
