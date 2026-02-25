export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.keysJustPressed = {};
    this.mouse = { x: 0, y: 0, down: false, clicked: false };
    this._prevKeys = {};

    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.keys[e.code] = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('mousedown', () => {
      this.mouse.down = true;
      this.mouse.clicked = true;
    });

    canvas.addEventListener('mouseup', () => {
      this.mouse.down = false;
    });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const touch = e.touches[0];
      this.mouse.x = (touch.clientX - rect.left) * scaleX;
      this.mouse.y = (touch.clientY - rect.top) * scaleY;
      this.mouse.down = true;
      this.mouse.clicked = true;
    });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.mouse.down = false;
    });
  }

  isKeyDown(key) {
    return !!this.keys[key];
  }

  isKeyJustPressed(key) {
    return !!this.keysJustPressed[key];
  }

  isClicked() {
    return this.mouse.clicked;
  }

  isClickInRect(x, y, w, h) {
    return this.mouse.clicked &&
      this.mouse.x >= x && this.mouse.x <= x + w &&
      this.mouse.y >= y && this.mouse.y <= y + h;
  }

  isHoverInRect(x, y, w, h) {
    return this.mouse.x >= x && this.mouse.x <= x + w &&
      this.mouse.y >= y && this.mouse.y <= y + h;
  }

  isClickInCircle(cx, cy, r) {
    if (!this.mouse.clicked) return false;
    const dx = this.mouse.x - cx;
    const dy = this.mouse.y - cy;
    return dx * dx + dy * dy <= r * r;
  }

  update() {
    for (const key in this.keys) {
      this.keysJustPressed[key] = this.keys[key] && !this._prevKeys[key];
    }
    this._prevKeys = { ...this.keys };
  }

  endFrame() {
    this.mouse.clicked = false;
  }
}
