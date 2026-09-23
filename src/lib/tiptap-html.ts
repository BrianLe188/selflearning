import { JSDOM } from "jsdom";
import { generateHTML } from "@tiptap/core";
import type { JSONContent } from "@tiptap/react";
import { contentExtensions } from "@/components/editor/extensions";

// Tiptap's generateHTML uses ProseMirror's DOMSerializer, which reaches for
// `window`/`document` even outside a browser. Not guarded by `server-only`
// so both the Next.js server actions and the standalone migration script
// (a plain Bun script, outside Next's react-server bundler condition) can
// use it.
let domInstalled = false;
function ensureDom() {
  if (domInstalled) return;
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  Object.assign(global, {
    window: dom.window,
    document: dom.window.document,
  });
  domInstalled = true;
}

/** Renders a Tiptap document to HTML once, at publish time. */
export function renderContentJsonToHtml(json: JSONContent): string {
  if (!json?.content?.length) return "";
  ensureDom();
  return generateHTML(json, contentExtensions);
}
