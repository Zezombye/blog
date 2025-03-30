import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default [
    {
        name: "app/files-to-lint",
        files: ["**/*.{js,mjs,jsx,vue}"],

    },

    {
        name: "app/files-to-ignore",
        ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"],
    },

    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                }
            }
        }
    },

    js.configs.recommended,
    ...pluginVue.configs["flat/essential"],

    {
        rules: {
            "vue/multi-word-component-names": "off",
            "no-unused-vars": "warn",
        }
    }
];
