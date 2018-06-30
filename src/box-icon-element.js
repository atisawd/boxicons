/* global BUILD */
//
import animationsCss from '../static/css/animations.css';
import transformationsCss from '../static/css/transformations.css';


//= ======================================================
const CACHE = {}; // iconName: Promise()
const CSS_CLASS_PREFIX = "bx-";
const CSS_CLASS_PREFIX_ROTATE = `${CSS_CLASS_PREFIX}rotate-`;
const CSS_CLASS_PREFIX_FLIP = `${CSS_CLASS_PREFIX}flip-`;


/**
 * A Custom Element for displaying icon
 */
export class BoxIconElement extends HTMLElement {
  static get cdnUrl() {
      // BUILD.DATA.VERSION is injected by webpack during a build.
      // Value is same as package.json#version property.
    return `https://unpkg.com/boxicons@${BUILD.DATA.VERSION}/svg`;
  }
    /**
     * The html tag name to be use
     * @type {String}
     */
  static get tagName() { return 'box-icon'; }

  static get observedAttributes() {
    return [
      'name',
      'color',
      'size',
      'rotate',
      'flip',
      'animation',
      'border',
    ];
  }

    /**
     * Returns a promise that should resolve with a string - the svg source.
     *
     * @param {String} iconUrl
     *  The url to the icon that should be loaded.
     *
     * @return {Promise<String, Error>}
     */
  static getIconSvg(iconUrl) {
    if (iconUrl && CACHE[iconUrl]) {
      return CACHE[iconUrl];
    }
    CACHE[iconUrl] = new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.addEventListener('load', function () {
        if (this.status < 200 || this.status >= 300) {
          reject(new Error(`${this.status} ${this.responseText}`));
          return;
        }
        resolve(this.responseText);
      });
      request.onerror = reject;
      request.onabort = reject;
      request.open('GET', iconUrl);
      request.send();
    });
    return CACHE[iconUrl];
  }

    /**
     * Define (register) the custom element
     *
     * @param {String} [tagName=this.tagName]
     */
  static define(tagName) {
    customElements.define(tagName || this.tagName, this);
  }

  constructor() {
    super();
    this.$ui = this.attachShadow({ mode: 'open' });
    this.$ui.innerHTML = `
<style>
:host {
  display: inline-block;
  width: 1em;
  height: 1em;
}
:host([size=xs]) {
    width: 0.8rem;
    height: 0.8rem;
}
:host([size=sm]) {
    width: 1.55rem;
    height: 1.55rem;
}
:host([size=md]) {
    width: 2.25rem;
    height: 2.25rem;
}
:host([size=lg]) {
    width: 3.0rem;
    height: 3.0rem;
}
#icon,
svg {
  width: 100%;
  height: 100%;
}
${animationsCss}
${transformationsCss}
</style>
<div id="icon"></div>`;

    this._state = {
      $iconHolder: this.$ui.getElementById('icon'),
    };
  }

  attributeChangedCallback(attr, oldVal, newVal) {
      const $iconHolder = this._state.$iconHolder;

    switch (attr) {
      case 'name':
        handleNameChange(this, oldVal, newVal);
        break;
      case 'color':
          $iconHolder.style.fill = newVal || "";
        break;
      case 'size':
          handleSizeChange(this, oldVal, newVal);
        break;
      case 'rotate':
          if (oldVal) {
              $iconHolder.classList.remove(`${CSS_CLASS_PREFIX_ROTATE}${oldVal}`);
          }
          if (newVal) {
              $iconHolder.classList.add(`${CSS_CLASS_PREFIX_ROTATE}${newVal}`);
          }
        break;
      case 'flip':
          if (oldVal) {
              $iconHolder.classList.remove(`${CSS_CLASS_PREFIX_FLIP}${oldVal}`);
          }
          if (newVal) {
              $iconHolder.classList.add(`${CSS_CLASS_PREFIX_FLIP}${newVal}`);
          }
        break;
        case 'animation':
          if (oldVal) {
              $iconHolder.classList.remove(`${CSS_CLASS_PREFIX}${oldVal}`);
          }
          if (newVal) {
              $iconHolder.classList.add(`${CSS_CLASS_PREFIX}${newVal}`);
          }
            break;
    }
  }
}

function handleNameChange(inst, oldVal, newVal) {
  const state = inst._state;
  state.currentName = newVal;
  state.$iconHolder.textContent = '';

  if (newVal) {
    const iconUrl = `${inst.constructor.cdnUrl}/${newVal}.svg`;
    inst.constructor.getIconSvg(iconUrl)
        .then((iconData) => {
          if (state.currentName === newVal) {
            state.$iconHolder.innerHTML = iconData;
          }
        })
        .catch((error) => {
          console.error(`Failed to load icon: ${iconUrl + "\n"}${error}`); //eslint-disable-line
        });
  }
}

function handleSizeChange(inst, oldVal, newVal) {
    const state = inst._state;

    if (state.size) {
        state.$iconHolder.style.width = state.$iconHolder.style.height = "";
        state.size = state.sizeType = null;
    }

    // If the size is not one of the short-hand ones, then it must be a
    // css size unit - add it directly to the icon holder.
    if (newVal && !/^(xs|sm|md|lg)$/.test(state.size)) {
        state.size = newVal.trim();
        state.$iconHolder.style.width = state.$iconHolder.style.height = state.size;
    }
}
