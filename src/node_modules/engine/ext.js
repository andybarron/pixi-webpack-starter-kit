import {Container, ObservablePoint, Point, Rectangle} from 'pixi.js';

Object.defineProperty(Container.prototype, 'center', {
  get() {
    if (!this.center_) {
      this.center_ = new Point();
    }
    const left = this.x - this.anchor.x * this.width;
    const top = this.y - this.anchor.y * this.height;
    this.center_.set(
      left + this.width / 2,
      top + this.height / 2);
    return this.center_;
  },
  set(target) {
    const center = this.center;
    this.x += target.x - center.x;
    this.y += target.y - center.y;
  },
});

[Point, ObservablePoint].forEach((cls) => {
  const prototype = cls.prototype;
  Object.defineProperty(prototype, 'length', {
    get() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    },
  });

  Object.assign(prototype, {
    add(other, scale = 1) {
      this.x += other.x * scale;
      this.y += other.y * scale;
    },
  });
});

Object.defineProperty(Rectangle.prototype, 'center', {
  get: function() {
    if (!this.center_) {
      this.center_ = new Point(0, 0);
    }
    this.center_.x = this.x + this.width / 2;
    this.center_.y = this.y + this.height / 2;
    return this.center_;
  },
  set: function(target) {
    const center = this.center;
    this.x += target.x - center.x;
    this.y += target.y - center.y;
  },
});

const overlap = new Rectangle();

const collision = {
  a: new Point(),
  b: new Point(),
  overlap: null,
};

const resetCollision = () => {
  collision.overlap = null;
  collision.a.set(0);
  collision.b.set(0);
};

const tileCollision = new Point();
const upTileCollision = new Point();
const downTileCollision = new Point();
const leftTileCollision = new Point();
const rightTileCollision = new Point();
const possibleTileCollisions = Array(4).fill(false);

const resetTileCollision = () => {
  tileCollision.set(0);
  upTileCollision.set(0);
  downTileCollision.set(0);
  leftTileCollision.set(0);
  rightTileCollision.set(0);
  possibleTileCollisions.fill(false);
};

Object.assign(Rectangle, {
  overlapping(a, b) {
    let result = false;
    if (a && b) {
      result = !(
        a.right <= b.left ||
        a.bottom <= b.top ||
        a.left >= b.right ||
        a.top >= b.bottom);
    }
    return result;
  },
  getOverlap(a, b) {
    let rect = null;
    if (this.overlapping(a, b)) {
      rect = overlap;
      const oLeft = Math.max(a.left, b.left);
      const oRight = Math.min(a.right, b.right);
      const oTop = Math.max(a.top, b.top);
      const oBottom = Math.min(a.bottom, b.bottom);
      rect.x = oLeft;
      rect.y = oTop;
      rect.width = oRight - oLeft;
      rect.height = oBottom - oTop;
    }
    return rect;
  },
  getCollision(a, b, weight) {
    let result = null;
    const rect = this.getOverlap(a, b);
    if (rect) {
      resetCollision();
      result = collision;
      result.overlap = rect;
      const vertical = rect.height < rect.width;
      const swap = (vertical && (a.center.y > b.center.y)) ||
                   (!vertical && (a.center.x > b.center.x));
      const swapMult = swap ? -1 : 1;
      const aMult = -(1 - weight) * swapMult;
      const bMult = weight * swapMult;
      if (vertical) {
        result.a.y = rect.height * aMult;
        result.b.y = rect.height * bMult;
      } else {
        result.a.x = rect.width * aMult;
        result.b.x = rect.width * bMult;
      }
    }
    return result;
  },
  resolveCollision(positionA, positionB, collision) {
    if (collision) {
      positionA.x += collision.a.x;
      positionA.y += collision.a.y;
      positionB.x += collision.b.x;
      positionB.y += collision.b.y;
    }
  },
  getTileCollision(char, tile, {up = true, down = true, left = true, right = true} = {}) {
    resetTileCollision();
    let result = null;
    const overlap = this.getOverlap(char, tile);
    if (overlap) {
      upTileCollision.set(0, overlap.top - char.bottom);
      downTileCollision.set(0, overlap.bottom - char.top);
      leftTileCollision.set(overlap.left - char.right, 0);
      rightTileCollision.set(overlap.right - char.left, 0);
      possibleTileCollisions[0] = up && upTileCollision;
      possibleTileCollisions[1] = down && downTileCollision;
      possibleTileCollisions[2] = left && leftTileCollision;
      possibleTileCollisions[3] = right && rightTileCollision;
      let smallest = null;
      possibleTileCollisions.forEach((p) => {
        if (!p) {
          return;
        }
        if (!smallest || p.length < smallest.length) {
          smallest = p;
        }
      });
      result = smallest;
    }
    return result;
  },
});
