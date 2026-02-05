import { Component, Inject, OnInit } from "@angular/core";
import { ChartDataSets } from "chart.js";
import { Color } from "ng2-charts";
import { ActivatedRoute, Router } from "@angular/router";
import * as pluginDataLabels from "chartjs-plugin-datalabels";
import { HttpClient } from "@angular/common/http";
import { formatDate } from "@angular/common";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  sub;
  count: componentsCount;
  update: updateInformations;
  info: info;
  email_added = false;
  model: any = {};
  error_state = false;

  colors: Color[] = [{ backgroundColor: "#45A29E" }];

  public barChartOptions: any = {
    responsive: true,
    legend: { display: false },
    layout: {
      padding: {
        top: 30,
      },
    },
    scales: {
      yAxes: [
        {
          display: false,
        },
      ],
    },
    plugins: {
      datalabels: {
        backgroundColor: () => "white",
        align: "end",
        anchor: "end",
        padding: 0,
      },
    },
  };

  public barChartLabels: string[] = ["Tetrads", "Quadruplexes", "Helices", "Structures"];
  public barChartPlugins = [pluginDataLabels];
  public barChartType: any = "bar";
  public barChartData: ChartDataSets[] = [{ data: [0, 0, 0, 0] }];

  public barChartColors: Color[] = [{ backgroundColor: "#45A29E" }, { backgroundColor: "#57dbd5" }];

  constructor(private http: HttpClient, @Inject("BASE_URL") private baseUrl: string, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.sub = this.activatedRoute.paramMap.subscribe(
      (params) => {
        this.http.get<updateInformations>(this.baseUrl + "api/Statistics/GetUpdate").subscribe(
          (result) => {
            this.update = result;

            /*
             * If today is:
             * - Sunday (0) -> update was 3 days ago
             * - Monday (1) -> update was 4 days ago
             * - Tuesday (2) -> update was 5 days ago
             * - Wednesday (3) -> update was 6 days ago
             * - Thursday (4) -> update was today
             * - Friday (5) -> update was yesterday
             * - Saturday (6) -> update was 2 days ago
             */
            let date: Date = new Date();
            let day: number = date.getDay(); // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
            if (day >= 4) {
              date.setDate(date.getDate() - (day - 4));
            } else {
              date.setDate(date.getDate() - (day + 3));
            }
            this.update.recent = formatDate(date, "yyyy-MM-dd", "en_US");

            this.http.get<componentsCount>(this.baseUrl + "api/Statistics/GetCount").subscribe(
              (result) => {
                this.count = result;
                this.barChartData = [{ data: [this.count.tetradCount, this.count.quadruplexCount, this.count.helixCount, this.count.structureCount] }];
              },
              (error) => console.error(error)
            );
          },
          (error) => console.error(error)
        );
      },
      (error) => console.error(error)
    );
  }

  getPlot() {
    this.barChartData = [
      {
        data: [this.count.tetradCount - this.update.addedTetradCount, this.count.quadruplexCount - this.update.addedQuadruplexCount, this.count.helixCount - this.update.addedHelixCount, this.count.quadruplexCount - this.update.addedQuadruplexCount],
        label: "Before update",
        stack: "a",
      },
      {
        data: [this.update.addedTetradCount, this.update.addedQuadruplexCount, this.update.addedHelixCount, this.update.addedQuadruplexCount],
        label: "Added",
        stack: "a",
      },
    ];
  }

  getPdbRelease() {
    if (this.update.pdbRelease == null) return "-";
    return this.update.pdbRelease;
  }

  onSubmit(email_val) {
    this.sub = this.activatedRoute.paramMap.subscribe(() => {
      this.http.get<info>(this.baseUrl + "" + "api/Newsletter/AddEmailToDatabase?email=" + email_val.email).subscribe(
        (result) => {
          this.email_added = true;
          this.error_state = false;
        },
        (error) => (this.error_state = true)
      );
    });
  }

  wrong_email() {
    this.email_added = false;
  }
}

interface componentsCount {
  helixCount: number;
  quadruplexCount: number;
  tetradCount: number;
  structureCount: number;
}

interface updateInformations {
  addedHelixCount: number;
  addedQuadruplexCount: number;
  addedTetradCount: number;
  addedStructureCount: number;
  pdbRelease: string;
  recent?: string;
}

interface info {
  info: string;
}
