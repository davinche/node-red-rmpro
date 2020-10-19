const Device = require("js-broadlink").Device;

module.exports = function (RED) {
  function Temperature(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.on("input", async function (msg, send, done) {
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

      try {
        const data = await device.checkTemperature();
        if (data) {
          node.send({ payload: data });
          node.status({ fill: "green", shape: "dot", text: `temperature read: ${data}°` });
        } else {
          node.status({ fill: "red", shape: "ring", text: "temperature could not be read" });
          node.send({ payload: null });
        }

        if (done) {
          done();
        }
      } catch (e) {
        if (done) {
          done(e);
        } else {
          node.error(e, "error reading data from rmpro");
        }
        node.status({ fill: "red", shape: "dot", text: "error reading data from rmpro" });
      }
    });
  }

  RED.nodes.registerType("temperature", Temperature);
};
