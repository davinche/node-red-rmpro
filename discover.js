const Discover = require("js-broadlink").Discover;

module.exports = function (RED) {
  function DiscoverDevices(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.on("input", async function (msg, send, done) {
      send =
        send ||
        function () {
          node.send.apply(node, arguments);
        };

      try {
        const devices = [];
        const timeout = parseInt(config.timeout || msg.payload, 10);
        const stream = Discover(timeout * 1000);
        stream.listen(function (device) {
          devices.push(device);
        });
        const sleep = function (s) {
          return new Promise(function (resolve) {
            setTimeout(resolve, s * 1000);
          });
        };
        await sleep(timeout);

        if (!devices.length) {
          node.status({ fill: "red", shape: "ring", text: "no devices found" });
          return;
        }

        const data = devices.map(function (d) {
          return {
            deviceType: d.deviceType,
            ip: d.hostport.split(":")[0],
            macAddress: d.macAddress,
          };
        });

        node.status({ fill: "green", shape: "dot", text: "devices found" });
        send({ payload: data });
      } catch (e) {
        if (done) {
          done(e);
        } else {
          node.error(e, "could not discover rmpro");
        }
        node.status({ fill: "red", shape: "dot", text: "could not find any rmpros" });
      }
      if (done) done();
    });
  }

  RED.nodes.registerType("discover", DiscoverDevices);
};
