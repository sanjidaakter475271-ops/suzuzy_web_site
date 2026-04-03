module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "react-native-css-interop" }],
      "nativewind/babel",
    ],
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
