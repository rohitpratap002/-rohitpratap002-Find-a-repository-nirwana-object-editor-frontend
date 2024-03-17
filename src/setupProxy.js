const { createProxyMiddleware } = require('http-proxy-middleware');
import {SERVER_URL} from './Components/Constant';

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: SERVER_URL, // Change this to your server URL
      changeOrigin: true,
    })
  );
};
