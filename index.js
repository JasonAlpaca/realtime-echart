function Constructor(config) {
  let server = require("./serve")();
  server.setConfig(config);

  function setOption(option) {
    server.setOption(option);
  }

  return {
    setOption,
  };
}

module.exports = Constructor;
