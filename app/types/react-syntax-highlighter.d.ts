// This declaration file provides minimal type definitions for the
// `react-syntax-highlighter` package, which does not ship its own
// TypeScript declarations. Without these declarations, TypeScript
// compilation fails with "cannot find a declaration file for module"
// errors when importing SyntaxHighlighter components in CodeBlock.tsx.

declare module 'react-syntax-highlighter' {
  // Export a generic Prism component typed as `any` to satisfy TypeScript.
  export const Prism: any;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  // Export common style objects used by react-syntax-highlighter, typed as `any`.
  export const oneDark: any;
  export const defaultStyle: any;
  export const coy: any;
  export const dark: any;
  export const funky: any;
  export const okaidia: any;
  export const solarizedlight: any;
  export const tomorrow: any;
  export const twilight: any;
  export const prism: any;
  export const atomDark: any;
  export const base16AteliersulphurpoolLight: any;
}