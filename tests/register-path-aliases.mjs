import { register } from "node:module";

register(new URL("./path-alias-loader.mjs", import.meta.url));
