var axios = require('axios')
var controller = {};

controller.videoProxy = function(req, res) {
  try {
    var url = decodeURIComponent(req.query.url)
    var parseUrl = urlParse(url)
    var domain = parseUrl.protocol + '//' + parseUrl.host // http 域名地址
    var m3u8Path = url.match(/\S+\//)[0] // http 至最后一个 '/' 字符
    axios
      .get(url)
      .then(resp => {
        var headers = resp.headers
        var content = resp.data
        // 内容为 ts 文件地址则使用 tsProxy 的 path
        var path = /BANDWIDTH/i.test(content)
          ? '/school/videos?url='
          : '/school/tsProxy?url='

        // 头部信息全部返回
        for (var key in headers) {
          res.append(key, headers[key])
        }

        // 对 data 中目标文件字符串做处理
        content = content.replace(/(?:\n)([^# \n]+\.\S+)/g, function(_, match) {
          // 绝对地址，不做任何修改
          if (/^http/.test(match)) {
            return '\n' + path + encodeURIComponent(match)
          }
          // 相对地址：有文件结构的相对地址直接加域名，否则加上带 path 的域名
          return (
            '\n' +
            path +
            encodeURIComponent((/^\//g.test(match) ? domain : m3u8Path) + match)
          )
        })
        res.send(content)
      })
      .catch(e => {
        res.json({
          code: (e.response && e.response.status) || 404,
          message: e.message || '',
          success: false
        })
      })
  } catch (e) {
    res.json({
      code: 400,
      message: 'URI must be not empty!',
      success: false
    })
  }
}
module.exports = controller;