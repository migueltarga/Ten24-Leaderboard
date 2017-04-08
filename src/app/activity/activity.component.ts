import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'gl-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  activities;

  constructor() { }

  ngOnInit() {
    this.activities = [
      {
        project : 'Project Name',
        member : 'Member Name',
        member_id : 1,
        points : 5,
        type : 'Commit',
        description : 'Saving Work'
      },
      {
        project : 'Project Name',
        member : 'Member Name',
        member_id : 1,
        points : 5,
        type : 'Commit',
        description : 'Saving Work'
      },
      {
        project : 'Project Name',
        member : 'Member Name',
        member_id : 1,
        points : 5,
        type : 'Commit',
        description : 'Saving Work'
      },
      {
        project : 'Project Name',
        member : 'Member Name',
        member_id : 1,
        points : 5,
        type : 'Commit',
        description : 'Saving Work'
      },
      {
        project : 'Project Name',
        member : 'Member Name',
        member_id : 1,
        points : 5,
        type : 'Commit',
        description : 'Saving Work'
      }
    ];
  }

}
