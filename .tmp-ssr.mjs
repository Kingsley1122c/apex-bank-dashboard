import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.jsx';

try {
  const html = renderToString(React.createElement(App));
  console.log('SSR_OK');
  console.log(html.slice(0, 500));
} catch (error) {
  console.error('SSR_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
}
