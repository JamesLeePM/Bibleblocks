/**
 * On-screen controls for phones/tablets: look (drag), move (joystick), jump, break, place.
 * Desktop / mouse play is unchanged.
 */

function ensureStyle() {
  if (document.getElementById('touch-controls-style')) return;
  const style = document.createElement('style');
  style.id = 'touch-controls-style';
  style.textContent = `
    .bb-touch-root{
      position: fixed;
      inset: 0;
      z-index: 140;
      pointer-events: none;
      display: none;
    }
    .bb-touch-root.bb-touch-root--on{
      display: block;
    }
    .bb-touch-root.bb-touch-root--paused{
      opacity: 0;
      pointer-events: none !important;
      visibility: hidden;
    }
    .bb-touch-look{
      position: absolute;
      right: 0;
      top: 0;
      width: 58%;
      height: 100%;
      pointer-events: none;
      touch-action: none;
    }
    .bb-touch-joy-wrap{
      position: absolute;
      left: max(0.75rem, env(safe-area-inset-left));
      bottom: max(5.5rem, calc(env(safe-area-inset-bottom) + 4.5rem));
      width: 128px;
      height: 128px;
      pointer-events: auto;
      touch-action: none;
    }
    .bb-touch-joy{
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid rgba(212,175,55,0.55);
      background: rgba(0,0,0,0.28);
      box-shadow: inset 0 0 12px rgba(0,0,0,0.35);
      position: relative;
    }
    .bb-touch-joy__knob{
      position: absolute;
      left: 50%;
      top: 50%;
      width: 48px;
      height: 48px;
      margin-left: -24px;
      margin-top: -24px;
      border-radius: 50%;
      background: linear-gradient(180deg, #ffd54f, #c9a227);
      border: 2px solid #5c4a2a;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
    }
    .bb-touch-btn{
      font-family: 'Press Start 2P', monospace;
      font-size: 0.42rem;
      padding: 0.55rem 0.65rem;
      border-radius: 8px;
      border: 2px solid #5c4a2a;
      cursor: pointer;
      pointer-events: auto;
      touch-action: manipulation;
      color: #1a1510;
      background: linear-gradient(180deg, #e8d5a8, #c4a574);
      box-shadow: 0 6px 16px rgba(0,0,0,0.35);
      user-select: none;
    }
    .bb-touch-btn--round{
      width: 64px;
      height: 64px;
      border-radius: 50%;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.38rem;
      line-height: 1.35;
      text-align: center;
    }
    .bb-touch-btn--primary{
      background: linear-gradient(180deg, #81c784, #43a047);
      color: #0d1f0d;
    }
    .bb-touch-btn--fly-on{
      background: linear-gradient(180deg, #90caf9, #42a5f5);
      color: #0d1a24;
      border-color: #1565c0;
    }
    .bb-touch-stack{
      position: absolute;
      right: max(0.75rem, env(safe-area-inset-right));
      bottom: max(1rem, env(safe-area-inset-bottom));
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-end;
      pointer-events: auto;
    }
    .bb-touch-hint{
      position: absolute;
      left: 50%;
      bottom: max(0.35rem, env(safe-area-inset-bottom));
      transform: translateX(-50%);
      font-family: 'Press Start 2P', monospace;
      font-size: 0.32rem;
      color: rgba(245,230,200,0.55);
      text-align: center;
      max-width: 90vw;
      pointer-events: none;
      line-height: 1.6;
    }
  `;
  document.head.appendChild(style);
}

