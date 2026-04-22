/// <reference types="vite/client" />

declare module '*.md' {
  // From vite-plugin-markdown with Mode.HTML — pre-rendered HTML
  export const html: string;
  // From vite-plugin-markdown with Mode.MARKDOWN — raw markdown source
  export const markdown: string;
}
