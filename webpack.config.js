const path = require('path');
const webpack = require('webpack');
const WrapperPlugin = require('wrapper-webpack-plugin');
const packageJson = require('./package.json');

module.exports = {
  entry: `${__dirname}/src/index.js`,
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: 'BoxIconElement',
    libraryTarget: 'umd',
    filename: 'boxicons.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
              ['env', { modules: false, targets: { uglify: true } }],
          ],
          plugins: [
            ['babel-plugin-transform-builtin-classes', {
              globals: ['Array', 'Error', 'HTMLElement'],
            }],
          ],
        },
      },
      {
        test: /\.css$/,
        use: [
            { loader: 'to-string-loader' },
          {
            loader: 'css-loader',
            options: {
              camelCase: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'BUILD.DATA': {
        VERSION: JSON.stringify(packageJson.version),
      },
    }),
    new WrapperPlugin({
      test: /boxicons\.js$/,
      header: getWrapper('header'),
      footer: getWrapper('footer'),
    }),
  ],
};

function getWrapper(type) {
  if (getWrapper.header) {
    return getWrapper[type];
  }

  const templatePieces = `(function (
    DEFAULT_CDN_PREFIX,   
    STRING_WEB_COMPONENTS_REQUESTED,
    WINDOW,
    DOCUMENT,
    init
) {
    /**
     * A Custom Elements (Web Components) polyfill loader wrapper.
     * Use it to wrap modules that use CEs and it will take care of
     * only executing the module initialization function when the
     * polyfill is loaded.
     * This loader wrapper also loads the \`core-js\` library if it
     * finds that he current environment does not support Promises
     * (ex. IE)
     *
     * The loader contains default URLs for polyfills, however, these
     * can be overwritten with the following globals:
     *
     * -    \`window.WEB_COMPONENTS_POLYFILL\`
     * -    \`window.ES6_CORE_POLYFILL\`
     *
     * In addition, this loader will add the following global
     * variable, which is used to store module initialization
     * functions until the environment is patched:
     *
     * -    \`window.AWAITING_WEB_COMPONENTS_POLYFILL\`: an Array 
     *      with callbacks. To store a new one, use
     *      \`window.AWAITING_WEB_COMPONENTS_POLYFILL.then(callbackHere)\`
     */
    if (!('customElements' in WINDOW)) {
        
        // If in the mist of loading the polyfills, then just add init to when that is done
        if (WINDOW[STRING_WEB_COMPONENTS_REQUESTED]) {
            WINDOW[STRING_WEB_COMPONENTS_REQUESTED].then(init);
            return;
        }
        
        var _WEB_COMPONENTS_REQUESTED = WINDOW[STRING_WEB_COMPONENTS_REQUESTED] = getCallbackQueue();
        _WEB_COMPONENTS_REQUESTED.then(init);
        
        var WEB_COMPONENTS_POLYFILL = WINDOW.WEB_COMPONENTS_POLYFILL || "/" + "/" + DEFAULT_CDN_PREFIX + "/webcomponentsjs/2.0.2/webcomponents-bundle.js";
        var ES6_CORE_POLYFILL = WINDOW.ES6_CORE_POLYFILL || "/" + "/" + DEFAULT_CDN_PREFIX + "/core-js/2.5.3/core.min.js";
        
        if (!("Promise" in WINDOW)) {
            loadScript(ES6_CORE_POLYFILL)
                .then(function () {
                    loadScript(WEB_COMPONENTS_POLYFILL).then(function () {
                      _WEB_COMPONENTS_REQUESTED.isDone = true;
                      _WEB_COMPONENTS_REQUESTED.exec();
                    });
                });
        } else {
            loadScript(WEB_COMPONENTS_POLYFILL).then(function () {
              _WEB_COMPONENTS_REQUESTED.isDone = true;
              _WEB_COMPONENTS_REQUESTED.exec();
            });
        }
    } else {
        init();
    }
    
    function getCallbackQueue() {
        var callbacks = [];
        callbacks.isDone = false;
        callbacks.exec = function () {
            callbacks.splice(0).forEach(function (callback) {
                callback();
            });
        };
        callbacks.then = function(callback){
            if (callbacks.isDone) {
                callback();
            } else {
                callbacks.push(callback);
            }
            return callbacks;
        }
        return callbacks;
    }
    
    function loadScript (url) {
        var callbacks = getCallbackQueue();
        var script = DOCUMENT.createElement("script")
        
        script.type = "text/javascript";

        if (script.readyState){ // IE
            script.onreadystatechange = function(){
                if (script.readyState == "loaded" || script.readyState == "complete"){
                    script.onreadystatechange = null;
                    callbacks.isDone = true;
                    callbacks.exec();
                }
            };
        } else {
            script.onload = function(){
                callbacks.isDone = true;
                callbacks.exec();
            };
        }

        script.src = url;
        DOCUMENT.getElementsByTagName("head")[0].appendChild(script);
        
        script.then = callbacks.then;
        return script;
    }

})(
    "cdnjs.cloudflare.com/ajax/libs",
    "AWAITING_WEB_COMPONENTS_POLYFILL",  // Global wait queue var name
    window,
    document,
    function () {
____SPLIT_HERE____
    }
);`.split('____SPLIT_HERE____');

  getWrapper.header = templatePieces[0];
  getWrapper.footer = templatePieces[1];

  return getWrapper[type];
}

