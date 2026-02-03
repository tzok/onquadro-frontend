import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import panzoom from "panzoom";
import { HttpClient } from '@angular/common/http';
import { saveAs } from "file-saver";

@Component({
  selector: 'app-visualization-dialog',
  templateUrl: './visualization-dialog.component.html',
  styleUrls: ['./visualization-dialog.component.css']
})

export class VisualizationDialogComponent implements OnInit {
  id: any;
  type: any;
  width = 'auto';
  public svgPic: any;
  svg: SafeHtml;
  photo: any;

  @ViewChild('dataContainer') dataContainer: ElementRef;
  @ViewChild('scene', {}) scene: ElementRef;

  panZoomController;
  zoomLevels: number[];
  currentZoomLevel: number;

  constructor(
    public dialogRef: MatDialogRef<VisualizationDialogComponent>, private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, public sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.id = this.data.id;
    this.type = this.data.type;

    if (this.data.isHelix && this.type != "layers") {
      this.width = '100%';
    }
  }

  zoom() {
    const isSmooth = false;
    const scale = this.currentZoomLevel;

    if (scale) {
      const transform = this.panZoomController.getTransform();
      const deltaX = transform.x;
      const deltaY = transform.y;
      const offsetX = scale + deltaX;
      const offsetY = scale + deltaY;

      if (isSmooth) {
        this.panZoomController.smoothZoom(0, 0, scale);
      } else {
        this.panZoomController.zoomTo(offsetX, offsetY, scale);
      }
    }
  }

  zoomToggle(zoomIn: boolean) {
    const idx = this.zoomLevels.indexOf(this.currentZoomLevel);
    if (zoomIn) {
      if (typeof this.zoomLevels[idx + 1] !== 'undefined') {
        this.currentZoomLevel = this.zoomLevels[idx + 1];
      }
    } else {
      if (typeof this.zoomLevels[idx - 1] !== 'undefined') {
        this.currentZoomLevel = this.zoomLevels[idx - 1];
      }
    }
    if (this.currentZoomLevel === 1) {
      this.panZoomController.moveTo(0, 0);
      this.panZoomController.zoomAbs(0, 0, 1);
    } else {
      this.zoom();
    }
  }

  ngAfterViewInit() {
    this.zoomLevels = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    this.currentZoomLevel = this.zoomLevels[4];
    this.panZoomController = panzoom(this.scene.nativeElement);

  }
  downloadPhoto(): void {
    this.http.get("/static/" + this.data.type + "/" + this.data.id + ".svg", { responseType: "arraybuffer" })
      .subscribe(data => {

        this.photo = data;
        const input = document.getElementById("name") as HTMLInputElement;
        let value = input.value;
        if (value == "") {
          value = this.data.id;
        } 
        let blob = new Blob([this.photo]);
        saveAs(blob, value + ".svg");
      })
  }
}

interface DialogData {
  id: string;
  type: string;
  isHelix?: boolean;
}
