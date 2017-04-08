import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'gl-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent implements OnInit {
   @Input() backgroundColor: string;
   @Input() card;
   
  constructor() { }

  ngOnInit() {

  }

}
