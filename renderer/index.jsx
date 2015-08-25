import React from 'react';
import Root from './root.jsx';
import SinkLoader from './sink-loader.js';
import * as StreamApp from './stream-app.js';

global.React = React;

const loader = new SinkLoader();
global.StreamApp = StreamApp;

loader.loadAllSinks(document.head)
      .then(loader.loadPluginAssets(document.head))
      .then(sinks => {
          console.log('Loaded sources: ' + sinks.map(l => `'${l.source}'`).join(' '));

          React.render(
                  <Root router={StreamApp.dispatcher.router} />,
                  document.body
              );

          StreamApp.dispatcher.start();
      });

