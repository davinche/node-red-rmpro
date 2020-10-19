const Device = require("js-broadlink").Device;

module.exports = function (RED) {
  function SendData(config) {
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
      const data = Buffer.from(msg.payload.data, "base64");
      device.sendData(data);
      node.status({ fill: "green", shape: "dot" });
      if (done) done();
    });
  }

  RED.nodes.registerType("send-data", SendData);
};
