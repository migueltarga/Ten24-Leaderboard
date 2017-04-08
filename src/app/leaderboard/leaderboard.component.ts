import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'gl-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  members;

  constructor() { }

  ngOnInit() {
    this.members = [
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/1.png',
        points: 100
      },
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/2.png',
        points: 100
      },
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/3.png',
        points: 100
      },
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/4.png',
        points: 100
      },
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/5.png',
        points: 100
      },
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/6.png',
        points: 100
      },
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/7.png',
        points: 100
      },
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/8.png',
        points: 100
      },
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/9.png',
        points: 100
      },
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/10.png',
        points: 100
      },
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/11.png',
        points: 100
      },
      {
        name : 'Member Name',
        picture : 'https://api.adorable.io/avatars/75/12.png',
        points: 100
      }
      
    ];
  }

}
