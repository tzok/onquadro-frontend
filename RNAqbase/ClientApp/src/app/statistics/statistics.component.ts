import { Component, OnInit, Inject, Input, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ChartDataSets} from "chart.js";
import {Color} from "ng2-charts";
import { ChartType } from 'chart.js';
import { MultiDataSet, Label } from 'ng2-charts';
import { Params } from '@angular/router';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})


export class StatisticsComponent implements OnInit, AfterViewInit {

  topologyBaseTableOne: TopologyBaseTetradViewTableOne[];
  topologyBaseTableTwo: TopologyBaseTetradViewTableTwo[];
  topologyBaseTableThere: TopologyBaseTableThere[];
  ELTetradoableOne: ElTetradoTetradViewTableOne[];
  ELTetradoableTwo: ElTetradoTetradViewTableTwo[];
  ELTetradoableThereA: ElTetradoTetradViewTableThereA[];
  ELTetradoableThereB: ElTetradoTetradViewTableThereB[];
  ion_o_plus_table: ion[];
  ion_o_minus_table: ion[];
  ion_n_plus_table: ion[];
  ion_n_minus_table: ion[];
  ion_z_plus_table: ion[];
  ion_z_minus_table: ion[];
  gba_da_silva_table: gba_da_silva[];
  loop_da_silva_table: loop_da_silva[];
  experimental_method_table: experimental_method[];
  loop_progression_da_silva_table: loop_progression_da_silva[];
  onzm_table: onzm[];