export class TouchControls {
  /**
   * @param {{
   *  canvas: HTMLCanvasElement,
   *  player: import('../engine/PlayerController.js').PlayerController,
   *  getInGame: () => boolean,
   * }} opts
   */
  constructor(opts) {
    ensureStyle();
    this.canvas = opts.canvas;
    this.player = opts.player;
    this.getInGame = opts.getInGame;
    /** @private */
    this._gamePaused = false;

    this._root = document.createElement('div');
    this._root.className = 'bb-touch-root';
    this._root.setAttribute('aria-hidden', 'true');

    const look = document.createElement('div');
    look.className = 'bb-touch-look';
    look.title = 'Drag to look';

    const joyWrap = document.createElement('div');
    joyWrap.className = 'bb-touch-joy-wrap';
    const joy = document.createElement('div');
    joy.className = 'bb-touch-joy';
    const knob = document.createElement('div');
    knob.className = 'bb-touch-joy__knob';
    joy.appendChild(knob);
    joyWrap.appendChild(joy);

    const stack = document.createElement('div');
    stack.className = 'bb-touch-stack';

    const mkBtn = (label, classExtra, onDown, onUp) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `bb-touch-btn ${classExtra}`;
      b.textContent = label;
      b.addEventListener('touchstart', (e) => {
        e.preventDefault();
        onDown();
      });
      b.addEventListener('touchend', (e) => {
        e.preventDefault();
        onUp();
      });
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        onDown();
      });
      b.addEventListener('mouseup', (e) => {
        e.preventDefault();
        onUp();
      });
      b.addEventListener('mouseleave', () => onUp());
      return b;
    };

    stack.appendChild(
      mkBtn(
        'Break',
        '',
        () => {
          if (this.player.isCreative()) this.player.tryInteractBreak();
          else this.player.setBreakHeld(true);
        },
        () => {
          this.player.setBreakHeld(false);
        }
      )
    );
    stack.appendChild(
      mkBtn('Place', '', () => this.player.tryInteractPlace(), () => {})
    );

    const flyBtn = document.createElement('button');
    flyBtn.type = 'button';
    flyBtn.className = 'bb-touch-btn';
    flyBtn.textContent = 'Fly';
    flyBtn.title = 'Creative fly mode';
    flyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.player.toggleFlyMode();
      flyBtn.classList.toggle('bb-touch-btn--fly-on', this.player.flyMode);
    });
    stack.appendChild(flyBtn);

    const jump = document.createElement('button');
    jump.type = 'button';
    jump.className = 'bb-touch-btn bb-touch-btn--round bb-touch-btn--primary';
    jump.textContent = 'Jump';
    jump.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.player.setTouchJumpPressed(true);
    });
    jump.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.player.setTouchJumpPressed(false);
    });
    jump.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.player.setTouchJumpPressed(true);
    });
    jump.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.player.setTouchJumpPressed(false);
    });
    jump.addEventListener('mouseleave', () => this.player.setTouchJumpPressed(false));

    const hint = document.createElement('div');
    hint.className = 'bb-touch-hint';
    hint.textContent = 'Drag the view to look';

    stack.insertBefore(jump, stack.firstChild);
    this._root.append(look, joyWrap, stack, hint);

    const maxR = 40;
    const onJoyMove = (clientX, clientY) => {
      const rect = joy.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      const nx = dx / maxR;
      const ny = dy / maxR;
      this.player.setTouchAxes(nx, -ny);
    };
    const resetJoy = () => {
      knob.style.transform = 'translate(0,0)';
      this.player.setTouchAxes(0, 0);
    };

    joy.addEventListener(
      'pointerdown',
      (e) => {
        if (!this.getInGame()) return;
        e.preventDefault();
        joy.setPointerCapture(e.pointerId);
        const move = (ev) => onJoyMove(ev.clientX, ev.clientY);
        const up = () => {
          joy.removeEventListener('pointermove', move);
          joy.removeEventListener('pointerup', up);
          joy.removeEventListener('pointercancel', up);
          resetJoy();
        };
        joy.addEventListener('pointermove', move);
        joy.addEventListener('pointerup', up);
        joy.addEventListener('pointercancel', up);
        onJoyMove(e.clientX, e.clientY);
      },
      { passive: false }
    );

    /* Look is handled on the game canvas in PlayerController (iOS-safe touch). */
  }

  mount(parent = document.body) {
    parent.appendChild(this._root);
  }

  setActive(on) {
    this._root.classList.toggle('bb-touch-root--on', !!on);
    if (!on) {
      this._gamePaused = false;
      this._root.classList.remove('bb-touch-root--paused');
    }
    this.player.setTouchGameplayActive(!!on && !this._gamePaused);
    if (!on) {
      this.player.setTouchAxes(0, 0);
      this.player.setTouchJumpPressed(false);
    }
  }

  /** Hide controls while the in-game pause menu is open (HUD z-index is above). */
  setGamePaused(paused) {
    this._gamePaused = !!paused;
    this._root.classList.toggle('bb-touch-root--paused', this._gamePaused);
    if (this._root.classList.contains('bb-touch-root--on')) {
      this.player.setTouchGameplayActive(!this._gamePaused);
    }
    if (paused) {
      this.player.setTouchAxes(0, 0);
      this.player.setTouchJumpPressed(false);
    }
  }
}
