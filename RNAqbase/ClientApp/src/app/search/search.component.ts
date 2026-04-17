import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ButtonEventRs } from '../button-event-rs';
import { RowAttrPckt } from '../row-attr-pckt';
import { TableContent } from '../table-content.enum';
import { Router } from '@angular/router';
import { SearchStateService } from '../search-state.service';
import { RowElements } from '../row-elements';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit {
  @Output() triggerReset = new EventEmitter<any>();
  @Output() triggerSearch = new EventEmitter<any>();
  displayedColumns: string[] = ['attribute', 'conditions'];
  addableContent = '+';
  buttonLabelSearch = 'Search';
  buttonLabelReset = 'Reset';
  dataSource: RowElements[] = [];
  httpSearchData: RowAttrPckt[] = [];

  constructor(private router: Router, private searchState: SearchStateService) { }

  ngOnInit() {
    this.dataSource = Object.values(TableContent).map((v) => JSON.parse(v));

    if (this.searchState.hasActiveSearch()) {
      const savedFilters = this.searchState.getFilters();
      for (let i = 0; i < this.dataSource.length; i++) {
        const row = this.dataSource[i];
        const savedFilter = savedFilters.find(f => f.attrID === row.attrID);
        if (savedFilter && savedFilter.conditions) {
          const meaningfulConditions = savedFilter.conditions.filter(c => c.value !== 'any');
          if (meaningfulConditions.length > 0) {
            if (row.rowType === 'addable') {
              row.conditions = meaningfulConditions;
            } else {
              row.initialSelections = meaningfulConditions.map(c => c.value);
            }
          }
        }
      }
    }
  }

  rsEvent(pckt: ButtonEventRs) {
    if (pckt.reset) {
      this.triggerReset.emit();
    }
    else if (pckt.search) {
      this.triggerSearch.emit();
    }
  }

  collectRowElements(conds: RowAttrPckt) {
    this.httpSearchData.push(conds);
    if (this.httpSearchData.length === this.dataSource.length) {
      this.postFilters();
    }
  }

  postFilters() {
    this.searchState.setFilters(this.httpSearchData);
    this.router.navigate(['/quadruplexes'], { queryParams: { r: 'search' } });
    this.httpSearchData.splice(0);
  }
}
