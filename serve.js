let getport = require("getport");
let fs = require("fs");
let express = require("express");
let dport = 21000;
module.exports = function Constructor() {
  var app = express();

  require("express-ws")(app);

  var config = { title: "Realtime Echart", option: {} };

  function file(url, local, formatter = (x) => x) {
    app.get(url, function (req, res) {
      res.set("Content-Type", "text/html");
      let data = req.body;
      fs.readFile(local, "utf-8", function (error, data) {
        res.send(formatter(data));
        res.end();
      });
    });
  }

  app.use(express.json());

  let wsSet = new Set();
  app.ws("/update", function (ws, req) {
    wsSet.add(ws);
    ws.send(JSON.stringify(config.option));
    ws.on("close", function (msg) {
      wsSet.delete(ws);
    });
    ws.on("message", function (msg) {
      console.log(msg);
    });
  });

  getport(dport, function (e, p) {
    if (e) console.log(e);
    var server = app.listen(p, "localhost", function () {
      var host = server.address().address;
      var port = server.address().port;
      file("/", __dirname + "/index.html", (x) => {
        return x
          .replace("<!!!-WebSocket-Url-!!!>", `ws://${host}:${port}/update`)
          .replace("<!!!-Title-!!!>", config.title);
      });
      console.log("%s: http://%s:%s", config.title, host, port);
    });
  });
  dport++;
  file("/echarts.min.js", "node_modules/echarts/dist/echarts.min.js");

  return {
    setConfig: function (inputConfig) {
      Object.assign(config, inputConfig);
    },
    setOption: function (option) {
      config.option = option
      wsSet.forEach((ws) => {
        ws.send(JSON.stringify(option));
      });
    },
  };
};
