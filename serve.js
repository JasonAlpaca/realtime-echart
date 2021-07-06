var express = require("express");
var app = express();
var fs = require("fs")
require('express-ws')(app);

var config = {title: 'Realtime Echart',option: {}}

function file(url,local,formatter = x => x){
  app.get(url, function (req, res) {
    res.set('Content-Type', 'text/html');
    let data = req.body;
    fs.readFile(local, "utf-8", function(error, data) {
      res.send(formatter(data));
      res.end();
    });
  });
}

app.use(express.json());

let wsSet = new Set()
app.ws('/update', function(ws, req) {
  wsSet.add(ws)
  ws.send(JSON.stringify(initOption))
  ws.on('close', function(msg) {
    wsSet.delete(ws)
  });
  ws.on('message', function(msg) {
    console.log(msg)
  });
});

var getport = require('getport')

getport(function (e, p) {
  if (e) throw e
  var server = app.listen(p, "localhost", function () {
    var host = server.address().address;
    var port = server.address().port;
    file("/","index.html",(x)=>{
      return x
        .replace("<!!!-WebSocket-Url-!!!>",`ws://${host}:${port}/update`)
        .replace("<!!!-Title-!!!>",config.title)
    })
    console.log("See it here, http://%s:%s", host, port);
  });
})

file("/echarts.min.js","node_modules/echarts/dist/echarts.min.js")

exports.setConfig = function (inputConfig) {
  Object.assign(config,inputConfig)
}
exports.setOption = function (option) {
  wsSet.forEach(ws => {
    ws.send(JSON.stringify(option))
  })
}
