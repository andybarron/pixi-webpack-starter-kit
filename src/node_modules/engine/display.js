import {autoDetectRenderer} from 'pixi.js';

const RENDERER_OPTIONS = {
  round: true,
};
const RESIZE_MS = 1000 * 0.25;

let resizeTimeout = null;

export let rendererParent = null;
export let renderer = null;
export let width = 0;
export let height = 0;

const resizeView = function() {
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.resize(width, height);
};

const resizeListener = function() {
  if (resizeTimeout) {
    window.clearTimeout(resizeTimeout);
  }
  resizeTimeout = window.setTimeout(resizeView, RESIZE_MS);
};

export const init = async function({parentElement = document.body} = {}) {
  rendererParent = parentElement;
  rendererParent.innerHTML = '';
  renderer = new autoDetectRenderer(1, 1, RENDERER_OPTIONS);
  const view = renderer.view;
  rendererParent.appendChild(view);

  resizeView();

  window.addEventListener('resize', resizeListener);
};

export const destroy = function() {
  if (resizeTimeout) {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }
  window.removeEventListener('resize', resizeListener);
  renderer.view.remove();
  renderer = null;
  rendererParent = null;
};
