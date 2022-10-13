module.exports = {
  apps: [
    {
      name: "integrador-cuenti-tienddi",
      script: "main.js",
      instances: "1",
      exec_mode: "cluster",
    },
  ],
};
