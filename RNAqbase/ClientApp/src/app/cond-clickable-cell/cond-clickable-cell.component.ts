import { Component, Input, EventEmitter, Output, SimpleChanges, SimpleChange } from '@angular/core';
import { CondCommPckt } from '../cond-comm-pckt';
import { Condition } from '../condition';
import { RowCommPckt } from '../row-comm-pckt';

@Component({
  selector: 'app-cond-clickable-cell',
  templateUrl: './cond-clickable-cell.component.html',
  styleUrls: ['./cond-clickable-cell.component.css']
})
export class CondClickableCellComponent {
  @Input('ID') attrID: string;
  @Input() attrType: string;
  @Input() condData: Condition;
  @Input() eventReceiver: RowCommPckt;
  @Input() startSelected: boolean = false;
  @Output() clicked = new EventEmitter<CondCommPckt>();
  isClicked: boolean;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['eventReceiver']) {
      this.eventRecv(this.eventReceiver);
    }
  }

  ngOnInit() {
    if (this.startSelected) {
      this.isClicked = true;
    } else {
      this.isClicked = false;
      if (this.condData.value == 'any') {
        this.clickEvent();
      }
    }
  }

  eventRecv(pckt: RowCommPckt) {
    if (pckt.clickInvoker != '') {
      if (pckt.clickInvoker == 'row') {
        if (pckt.eventReceiver == this.condData.value) {
          this.isClicked = true;
        }
        else if (pckt.eventReceiver != this.condData.value) {
          this.isClicked = false;
        }
      }
      else {
        if ((pckt.eventReceiver == 'any') && (this.condData.value == 'any')) {
          this.isClicked = false;
        }
        else if ((pckt.clickInvoker == 'any') && (this.condData.value != 'any')) {
          this.isClicked = false;
        }
        else if ((pckt.clickInvoker != this.condData.value) && (pckt.typeOfRow == 'radioSelect')) {
          this.isClicked = false;
        }
      }
    }
  }

  clickEvent() {
    if (this.isClicked) {
      this.isClicked = false;
      const pckt = <CondCommPckt>{ clickInvoker: this.condData.value, clicked: false };
      this.clicked.emit(pckt);
    }
    else {
      this.isClicked = true;
      const pckt = <CondCommPckt>{ clickInvoker: this.condData.value, clicked: true };
      this.clicked.emit(pckt);
    }
  }

  attrTypeCheck() {
    if (this.attrType === 'meta')
      return true;
    else
      return false;
  }
}
