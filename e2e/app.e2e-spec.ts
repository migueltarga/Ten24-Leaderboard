import { GitLeaderboardPage } from './app.po';

describe('git-leaderboard App', () => {
  let page: GitLeaderboardPage;

  beforeEach(() => {
    page = new GitLeaderboardPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('gl works!');
  });
});
