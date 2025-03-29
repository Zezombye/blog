import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Prism from "prismjs";
import "prismjs/themes/prism-twilight.css";

const app = createApp(App);

app.use(router);

app.mount("#app");

app.config.globalProperties.Prism = Prism;

import CodeBlock from "./components/CodeBlock.vue";
app.component("CodeBlock", CodeBlock);
import CodeLine from "./components/CodeLine.vue";
app.component("CodeLine", CodeLine);

Prism.languages.overpy = {
    comment: [
        {
            pattern: /#[^!].*$/m,
            lookbehind: false,
        },
        {
            pattern: /\/\*[\s\S]*?\*\//,
            greedy: true,
        },
    ],
    macro: {
        pattern: /#!(?:(?!\n)[\s\S])*(?<!\\)\n/,
        greedy: true,
    },
    stringModifier: [
        {
            pattern: /\b[a-z]+(?=")/,
        },
        {
            pattern: /\b[a-z]+(?=')/,
        },
    ],
    string: [
        {
            pattern: /"(?:\\(?:[\\\"'nrtzbf]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|&\w+;)|[^\\"\r\n])*"/,
            greedy: true,
            inside: {
                escape: {
                    pattern: /\\(?:[\\\"'nrtzbf]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|&\w+;)/,
                },
            },
        },
        {
            pattern: /'(?:\\(?:[\\\"'nrtzbf]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|&\w+;)|[^\\'\r\n])*'/,
            greedy: true,
            inside: {
                escape: {
                    pattern: /\\(?:[\\\"'nrtzbf]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|&\w+;)/,
                },
            },
        },
    ],
    goto: {
        pattern: /\bgoto\s*[A-Za-z\d_]+$/m,
        inside: {
            keyword: {
                pattern: /\bgoto\b/,
            },
            label: {
                pattern: /[A-Za-z\d_]+/,
            },
        },
    },
    keyword: {
        pattern:
            /\b(?:if|else|elif|do|while|for|return|continue|false|true|null|goto|lambda|pass|del|break|switch|case|default|def|rule|settings|globalvar|playervar|subroutine|unsigned|signed|int|float|bool|enum)\b/,
        lookbehind: false,
    },
    number: {
        pattern: /\b[+-]?(\d*\.)?\d+\b/,
    },
    operator: {
        pattern:
            /\b(?:and|or|not|in)\b|(?:(?:\+|-|\*\*|\/|%|\*|<|>)=?)|(?:=)|\.|(?:(?:min|max|!)=)/,
        lookbehind: false,
    },
    labelWrapper: {
        pattern: /^\s*[A-Za-z\d_]+:$/m,
        inside: {
            label: {
                pattern: /[A-Za-z\d_]+/,
            },
        }
    },
    variable: {
        pattern:
            /\b(?:eventPlayer|attacker|victim|eventDamage|eventHealing|eventWasCriticalHit|eventWasEnvironment|eventWasHealthPack|eventAbility|eventDirection|healee|healer|hostPlayer|localPlayer|loc|RULE_CONDITION|RULE_START|__\w+__|[A-Z]|[A-D][A-Z])\b/,
        lookbehind: false,
    },
    annotationWrapper: {
        pattern: /(@(Event|Team|Slot|Hero))(\s+)(\w+)?/,
        greedy: true,
        inside: {

    annotation: {
        pattern: /@\w+/,
    },
            annotationArg: {
                pattern: /\b\w+$/,
            },
        },
    },
    annotation: {
        pattern: /@\w+/,
    },
    annotationArg: [
        {
            pattern: /(?<=@Event )\w+\b/,
        },
        {
            pattern: /(?<=@Team )\w+\b/,
        },
        {
            pattern: /(?<=@Slot )\w+\b/,
        },
        {
            pattern: /(?<=@Hero )\w+\b/,
        },
    ],
    invalid: {
        pattern:
            /\b(?:False|True|None|Null|class|finally|is|try|from|nonlocal|with|as|yield|assert|except|raise|disabled|import)\b/,
    },
    enum: {
        pattern: /\b[A-Z_\d]+\b/,
    },
    function: {
        pattern: /\b\w+(?=\()/,
        lookbehind: false,
    },
    class: {
        pattern: /\b[A-Z][a-z_]\w*\b/,
    },
};
