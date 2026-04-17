import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CiteUsComponent } from './citeUs/citeUs.component';
import { HelpComponent } from './help/help.component';
import { AboutComponent } from './about/about.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TetradTabelComponent } from './tetrad-tabel/tetrad-tabel.component';
import { MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule, MatCheckboxModule } from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { QuadruplexTableComponent } from './quadruplex-table/quadruplex-table.component';
import { StructureTableComponent } from './structure-table/structure-table.component';
import { VisualizationDialogComponent } from './visualization-dialog/visualization-dialog.component';
import { TetradComponent } from './tetrad/tetrad.component';
import { QuadruplexComponent } from './quadruplex/quadruplex.component';
import { CsvModule } from '@ctrl/ngx-csv';
import { Visualization3DComponent } from './visualization3-d/visualization3-d.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeliceComponent } from './helice/helice.component';
import { HelixComponent } from './helix/helix.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { ChartsModule } from 'ng2-charts';
import { MatSelectModule } from "@angular/material/select";
import { NewsletterComponent } from './newsletter/newsletter.component';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { CounterModule } from 'ngx-counter';
import { MatTabsModule } from "@angular/material/tabs";
import { MatButtonModule } from "@angular/material/button";
import { SearchComponent } from './search/search.component';
import { AddButtonComponent } from './add-button/add-button.component';
import { AttributeCellComponent } from './attribute-cell/attribute-cell.component';
import { CondOperatorCellComponent } from './cond-operator-cell/cond-operator-cell.component';
import { CondCellComponent } from './cond-cell/cond-cell.component';
import { CondClickableCellComponent } from './cond-clickable-cell/cond-clickable-cell.component';
import { CondSeqCellComponent } from './cond-seq-cell/cond-seq-cell.component';
import { ButtonComponent } from './button/button.component';
import { TooltipButtonComponent } from './tooltip-button/tooltip-button.component';
import { RowCondAddableComponent } from './row-cond-addable/row-cond-addable.component';
import { RowCondNonaddableComponent } from './row-cond-nonaddable/row-cond-nonaddable.component';
import { ValueDialogComponent } from './value-dialog/value-dialog.component';
import { ValOperDialogComponent } from './val-oper-dialog/val-oper-dialog.component';
import { WebbaDaSilvaDialogComponent } from './webba-da-silva-dialog/webba-da-silva-dialog.component';
import { DeleteButtonComponent } from './delete-button/delete-button.component';
import { MatRadioModule } from '@angular/material/radio';
import { SnackbarDuplicateCondComponent } from './snackbar-duplicate-cond/snackbar-duplicate-cond.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SaveFileDialogComponent } from './save-file-dialog/save-file-dialog.component';
import { SearchCriteriaBannerComponent } from './search-criteria-banner/search-criteria-banner.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    AboutComponent,
    CiteUsComponent,
    HelpComponent,
    StructureTableComponent,
    TetradTabelComponent,
    QuadruplexTableComponent,
    VisualizationDialogComponent,
    TetradComponent,
    QuadruplexComponent,
    Visualization3DComponent,
    StatisticsComponent,
    HeliceComponent,
    HelixComponent,
    PageNotFoundComponent,
    NewsletterComponent,
    SearchComponent,
    AddButtonComponent,
    AttributeCellComponent,
    CondOperatorCellComponent,
    CondCellComponent,
    CondClickableCellComponent,
    CondSeqCellComponent,
    ButtonComponent,
    TooltipButtonComponent,
    RowCondAddableComponent,
    RowCondNonaddableComponent,
    ValueDialogComponent,
    ValOperDialogComponent,
    WebbaDaSilvaDialogComponent,
    DeleteButtonComponent,
    SnackbarDuplicateCondComponent,
    SaveFileDialogComponent,
    SearchCriteriaBannerComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: 'home', component: HomeComponent },
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'about', component: AboutComponent },
      { path: 'citeUs', component: CiteUsComponent },
      // { path: 'contact', component: ContactComponent },
      { path: 'search', component: SearchComponent },
      { path: 'help', component: HelpComponent },
      { path: 'quadruplexes', component: QuadruplexTableComponent },
      { path: 'structures', component: StructureTableComponent },
      { path: 'tetrads', component: TetradTabelComponent },
      { path: 'tetrad/:tetradId', component: TetradComponent },
      { path: 'quadruplex/:quadruplexId', component: QuadruplexComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: 'helices', component: HeliceComponent },
      { path: 'helices/:helixId', component: HelixComponent },
      { path: 'unsubscribe/:id', component: NewsletterComponent },
      { path: '**', component: PageNotFoundComponent }
    ]),
    BrowserAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
    MatRadioModule,
    CsvModule,
    MatTooltipModule,
    MatIconModule,
    MatCardModule,
    ChartsModule,
    MatSelectModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    PinchZoomModule,
    CounterModule.forRoot(),
    MatTabsModule,
    MatButtonModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    VisualizationDialogComponent,
    Visualization3DComponent,
    WebbaDaSilvaDialogComponent,
    ValueDialogComponent,
    ValOperDialogComponent,
    SnackbarDuplicateCondComponent,
    SaveFileDialogComponent
  ]
})

export class AppModule { }
