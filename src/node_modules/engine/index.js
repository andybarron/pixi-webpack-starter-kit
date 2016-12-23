import * as display from './display';
import * as input from './input';
import raf from 'raf';
import * as resources from './resources';
import Scene from './Scene';

import 'pixi.js';
delete window.PIXI;

import 'howler';
delete window.Howl;
delete window.Howler;

import './ext';

let animationHandle = 0;
const MAX_DELTA = 1/24;
let scene = null;

export const launch = async function(startScene, {parentElement = document.body} = {}) {
  if (!(startScene instanceof Scene)) {
    throw new Error('Param "scene" must inherit from engine/Scene');
  }
  scene = startScene;
  await resources.init();
  await display.init({parentElement});
  await input.init();
  scene.init();
  let lastTime;
  const renderer = display.renderer;
  const draw = (time) => {
    const rawDelta = (time - lastTime)/1000;
    const delta = rawDelta > MAX_DELTA ? MAX_DELTA : rawDelta;
    lastTime = time;
    const next = scene.update(delta);
    input.postUpdate();
    if (next) {
      scene.dispose();
      next.container.updateTransform();
      next.init();
      scene = next;
    }
    renderer.backgroundColor = scene.backgroundColor;
    renderer.render(scene.container);
    animationHandle = raf(draw);
  };
  animationHandle = raf((time) => {
    lastTime = time;
    draw(time);
  });
};

// TODO make this just set a flag to true and clean up after frame is done
export const exit = function() {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      raf.cancel(animationHandle);
      animationHandle = 0;
      scene.dispose();
      scene.container.removeChildren();
      const tasks = [display.destroy(), input.destroy(), resources.destroy()];
      try {
        await Promise.all(tasks);
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 0);
  });
};