  sub;
  selected = 'topologyBaseTableOne';
  selected2 = 'topologyBaseTableTwo';
  page = 0;


  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    @Inject('BASE_URL') private baseUrl: string,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog) { }


  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      this.page = params['page'];
      if (this.page == 0) {     
        this.selected = params['filter'];
      }
      else if (this.page == 1){
        this.selected2 = params['filter'];
      };
    });
    if (this.selected === undefined) { this.selected = 'topologyBaseTableOne' };
    if (this.selected2 === undefined) { this.selected2 = 'topologyBaseTableTwo' };
    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<TopologyBaseTetradViewTableOne[]>(this.baseUrl + 'api/Statistics/GetTopologyBaseTetradViewTableOne').subscribe(result => {

        let cleanedResult: TopologyBaseTetradViewTableOne[] = [];
        for (let val of result) {
          cleanedResult.push({
            sequence: val.sequence,
            dna: val.dna,
            rna: val.rna,
            other: val.other,
            total: val.total
          });
        }


        this.topologyBaseTableOne = cleanedResult;

      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<TopologyBaseTetradViewTableTwo[]>(this.baseUrl + 'api/Statistics/GetTopologyBaseTetradViewTableTwo').subscribe(result => {

        let cleanedResult: TopologyBaseTetradViewTableTwo[] = [];
        for (let val of result) {
          cleanedResult.push({
            numberOfTetrads: val.numberOfTetrads,
            dna: val.dna,
            rna: val.rna,
            other: val.other,
            total: val.total
          });
        }
        this.topologyBaseTableTwo = cleanedResult;

      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<TopologyBaseTableThere[]>(this.baseUrl + 'api/Statistics/GetTopologyBaseTetradViewTableThere').subscribe(result => {
        let cleanedResult: TopologyBaseTableThere[] = [];
        for (let val of result) {
          cleanedResult.push({
            chains: val.chains,
            dna: val.dna,
            rna: val.rna,
            other: val.other,
            total: val.total
          });
        }
        this.topologyBaseTableThere = cleanedResult;

      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<ElTetradoTetradViewTableOne[]>(this.baseUrl + 'api/Statistics/GetElTetradoTetradViewTableOne').subscribe(result => {
        let cleanedResult: ElTetradoTetradViewTableOne[] = [];
        for (let val of result) {
          cleanedResult.push({
            onz: val.onz,
            unimolecular: val.unimolecular,
            bimolecular: val.bimolecular,
            tetramolecular: val.tetramolecular,
            total: val.total
          });
        }
        this.ELTetradoableOne = cleanedResult;

      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<ElTetradoTetradViewTableTwo[]>(this.baseUrl + 'api/Statistics/GetElTetradoTetradViewTableTwo').subscribe(result => {
        let cleanedResult: ElTetradoTetradViewTableTwo[] = [];
        for (let val of result) {
          cleanedResult.push({
            onzm: val.onzm,
            plus: val.plus,
            minus: val.minus,
            star: val.star,
            total: val.total
          });
        }
        this.ELTetradoableTwo = cleanedResult;

      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<ElTetradoTetradViewTableThereA[]>(this.baseUrl + 'api/Statistics/GetElTetradoTetradViewTableThereA').subscribe(result => {
        let cleanedResult: ElTetradoTetradViewTableThereA[] = [];
        for (let val of result) {
          cleanedResult.push({
            onzm: val.onzm,
            plus: val.plus,
            minus: val.minus,
            star: val.star,
            total: val.total
          });
        }
        this.ELTetradoableThereA = cleanedResult;

      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<ElTetradoTetradViewTableThereB[]>(this.baseUrl + 'api/Statistics/GetElTetradoTetradViewTableThereB').subscribe(result => {
        let cleanedResult: ElTetradoTetradViewTableThereB[] = [];
        for (let val of result) {
          cleanedResult.push({
            onzm: val.onzm,
            plus: val.plus,
            minus: val.minus,
            star: val.star,
            total: val.total
          });
        }
        this.ELTetradoableThereB = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<ion[]>(this.baseUrl + 'api/Statistics/ion_distribution_o_plus').subscribe(result => {
        let cleanedResult: ion[] = [];
        for (let val of result) {
          cleanedResult.push({
            ion: val.ion,
            total: val.total
          });
        }
        this.ion_o_plus_table = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<ion[]>(this.baseUrl + 'api/Statistics/ion_distribution_o_minus').subscribe(result => {
        let cleanedResult: ion[] = [];
        for (let val of result) {
          cleanedResult.push({
            ion: val.ion,
            total: val.total
          });
        }
        this.ion_o_minus_table = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<ion[]>(this.baseUrl + 'api/Statistics/ion_distribution_n_plus').subscribe(result => {
        let cleanedResult: ion[] = [];
        for (let val of result) {
          cleanedResult.push({
            ion: val.ion,
            total: val.total
          });
        }
        this.ion_n_plus_table = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<ion[]>(this.baseUrl + 'api/Statistics/ion_distribution_n_minus').subscribe(result => {
        let cleanedResult: ion[] = [];
        for (let val of result) {
          cleanedResult.push({
            ion: val.ion,
            total: val.total
          });
        }
        this.ion_n_minus_table = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error));


    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<ion[]>(this.baseUrl + 'api/Statistics/ion_distribution_z_plus').subscribe(result => {
        let cleanedResult: ion[] = [];
        for (let val of result) {
          cleanedResult.push({
            ion: val.ion,
            total: val.total
          });
        }
        this.ion_z_plus_table = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<ion[]>(this.baseUrl + 'api/Statistics/ion_distribution_z_minus').subscribe(result => {
        let cleanedResult: ion[] = [];
        for (let val of result) {
          cleanedResult.push({
            ion: val.ion,
            total: val.total
          });
        }
        this.ion_z_minus_table = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<gba_da_silva[]>(this.baseUrl + 'api/Statistics/gba_da_silva').subscribe(result => {
        let cleanedResult: gba_da_silva[] = [];
        for (let val of result) {
          cleanedResult.push({
            gba_class: val.gba_class,
            total: val.total
          });
        }
        this.gba_da_silva_table = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error))

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<loop_da_silva[]>(this.baseUrl + 'api/Statistics/loop_da_silva').subscribe(result => {
        let cleanedResult: loop_da_silva[] = [];
        for (let val of result) {
          cleanedResult.push({
            loop_class: val.loop_class,
            total: val.total
          });
        }
        this.loop_da_silva_table = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<experimental_method[]>(this.baseUrl + 'api/Statistics/experimental_method').subscribe(result => {
        let cleanedResult: experimental_method[] = [];
        for (let val of result) {
          cleanedResult.push({
            experimental_method: val.experimental_method,
            total: val.total
          });
        }
        this.experimental_method_table = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<loop_progression_da_silva[]>(this.baseUrl + 'api/Statistics/loop_progression_da_silva').subscribe(result => {
        let cleanedResult: loop_progression_da_silva[] = [];
        for (let val of result) {
          cleanedResult.push({
            loop_progression_da_silva: val.loop_progression_da_silva,
            total: val.total
          });
        }
        this.loop_progression_da_silva_table = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error));

    this.sub = this.activatedRoute.paramMap.subscribe(params => {
      this.http.get<onzm[]>(this.baseUrl + 'api/Statistics/onzm').subscribe(result => {
        let cleanedResult: onzm[] = [];
        for (let val of result) {
          cleanedResult.push({
            onzm: val.onzm,
            total: val.total
          });
        }
        this.onzm_table = cleanedResult;
      }, error => console.error(error));
    }, error => console.error(error));
  }

  ngAfterViewInit() {
    // Inject GLOBAL shim into all plot iframes to fix "GLOBAL is not defined" error
    this.injectGlobalShimIntoIframes();
  }

  private injectGlobalShimIntoIframes() {
    // Find all iframes with the plot-iframe class
    const iframes = document.querySelectorAll('iframe.plot-iframe');
    
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i] as HTMLIFrameElement;
      // Wait for iframe to load, then inject the shim
      if (iframe.contentWindow && iframe.contentWindow.document) {
        this.injectShim(iframe);
      } else {
        // If not loaded yet, wait for load event
        iframe.addEventListener('load', () => {
          this.injectShim(iframe);
        });
      }
    }
  }

  private injectShim(iframe: HTMLIFrameElement) {
    try {
      const doc = iframe.contentWindow && iframe.contentWindow.document;
      if (!doc) return;

      // Create and insert the GLOBAL shim script at the beginning of head
      const shimScript = doc.createElement('script');
      shimScript.textContent = 'var GLOBAL = window;';
      
      // Insert as the first script in head to ensure it runs before any other scripts
      if (doc.head && doc.head.firstChild) {
        doc.head.insertBefore(shimScript, doc.head.firstChild);
      } else if (doc.head) {
        doc.head.appendChild(shimScript);
      } else {
        // If no head exists, create one
        const head = doc.createElement('head');
        head.appendChild(shimScript);
        doc.documentElement.insertBefore(head, doc.documentElement.firstChild);
      }
    } catch (e) {
      // Silently fail if cross-origin restrictions apply
      console.warn('Could not inject GLOBAL shim into iframe:', e);
    }
  }

}


interface TopologyBaseTetradViewTableOne {
  sequence: string;
  dna: number;
  rna: number;
  other: number;
  total: number;
}

interface TopologyBaseTetradViewTableTwo {
  numberOfTetrads: string;
  dna: number;
  rna: number;
  other: number;
  total: number;
}

interface TopologyBaseTableThere {
  chains: string;
  dna: number;
  rna: number;
  other: number;
  total: number;
}

interface ElTetradoTetradViewTableOne {
  onz: string;
  unimolecular: number;
  bimolecular: number;
  tetramolecular: number;
  total: number;
}

interface ElTetradoTetradViewTableTwo {
  onzm: string;
  plus: number;
  minus: number;
  star: number;
  total: number;
}

interface ElTetradoTetradViewTableThereA {
  onzm: string;
  plus: number;
  minus: number;
  star: number;
  total: number;
}

interface ElTetradoTetradViewTableThereB {
  onzm: string;
  plus: number;
  minus: number;
  star: number;
  total: number;
}

interface ion {
  ion: string;
  total: number;
}

interface gba_da_silva {
  total: number;
  gba_class: string;
}

interface loop_da_silva {
  total: number;
  loop_class: string;
}

interface experimental_method {
  experimental_method: string;
  total: number;
}

interface loop_progression_da_silva {
  loop_progression_da_silva: string;
  total: number;
}

interface onzm {
  onzm: string;
  total: number;
}
