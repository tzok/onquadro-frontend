import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../dialog-data';

@Component({
  selector: 'app-val-oper-dialog',
  templateUrl: './val-oper-dialog.component.html',
  styleUrls: ['./val-oper-dialog.component.css']
})
export class ValOperDialogComponent {
  value: string;
  operator: string;

  constructor(
    public dialogRef: MatDialogRef<ValOperDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    console.log(this.data.conditions);
    this.dialogRef.close(false);
  }

  onAddClick(): void {
    this.data.conditions.push({ value: this.value, operator: this.operator });
    this.dialogRef.close(this.data);
  }
}
