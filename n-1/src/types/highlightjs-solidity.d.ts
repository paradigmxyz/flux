declare module "highlightjs-solidity" {
  import { HLJSApi, LanguageFn } from "highlight.js";

  export const solidity: LanguageFn;
  export const yul: LanguageFn;

  function hljsDefineSolidity(hljs: HLJSApi): void;

  export default hljsDefineSolidity;
}
