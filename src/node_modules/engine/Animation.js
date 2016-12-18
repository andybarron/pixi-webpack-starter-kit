import {extras} from 'pixi.js';

export default class extends extras.AnimatedSprite {
  constructor(textures, fps) {
    super(textures);
    this.fps = fps;
    this.frameDuration = 1 / fps;
    this.frameTimer = 0;
    this.frameIndex = 0;
    this.frameCount = textures.length;
  }
  play() {
    this.playing = true;
  }
  stop() {
    this.playing = false;
  }
  update(delta) {
    if (!this.playing) {
      return;
    }
    this.frameTimer += delta;
    while (this.frameTimer >= this.frameDuration) {
      this.frameIndex += 1;
      this.frameTimer -= this.frameDuration;
    }
    if (this.frameIndex >= this.frameCount) {
      this.frameIndex = this.loop ?
        (this.frameIndex % this.frameCount) :
        (this.frameCount - 1);
    }
    this._texture = this._textures[this.frameIndex];
  }
}
