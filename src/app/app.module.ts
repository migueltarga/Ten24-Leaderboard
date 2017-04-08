import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { StatsCardComponent } from './stats-card/stats-card.component';
import { StatsComponent } from './stats/stats.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { ActivityComponent } from './activity/activity.component';

@NgModule({
  declarations: [
    AppComponent,
    StatsCardComponent,
    StatsComponent,
    LeaderboardComponent,
    ActivityComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
