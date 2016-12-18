/* eslint no-console: 'off' */
import Animation from './Animation';
import {Atlas} from 'texture-atlas';
import axios from 'axios';
import {BaseTexture, Rectangle, Texture, utils} from 'pixi.js';
import * as howler from 'howler';
import naturalSort from 'javascript-natural-sort';
import {audioMap, textureMap} from 'shared/config';

export const rawCache = Object.create(null);
export const audioCache = Object.create(null);
export const baseTextureCache = utils.BaseTextureCache;
export const textureCache = utils.TextureCache;

export const loadAnimation = function(key, fps) {
  const textures = Object.keys(textureCache)
    .filter((s) => s.startsWith(key))
    .sort(naturalSort)
    .map((s) => Texture.fromFrame(s));
  return new Animation(textures, fps);
};

export const destroy = function() {
  for (const key in textureCache) {
    textureCache[key].destroy();
    delete textureCache[key];
  }
  for (const key in baseTextureCache) {
    baseTextureCache[key].destroy();
    delete baseTextureCache[key];
  }
  for (const key in audioCache) {
    delete audioCache[key];
  }
  for (const key in rawCache) {
    delete rawCache[key];
  }
};

export const init = function({pack = true} = {}) {
  return Promise.all([loadAudio(), loadTextures(pack)]);
};

const loadAudio = async function() {
  const response = await axios.get(audioMap);
  const map = response.data;
  const soundPromises = Object.entries(map).map(([key, url]) => new Promise((resolve) => {
    const sound = new howler.Howl({
      src: [url],
      /*
        For some reason, sound.once('loaderror', ...) is broken (bug with howler.js),
        so we have to use the config prop onloaderror instead.
      */
      onloaderror: () => {
        console.error(`Failed to load audio "${key}" from URL "${url}"`);
        resolve();
      },
    });
    sound.once('load', () => {
      console.info(`Loaded audio "${key}" from URL "${url}"`);
      audioCache[key] = sound;
      resolve();
    });
  }));
  await Promise.all(soundPromises);
};

const loadTextures = async function(pack = true) {
  const response = await axios.get(textureMap);
  const map = response.data;
  const imgs = Object.create(null);
  const imgPromises = Object.entries(map).map(([key, url]) => new Promise((resolve) => {
    const img = document.createElement('img');
    img.addEventListener('load', () => {
      console.info(`Loaded texture "${key}" from URL "${url}"`);
      imgs[key] = img;
      resolve();
    }, { once: true });
    img.addEventListener('error', () => {
      console.error(`Failed to load texture "${key}" from URL "${url}"`);
      resolve();
    }, { once: true });
    img.src = url;
  }));
  await Promise.all(imgPromises);
  if (pack) {
    const canvas = document.createElement('canvas');
    const atlas = new Atlas(canvas, {tilepad: true});
    for (const key in imgs) {
      const img = imgs[key];
      atlas.expand(key, img);
    }
    const base = new BaseTexture(canvas);
    const uvs = atlas.uv();
    const atlasWidth = canvas.width;
    const atlasHeight = canvas.height;
    for (const key in imgs) {
      const uv = uvs[key];
      const img = imgs[key];
      const uvTopLeft = uv[0];
      const [uvX, uvY] = uvTopLeft;
      const frame = new Rectangle(
        uvX * atlasWidth,
        uvY * atlasHeight,
        img.width,
        img.height);
      const texture = new Texture(base, frame);
      Texture.addTextureToCache(texture, key);
    }
  } else {
    for (const key in imgs) {
      const url = imgs[key].src;
      const texture = Texture.from(url);
      Texture.removeTextureFromCache(url);
      Texture.addTextureToCache(texture, key);
    }
  }
};
