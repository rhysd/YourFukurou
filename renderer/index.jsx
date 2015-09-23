import React from 'react/addons';
import Root from './components/root.jsx';
import AppMenuBody from './components/app-menu-body.jsx';
import SinkLoader from './sink-loader';
import * as StreamApp from './stream-app';
import KeymapHandler from './keymap-handler';
import * as MenuActions from './menu-actions';

global.StreamApp = StreamApp;
global.React = React; 
const loader = new SinkLoader();

// TODO: Temporary mappings
let keymap_handler = new KeymapHandler();

loader.loadAllSinks(document.head)
      .then(loader.loadPluginAssets(document.head))
      .then(sinks => {

          MenuActions.addMenuItem(
                  "_",
                  <i className="fa fa-bars fa-2x"/>,
                  <AppMenuBody/>
              );

          for (const s of sinks) {
              if (s.menu && s.menu.item && s.menu.body) {
                  MenuActions.addMenuItem(s.source, s.menu.item, s.menu.body);
              }
          }

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
              "mod+shift+i": "ToggleDevTools",
              "m": "ToggleMenu"
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

