import React from 'react/addons';
import Root from './root.jsx';
import SinkLoader from './sink-loader.js';
import * as StreamApp from './stream-app.js';

global.StreamApp = StreamApp;
global.React = React;

const loader = new SinkLoader();

loader.loadAllSinks(document.head)
      .then(loader.loadPluginAssets(document.head))
      .then(sinks => {
          console.log('Loaded sources: ' + sinks.map(l => `'${l.source}'`).join(' '));

          React.render(
                  <Root router={StreamApp.router} />,
                  document.body
              );

          StreamApp.router.start();
      });

