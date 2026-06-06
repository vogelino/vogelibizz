import pluginRouter from "@tanstack/eslint-plugin-router";

export default [
  ...pluginRouter.configs["flat/recommended"],
  {
    extends: [
      pluginRouter.configs["flat/recommended"].extends,
      "next/core-web-vitals",
      "prettier",
    ],
  },
];
