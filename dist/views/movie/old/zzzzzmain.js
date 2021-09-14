var express = require('express');
var proxy = require('express-http-proxy');
var router = express.Router();
var urlParse = require('url').parse;
var controller = require('controller.js');
// 代理直播源
router.get('/videos', controller.videoProxy);
router.use(
  '/tsProxy',
  proxy(
    function(req) {
      var target = urlParse(decodeURIComponent(req.query.url))
      return target.host
    },
    {
      parseReqBody: false, // 去除默认的 body，解决某些播放源 411 问题
      proxyReqPathResolver: function(req) {
        var target = urlParse(decodeURIComponent(req.query.url))
        return target.path
      },
    }
  )
)