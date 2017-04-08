import { browser, element, by } from 'protractor';

export class GitLeaderboardPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('gl-root h1')).getText();
  }
}
