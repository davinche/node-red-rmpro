const Device = require("js-broadlink").Device;

module.exports = function (RED) {
  function Learning(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.on("input", function (msg, send, done) {
      send =
        send ||
        function () {
          node.send.apply(node, arguments);
        };

      const deviceType = parseInt(config.deviceType || msg.payload.deviceType, 10);
      const macAddress = config.macAddress || msg.payload.macAddress;
      const ip = config.ip || msg.payload.ip;

      if (!(deviceType && macAddress && ip)) {
        const err = new Error("missing connection configuration");
        if (done) {
          done(err);
        } else {
          node.error(err, "could not connect");
        }
        node.status({ fill: "red", shape: "dot", text: "missing connection config" });
        return;
      }

      const device = new Device(deviceType, macAddress, ip, 80);
      if (mode === "enter") {
        device.enterLearning();
        node.status({ fill: "green", shape: "dot", text: "entered learning mode" });
      } else {
        device.exitLearning();
        node.status({ fill: "red", shape: "ring", text: "exited learning mode" });
      }

      if (done) done();
    });
  }

  RED.nodes.registerType("learning", Learning);
};
