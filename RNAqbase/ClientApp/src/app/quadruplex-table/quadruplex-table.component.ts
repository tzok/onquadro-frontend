import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSelectChange } from "@angular/material/select";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'quadruplex-table',
  templateUrl: './quadruplex-table.component.html',
  styleUrls: ['./quadruplex-table.component.css']
})
export class QuadruplexTableComponent implements OnInit {
  selection = new SelectionModel<Quadruplex>(true, []);
  dataSource = new MatTableDataSource<Quadruplex>();
  csvData: Quadruplex[] = [];
  rawResult: Quadruplex[] = [];
  areButtonsHidden: boolean = true;
  filteredDataLength = this.dataSource.data.length;

  @ViewChild(MatPaginator)
  paginator: MatPaginator;
  @ViewChild(MatSort)
  sort: MatSort;

  defaultDisplayedColumn = 'pdbId';
  displayedColumns = [
    'id', 'pdbId', 'pdbDeposition', 'assemblyId', 'molecule', 'experiment', 'sequence', 'ion', 'ion_charge',
    'type_strand', 'type_onzm', 'onzmClass', 'numberOfTetrads', 'loopTopology', 'tetradCombination', 'select'
  ];
  columnNames = [
    'Quadruplex ID', 'PDB ID', 'PDB Deposition', 'Assembly ID', 'Molecule', 'Experimental method',
    'Sequence of tetrads', 'Ion', 'Ionic charge', 'Type (by no. of strands)', 'Type (by ONZM)', 'ONZM Class',
    'No. of tetrads', 'Loop topology', 'Tetrad combination'
  ]
  value: any;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      if (params.has('r')) {
        if (params.get('r') === 'search') {
          this.http.get<Quadruplex[]>(this.baseUrl + 'api/Search/GetResults').subscribe(result => {
            this.csvData = JSON.parse(JSON.stringify(result));
            this.rawResult = result;
            this.setTableValues();
          },
            error => console.error(error));
        }
      }
      else {
        this.http.get<Quadruplex[]>(this.baseUrl + 'api/Quadruplex/GetQuadruplexes').subscribe(result => {
          this.csvData = JSON.parse(JSON.stringify(result));
          this.rawResult = result;
          this.setTableValues();
        },
          error => console.error(error));
      }
    });
    
  }

  setTableValues() {
    for (let val of this.csvData) {
      val.public_id = val.public_id || val.basename;
      val.pdb_public_id = val.pdb_public_id || val.pdb_basename;
      val.id = 'Q' + val.id;
      val.sequence = this.truncate(val.sequence);
    }
    this.dataSource = new MatTableDataSource(this.rawResult);
    for (let val of this.rawResult) {
      val.public_id = val.public_id || val.basename;
      val.pdb_public_id = val.pdb_public_id || val.pdb_basename;
      val.quadruplex_id = 'Q' + val.id;
      val.sequence = this.truncate(val.sequence);
    }
    this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.pdbId != null && data.pdbId.toString().toUpperCase().includes(filter.toUpperCase()));
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.areButtonsHidden = false;
    this.filteredDataLength = this.dataSource.data.length;
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

  checkboxLabel(row?: Quadruplex): string {
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
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.quadruplex_id != null && data.quadruplex_id.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'pdbId':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.pdbId != null && data.pdbId.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'pdbDeposition':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.pdbDeposition != null && data.pdbDeposition.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'assemblyId':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.assemblyId != null && data.assemblyId.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'molecule':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.molecule != null && data.molecule.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'experiment':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.experiment != null && data.experiment.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'sequence':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.sequence != null && data.sequence.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'ion':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.ion != null && data.ion.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'ion_charge':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.ion_charge != null && data.ion_charge.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'type_strand':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.typeOfStrands != null && data.typeOfStrands.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'type_onzm':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.type != null && data.type.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'onzmClass':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.onzmClass != null && data.onzmClass.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'numberOfTetrads':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.numberOfTetrads != null && data.numberOfTetrads.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'loopTopology':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.loopTopology != null && data.loopTopology.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
      case 'tetradCombination':
        this.dataSource.filterPredicate = (data: Quadruplex, filter: string) => !filter || (data.tetradCombination != null && data.tetradCombination.toString().toUpperCase().includes(filter.toUpperCase()));
        break;
    }

    this.refreshTable(this.dataSource.filter);
  }
}

interface Quadruplex {
  id: string;
  quadruplex_id: any;
  public_id: string;
  basename?: string;
  loopTopology: string;
  ion: string;
  ion_charge: string;
  tetradCombination: string;
  pdbId: string;
  pdb_public_id: string;
  pdb_basename?: string;
  assemblyId: number;
  molecule: string;
  experiment: string;
  sequence: string;
  typeOfStrands: string;
  type: string;
  onzmClass: string;
  numberOfTetrads: string;
  pdbDeposition: string;
}
