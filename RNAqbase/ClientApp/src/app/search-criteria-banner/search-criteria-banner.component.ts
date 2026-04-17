import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SearchStateService } from '../search-state.service';

@Component({
  selector: 'app-search-criteria-banner',
  templateUrl: './search-criteria-banner.component.html',
  styleUrls: ['./search-criteria-banner.component.css']
})
export class SearchCriteriaBannerComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<void>();
  @Output() filtersCleared = new EventEmitter<void>();

  isVisible = false;
  activeFiltersList: { attrID: string, attrName: string, conditions: { value: string, operator: string }[] }[] = [];

  constructor(private searchState: SearchStateService, private router: Router) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.activeFiltersList = this.searchState.getActiveFilters();
    this.isVisible = this.activeFiltersList.length > 0;
  }

  removeCondition(attrID: string, conditionValue: string) {
    this.searchState.removeCondition(attrID, conditionValue);
    this.refresh();
    if (this.isVisible) {
      this.filtersChanged.emit();
    } else {
      this.filtersCleared.emit();
    }
  }

  clearAll() {
    this.searchState.clearAll();
    this.refresh();
    this.filtersCleared.emit();
  }

  editSearch() {
    this.router.navigate(['/search']);
  }

  formatCondition(condition: { value: string, operator: string }): string {
    if (condition.operator && condition.operator.trim()) {
      return condition.operator + ' ' + condition.value;
    }
    return condition.value;
  }
}