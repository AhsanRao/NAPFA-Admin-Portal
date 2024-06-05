const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  const apiProxy = createProxyMiddleware({
    target: 'http://13.49.228.139:5000',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '', // remove /api from the proxy path
    },
  });
  apiProxy(req, res, (result) => {
    if (result instanceof Error) {
      throw result;
    }
    return result;
  });
};
