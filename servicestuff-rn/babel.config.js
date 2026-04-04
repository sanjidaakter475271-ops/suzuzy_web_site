module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@features": "./src/features",
            "@lib": "./src/lib",
            "@hooks": "./src/hooks",
            "@stores": "./src/stores",
            "@constants": "./src/constants",
            "@types": "./src/types",
            "@utils": "./src/utils",
          },
        },
      ],
    ],
  };
};
