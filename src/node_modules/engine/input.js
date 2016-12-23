// TODO convert mouse wheel to buttons?
import {Point} from 'pixi.js';
import {renderer} from './display';

const lastMouse = new Point();
let mousePresent = false;
const buttonsDown = Object.create(null);
const buttonsPressed = Object.create(null);
const buttonsReleased = Object.create(null);

const handleButtonDown = function(id) {
  if (!buttonsDown[id]) {
    buttonsPressed[id] = true;
  }
  buttonsDown[id] = true;
};

const handleButtonUp = function(id) {
  if (buttonsDown[id]) {
    buttonsReleased[id] = true;
  }
  buttonsDown[id] = false;
};

const handleKeyDownEvent = function(e) {
  handleButtonDown(e.code);
};

const handleKeyUpEvent = function(e) {
  handleButtonUp(e.code);
};

const handleMouseMoveEvent = function(e) {
  lastMouse.x = e.x;
  lastMouse.y = e.y;
};

const handleMouseEnterEvent = function(_e) {
  mousePresent = true;
};

const handleMouseLeaveEvent = function(_e) {
  mousePresent = false;
};

const handleMouseDownEvent = function(e) {
  handleButtonDown('Mouse' + e.button);
};

const handleMouseUpEvent = function(e) {
  handleButtonUp('Mouse' + e.button);
};

export const mousePosition = function() {
  return mousePresent ? lastMouse : null;
};

export const mouseLastPosition = function() {
  return lastMouse;
};

export const mouseFocused = function() {
  return mousePresent;
};

export const buttonDown = function(id) {
  return buttonsDown[id] || false;
};

export const buttonPressed = function(id) {
  return buttonsPressed[id] || false;
};

export const buttonReleased = function(id) {
  return buttonsReleased[id] || false;
};

const prevent = (e) => e.preventDefault();

const listeners = {
  'contextmenu': {
    handler: prevent,
  },
  'click': {
    handler: prevent,
  },
  'keydown': {
    handler: handleKeyDownEvent,
  },
  'keyup': {
    handler: handleKeyUpEvent,
  },
  'mousemove': {
    handler: handleMouseMoveEvent,
    viewOnly: true,
  },
  'mouseenter': {
    handler: handleMouseEnterEvent,
    viewOnly: true,
  },
  'mouseleave': {
    handler: handleMouseLeaveEvent,
    viewOnly: true,
  },
  'mousedown': {
    handler: handleMouseDownEvent,
    viewOnly: true,
  },
  'mouseup': {
    handler: handleMouseUpEvent,
    viewOnly: true,
  },
};

export const init = function() {
  for (const [eventName, info] of Object.entries(listeners)) {
    const target = info.viewOnly ? renderer.view : window;
    target.addEventListener(eventName, info.handler);
  }
};

export const destroy = function() {
  for (const [eventName, info] of Object.entries(listeners)) {
    const target = info.viewOnly ? renderer.view : window;
    target.removeEventListener(eventName, info.handler);
  }
  // TODO clear mouse and button state
};

export const postUpdate = function() {
  for (const id in buttonsPressed) {
    buttonsPressed[id] = false;
  }
  for (const id in buttonsReleased) {
    buttonsReleased[id] = false;
  }
};
