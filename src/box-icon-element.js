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
  width: 1rem;
  height: 1rem;
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

    this.$iconHolder = this.$ui.getElementById('icon');
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    // handle live changes
  }
}
