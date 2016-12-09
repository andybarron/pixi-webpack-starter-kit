import {Container} from 'pixi.js';

export default class {
  constructor() {
    this.backgroundColor = 0x000000;
    this.container = new Container();
    this.stage = new Container();
    this.ui = new Container();
    this.container.addChild(this.stage);
    this.container.addChild(this.ui);
  }
  init() {
    // do nothing
  }
  update(_delta) {
    // do nothing
  }
  dispose() {
    // do nothing
  }
}
