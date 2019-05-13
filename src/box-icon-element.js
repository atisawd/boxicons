/* global BUILD */
import animationsCss from '../css/animations.css';
import transformationsCss from '../css/transformations.css';


//= ======================================================
const GLOBAL = window;
const CACHE = {}; // iconName: Promise()
const CSS_CLASS_PREFIX = 'bx-';
const CSS_CLASS_PREFIX_ROTATE = `${CSS_CLASS_PREFIX}rotate-`;
const CSS_CLASS_PREFIX_FLIP = `${CSS_CLASS_PREFIX}flip-`;
const TEMPLATE = document.createElement('template');
const usingShadyCss = () => !!GLOBAL.ShadyCSS;

TEMPLATE.innerHTML = `
<style>
:host {
  display: inline-block;
  font-size: initial;
  box-sizing: border-box;
  width: 24px;
  height: 24px;
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

:host([size]:not([size=""]):not([size=xs]):not([size=sm]):not([size=md]):not([size=lg])) {
    width: auto;
    height: auto;
}
:host([pull=left]) #icon {
    float: left;
    margin-right: .3em!important;
}
:host([pull=right]) #icon {
    float: right;
    margin-left: .3em!important;
}
:host([border=square]) #icon {
    padding: .25em;
    border: .07em solid rgba(0,0,0,.1);
    border-radius: .25em;
}
:host([border=circle]) #icon {
    padding: .25em;
    border: .07em solid rgba(0,0,0,.1);
    border-radius: 50%;
}
#icon,
svg {
  width: 100%;
  height: 100%;
}
#icon {
    box-sizing: border-box;
} 
${animationsCss}
${transformationsCss}
</style>
<div id="icon"></div>`;


/**
 * A Custom Element for displaying icon
 */
export class BoxIconElement extends HTMLElement {
  static get cdnUrl() {
      // BUILD.DATA.VERSION is injected by webpack during a build.
      // Value is same as package.json#version property.
    return `//unpkg.com/boxicons@${BUILD.DATA.VERSION}/svg`;
  }
    /**
     * The html tag name to be use
     * @type {String}
     */
  static get tagName() { return 'box-icon'; }

  static get observedAttributes() {
    return [
      'type',
      'name',
      'color',
      'size',
      'rotate',
      'flip',
      'animation',
      'border',
      'pull'
    ];
  }

    /**
     * Returns a promise that should resolve with a string - the svg source.
     *
     * @param {String} iconName
     *  The icon name (file name) to the icon that should be loaded.
     *
     * @return {Promise<String, Error>}
     */
  static getIconSvg(iconName,type) {
    var iconUrl = `${this.cdnUrl}/regular/bx-${iconName}.svg`;
    if(type==='solid'){
      iconUrl = `${this.cdnUrl}/solid/bxs-${iconName}.svg`;
    }
    else if(type==='logo'){
      iconUrl = `${this.cdnUrl}/logos/bxl-${iconName}.svg`;
    }
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
    tagName = tagName || this.tagName;
    if (usingShadyCss()) {
      GLOBAL.ShadyCSS.prepareTemplate(TEMPLATE, tagName);
    }
    customElements.define(tagName, this);
  }

  constructor() {
    super();

    this.$ui = this.attachShadow({ mode: 'open' });
    this.$ui.appendChild(this.ownerDocument.importNode(TEMPLATE.content, true));
    if (usingShadyCss()) {
        GLOBAL.ShadyCSS.styleElement(this);
    }
    this._state = {
      $iconHolder: this.$ui.getElementById('icon'),
      type: this.getAttribute('type')
    };
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    const $iconHolder = this._state.$iconHolder;

    switch (attr) {

      case 'type':
        handleTypeChange(this, oldVal, newVal);
        break;
      case 'name':
        handleNameChange(this, oldVal, newVal);
        break;
      case 'color':
        $iconHolder.style.fill = newVal || '';
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

  connectedCallback() {
      if (usingShadyCss()) {
        GLOBAL.ShadyCSS.styleElement(this);
      }
  }
}
function handleTypeChange(inst, oldVal, newVal) {
  const state = inst._state;
  state.$iconHolder.textContent = '';
  if (state.type) {
    state.type = null;
  }

  if (newVal && (newVal==='solid' || newVal==='logo')) {
    state.type = newVal;
  }
  else{
    state.type = 'regular';
  } 
  if(state.currentName!== undefined){
    inst.constructor.getIconSvg(state.currentName,state.type)
        .then((iconData) => {
          if (state.type === newVal) {
            state.$iconHolder.innerHTML = iconData;
          }
        })
        .catch((error) => {
          console.error(`Failed to load icon: ${state.currentName + "\n"}${error}`); //eslint-disable-line
        });}
}
function handleNameChange(inst, oldVal, newVal) {
  const state = inst._state;
  state.currentName = newVal;
  state.$iconHolder.textContent = '';

  if (newVal) {
      
    
    
    if(state.type!== undefined){
    inst.constructor.getIconSvg(newVal,state.type)
        .then((iconData) => {
          if (state.currentName === newVal) {
            state.$iconHolder.innerHTML = iconData;
          }
        })
        .catch((error) => {
          console.error(`Failed to load icon: ${newVal + "\n"}${error}`); //eslint-disable-line
        });}
  }
}

function handleSizeChange(inst, oldVal, newVal) {
  const state = inst._state;

  if (state.size) {
    state.$iconHolder.style.width = state.$iconHolder.style.height = '';
    state.size = state.sizeType = null;
  }

    // If the size is not one of the short-hand ones, then it must be a
    // css size unit - add it directly to the icon holder.
  if (newVal && !/^(xs|sm|md|lg)$/.test(state.size)) {
    state.size = newVal.trim();
    state.$iconHolder.style.width = state.$iconHolder.style.height = state.size;
  }
}

export default BoxIconElement;
