import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'gl-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  colors = ['blue','green','orange', 'red'];
  cards;
  constructor() { }

  ngOnInit() {
    this.cards = [
      {
        title: "Team Activity",
        total: 11,
        total_yesterday: 8
      },
      {
        title: "Total Commits",
        total: 12,
        total_yesterday: 8
      },
      {
        title: "Total Pushes",
        total: 13,
        total_yesterday: 8
      },
      {
        title: "Total Reviews",
        total: 14,
        total_yesterday: 8
      }
    ];
  }

}
