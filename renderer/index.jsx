import React from 'react/addons';
import Root from './components/root.jsx';
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
          let keymap_handler = new KeymapHandler({
              "j": "FocusNext",
              "k": "FocusPrev",
              "g g": "FocusFirst",
              "shift+g": "FocusLast",
              "t": "ToggleDevTools"
          });

          for (const sink of sinks) {
              if (sink.local_keymaps !== undefined) {
                  keymap_handler.registerKeyMaps(sink.source, sink.local_keymaps);
              }

              if (sink.action_map !== undefined) {
                  keymap_handler.registerActions(sink.source, sink.action_map);
              }
          }

          global.StreamApp.keymap_handler = keymap_handler;
      });

