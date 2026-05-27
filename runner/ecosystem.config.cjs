module.exports = {
  apps: [
    {
      name: "sui-operator-1",
      script: "dist/listener.js",
      env: {
        PACKAGE_ID: "0x8899b503f5f097546c61b698296ce44bc1f37251c3b7f3fa92d6e8036231dd30",
        PROTOCOL_TREASURY_ID: "0xa659782f25f332b3e947ef4557cd783ce182df87d0dcc71ad22069e7b8f0d789",
        REGISTRY_ID: "0x0",
        OPERATOR_KEY_PATH: "/root/.sui-functions/node1.json"
      }
    },
    {
      name: "sui-operator-2",
      script: "dist/listener.js",
      env: {
        PACKAGE_ID: "0x8899b503f5f097546c61b698296ce44bc1f37251c3b7f3fa92d6e8036231dd30",
        PROTOCOL_TREASURY_ID: "0xa659782f25f332b3e947ef4557cd783ce182df87d0dcc71ad22069e7b8f0d789",
        REGISTRY_ID: "0x0",
        OPERATOR_KEY_PATH: "/root/.sui-functions/node2.json"
      }
    },
    {
      name: "sui-operator-3",
      script: "dist/listener.js",
      env: {
        PACKAGE_ID: "0x8899b503f5f097546c61b698296ce44bc1f37251c3b7f3fa92d6e8036231dd30",
        PROTOCOL_TREASURY_ID: "0xa659782f25f332b3e947ef4557cd783ce182df87d0dcc71ad22069e7b8f0d789",
        REGISTRY_ID: "0x0",
        OPERATOR_KEY_PATH: "/root/.sui-functions/node3.json"
      }
    }
  ]
};
