import React from 'react/addons';
import Root from './root-component.jsx';
import SinkLoader from './sink-loader.js';
import * as StreamApp from './stream-app.js';
import KeymapHandler from './keymap-handler.js';

global.StreamApp = StreamApp;
global.React = React;

const loader = new SinkLoader();

// TODO: Temporary mappings
let keymap_handler = new KeymapHandler();

loader.loadAllSinks(document.head)
      .then(loader.loadPluginAssets(document.head))
      .then(sinks => {
          console.log('Loaded sources: ' + sinks.map(l => `'${l.source}'`).join(' '));

          React.render(
                  <Root router={StreamApp.router} />,
                  document.body
              );

          StreamApp.router.start();

          // TODO: Temporary keymaps
          keymap_handler.registerKeyMaps({
              "j": "FocusNext",
              "k": "FocusPrev",
              "g g": "FocusFirst",
              "shift+g": "FocusLast"
          });
      });

