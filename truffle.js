module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  },
  // solc: {
  //   optimizer: { // Turning on compiler optimization that removes some local variables during compilation
  //     enabled: true,
  //     runs: 200
  //   }
  // }
};
