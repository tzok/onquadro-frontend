import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material';
import { isUndefined } from 'util';
import { Condition } from '../condition';
import { DialogChoice } from '../dialog-choice';
import { DialogData } from '../dialog-data';

@Component({
  selector: 'app-add-button',
  templateUrl: './add-button.component.html',
  styleUrls: ['./add-button.component.css']
})
export class AddButtonComponent implements OnInit {
  @Input('name') elementName: string;
  @Input() content: string;
  @Input() rootAttribute: string;
  @Input() disable: boolean;
  @Output() newConditionEvent = new EventEmitter<Condition>();

  isDisabled: boolean;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['disable']) {
      this.disableButton(this.disable);
    }
  }

  ngOnInit() {
    this.isDisabled = false;
  }

  disableButton(event: boolean) {
    this.isDisabled = event;
  }

  constructor(public dialog: MatDialog) { }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogChoice.chooseDialog(this.rootAttribute), {
      data: { attr: this.rootAttribute, value: "", operator: "", operators: DialogChoice.chooseOperators(this.rootAttribute), inputProperties: DialogChoice.chooseInputProperties(this.rootAttribute) }
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result)
        this.emitAddedCondition(result);
    });
  }

  emitAddedCondition(data: DialogData) {
    this.newConditionEvent.emit({ condition: data.value, operator: data.operator });
  }
}
