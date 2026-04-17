import { Component, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { forEach } from 'jszip';
import { AttrHttpGetService } from '../attr-http-get.service';
import { CondCommPckt } from '../cond-comm-pckt';
import { Condition } from '../condition';
import { ElementsFocus } from '../elements-focus';
import { RowAttrPckt } from '../row-attr-pckt';
import { RowCommPckt } from '../row-comm-pckt';
import { RowElements } from '../row-elements';

@Component({
  selector: 'app-row-cond-nonaddable',
  templateUrl: './row-cond-nonaddable.component.html',
  styleUrls: ['./row-cond-nonaddable.component.css']
})
export class RowCondNonaddableComponent implements OnInit {
  rowData: RowElements;
  @Input() rowAttrID: string;
  @Input() rowAttrType: string;
  @Input() rowAttrName: string;
  @Input() rowType: string;
  @Input() rowElements: RowElements;
  @Input() resetEvent: EventEmitter<any>;
  @Input() searchEvent: EventEmitter<any>;
  @Input() initialSelections: string[] = [];
  @Output() searchResponse = new EventEmitter<RowAttrPckt>();

  constructor(private httpService: AttrHttpGetService) { }

  msg = <RowCommPckt>{ clickInvoker: '', eventReceiver: '' };
  rowElementsStatus: ElementsFocus = {};

  respondClickEvent(childPckt: CondCommPckt) {
    this.clickEventLogic(childPckt);
  }

  ngOnInit() {
    this.resetEvent.subscribe(() => {
      this.handleResetReq();
    });
    this.searchEvent.subscribe(() => {
      this.handleSearchReq();
    });
    this.rowData = this.rowElements;
    if (this.rowData.conditions.length === 1)
      this.setRowData();
    else {
      for (let i of this.rowData.conditions)
        this.rowElementsStatus[i.value] = false;
      this.applyInitialSelections();
    }
  }

  private clickEventLogic(childPckt: CondCommPckt) {
    if (childPckt.clicked) {
      if (childPckt.clickInvoker == 'any') {
        this.setValues(childPckt);
        this.msg = { clickInvoker: childPckt.clickInvoker, eventReceiver: '', typeOfRow: this.rowType };
      }
      else if (childPckt.clickInvoker != '') {
        if (this.rowType == 'radioSelect') {
          this.setValues(childPckt);
          this.msg = { clickInvoker: childPckt.clickInvoker, eventReceiver: '', typeOfRow: this.rowType };
        }
        if ((this.rowType == 'multiSelect') && (childPckt.clickInvoker != 'any')) {
          this.rowElementsStatus[childPckt.clickInvoker] = childPckt.clicked;
          this.rowElementsStatus['any'] = false;
          this.msg = { clickInvoker: childPckt.clickInvoker, eventReceiver: 'any', typeOfRow: this.rowType };
        }
      }
    }
    else {
      this.rowElementsStatus[childPckt.clickInvoker] = childPckt.clicked;
      if (!this.checkIfAnyClicked()) {
        this.msg = { clickInvoker: 'row', eventReceiver: 'any', typeOfRow: this.rowType };
        this.rowElementsStatus['any'] = true;
      }
    }
  }

  private setValues(childPckt: CondCommPckt) {
    this.rowElementsStatus[childPckt.clickInvoker] = childPckt.clicked;
    this.unclickAll(childPckt.clickInvoker);
  }

  checkIfAnyClicked(): boolean {
    let i = false;
    for (let key in this.rowElementsStatus) {
      i = i || this.rowElementsStatus[key];
    }
    return i;
  }

  unclickAll(elem: string): void {
    for (let key in this.rowElementsStatus) {
      if (key != elem) {
        this.rowElementsStatus[key] = false;
      }
    }
  }

  handleResetReq() {
    this.rowElementsStatus['any'] = true;
    this.unclickAll('any');
    this.msg = { clickInvoker: 'row', eventReceiver: 'any', typeOfRow: this.rowType };
  }

  handleSearchReq() {
    let array: Condition[] = [];
    for (let key in this.rowElementsStatus) {
      if (this.rowElementsStatus[key]) {
        array.push({ value: key, operator: "" });
      }
    }
    this.searchResponse.emit({ attrID: this.rowAttrID, conditions: array });
  }

  setRowData() {
    this.httpService.getData(this.rowAttrID).subscribe(result => {
      for (let i in result)
        this.rowData.conditions.push({ value: result[i].trim(), operator: '' });
      for (let i of this.rowData.conditions)
        this.rowElementsStatus[i.value] = false;
      this.applyInitialSelections();
    });
  }

  applyInitialSelections() {
    if (this.initialSelections && this.initialSelections.length > 0) {
      this.rowElementsStatus['any'] = false;
      for (const value of this.initialSelections) {
        if (this.rowElementsStatus.hasOwnProperty(value)) {
          this.rowElementsStatus[value] = true;
        }
      }
    }
  }

  isInitiallySelected(value: string): boolean {
    return this.initialSelections && this.initialSelections.indexOf(value) !== -1;
  }
}
