import React from 'react';
import Root from './root.jsx';
import SinkLoader from './sink-loader.js';
import StreamApp from './stream-app.js';

global.React = React;

const loader = new SinkLoader();
global.StreamApp = new StreamApp();

loader.loadAllSinks(document.head)
      .then(loader.loadPluginAssets(document.head))
      .then(sinks => {
          console.log('Loaded sources: ' + sinks.map(l => `'${l.source}'`).join(' '));

          React.render(
                  <Root router={global.StreamApp.router} />,
                  document.body
              );

          global.StreamApp.startReceiving();
      });

