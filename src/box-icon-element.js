/* global BUILD */
//
import animationsCss from '../static/css/animations.css';
import transformationsCss from '../static/css/transformations.css';


//= ======================================================
const CACHE = {}; // iconName: Promise()


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
      'border',
      'animation',
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
    switch (attr) {
      case 'name':
        handleNameChange(this, oldVal, newVal);
        break;

    }
  }
}

function handleNameChange(inst, oldVal, newVal) {
  inst._state.currentName = newVal;
  inst._state.$iconHolder.textContent = '';

  if (newVal) {
    const iconUrl = `${inst.constructor.cdnUrl}/${newVal}.svg`;
    inst.constructor.getIconSvg(iconUrl)
        .then((iconData) => {
          if (inst._state.currentName === newVal) {
            inst._state.$iconHolder.innerHTML = iconData;
          }
        })
        .catch((error) => {
          console.error(`Failed to load icon: ${iconUrl + "\n"}${error}`); //eslint-disable-line
        });
  }
}

