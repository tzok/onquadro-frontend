import { Injectable } from '@angular/core';
import { RowAttrPckt } from './row-attr-pckt';
import { Condition } from './condition';

@Injectable({ providedIn: 'root' })
export class SearchStateService {
  private filters: RowAttrPckt[] = [];

  private attrNameMap: { [key: string]: string } = {
    'pdbID': 'PDB ID',
    'authorName': 'Author name',
    'pdbDeposition': 'PDB deposition',
    'keyword': 'Keyword',
    'expMethod': 'Experimental method',
    'molType': 'Molecule type',
    'seqOfTetrads': 'Seq. of tetrads',
    'seqOfQuad': 'Seq. of quadruplexes',
    'ions': 'Ions',
    'typeNoStrands': 'Type (no. of strands)',
    'noOfTetrads': 'No. of tetrads',
    'loopLen': 'Loop length',
    'bulges': 'Bulges',
    'vLoops': 'V-Loops',
    'webbaDaSilva': 'Webba da Silva class',
    'onzClass': 'ONZ class'
  };

  setFilters(filters: RowAttrPckt[]) {
    this.filters = JSON.parse(JSON.stringify(filters));
  }

  getFilters(): RowAttrPckt[] {
    return this.filters;
  }

  hasActiveSearch(): boolean {
    return this.filters.length > 0;
  }

  getActiveFilters(): { attrID: string, attrName: string, conditions: Condition[] }[] {
    const result: { attrID: string, attrName: string, conditions: Condition[] }[] = [];
    for (const filter of this.filters) {
      const meaningfulConditions = filter.conditions.filter(c => c.value !== 'any');
      if (meaningfulConditions.length > 0) {
        result.push({
          attrID: filter.attrID,
          attrName: this.attrNameMap[filter.attrID] || filter.attrID,
          conditions: meaningfulConditions
        });
      }
    }
    return result;
  }

  removeCondition(attrID: string, conditionValue: string) {
    const filter = this.filters.find(f => f.attrID === attrID);
    if (filter) {
      const idx = filter.conditions.findIndex(c => c.value === conditionValue);
      if (idx !== -1) {
        filter.conditions.splice(idx, 1);
      }
      if (filter.conditions.length === 0) {
        this.filters = this.filters.filter(f => f.attrID !== attrID);
      }
    }
  }

  clearAll() {
    this.filters = [];
  }
}