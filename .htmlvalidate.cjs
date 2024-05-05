const defineConfig = require("html-validate").defineConfig;

module.exports = defineConfig({
    extends: ["html-validate:recommended"],
    rules: {
        "doctype-style": "off",
    },
});

