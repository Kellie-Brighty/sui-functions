module.exports = {
  apps: [
    {
      name: "sui-operator-1",
      script: "dist/listener.js",
      interpreter: "/usr/bin/node",
      env: {
        PACKAGE_ID: "0x24efc151bdf08afcdbe857e34b5bbc5cebf03feef2b076fa4904af481e2e6bb1",
        PROTOCOL_TREASURY_ID: "0x24d4f1ab704659bcc694e8667bec4af44725db6d262ab8742bb2df237189e3fb",
        REGISTRY_ID: "0xeb24efabffbc663e1e59c9e1420a0424a4142a12db78138ce1e05ceb51f83c9f",
        OPERATOR_KEY_PATH: "/root/.sui-functions/node1.json"
      }
    },
    {
      name: "sui-operator-2",
      script: "dist/listener.js",
      interpreter: "/usr/bin/node",
      env: {
        PACKAGE_ID: "0x24efc151bdf08afcdbe857e34b5bbc5cebf03feef2b076fa4904af481e2e6bb1",
        PROTOCOL_TREASURY_ID: "0x24d4f1ab704659bcc694e8667bec4af44725db6d262ab8742bb2df237189e3fb",
        REGISTRY_ID: "0xeb24efabffbc663e1e59c9e1420a0424a4142a12db78138ce1e05ceb51f83c9f",
        OPERATOR_KEY_PATH: "/root/.sui-functions/node2.json"
      }
    },
    {
      name: "sui-operator-3",
      script: "dist/listener.js",
      interpreter: "/usr/bin/node",
      env: {
        PACKAGE_ID: "0x24efc151bdf08afcdbe857e34b5bbc5cebf03feef2b076fa4904af481e2e6bb1",
        PROTOCOL_TREASURY_ID: "0x24d4f1ab704659bcc694e8667bec4af44725db6d262ab8742bb2df237189e3fb",
        REGISTRY_ID: "0xeb24efabffbc663e1e59c9e1420a0424a4142a12db78138ce1e05ceb51f83c9f",
        OPERATOR_KEY_PATH: "/root/.sui-functions/node3.json"
      }
    },
    {
      name: "log-truncator",
      script: "dist/log_truncator.js",
      interpreter: "/usr/bin/node",
      out_file: "/dev/null",
      error_file: "/dev/null"
    }
  ]
};
