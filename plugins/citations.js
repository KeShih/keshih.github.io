import fs from "fs";
import { Cite } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";

let bibData = null;
let cslTemplate = null;

function loadBib(bibFile) {
  if (bibData) return bibData;
  const bibContent = fs.readFileSync(bibFile, "utf8");
  bibData = new Cite(bibContent);
  return bibData;
}

function loadCsl(cslFile) {
  if (cslTemplate) return cslTemplate;
  cslTemplate = fs.readFileSync(cslFile, "utf8");
  return cslTemplate;
}

export function citationPlugin(md, options = {}) {
  const { bibFile, cslFile } = options;

  md.core.ruler.push("citations", (state) => {
    const citeRe = /\[@([\w-]+)\]/g;
    const citedKeys = new Set();

    for (const token of state.tokens) {
      if (token.type !== "inline" || !token.children) continue;

      const newChildren = [];
      for (const child of token.children) {
        if (child.type !== "text") {
          newChildren.push(child);
          continue;
        }

        let lastIndex = 0;
        let m;
        citeRe.lastIndex = 0;
        let hasMatch = false;

        while ((m = citeRe.exec(child.content)) !== null) {
          const key = m[1];

          let bib;
          try {
            bib = loadBib(bibFile);
          } catch {
            newChildren.push(child);
            break;
          }

          const entry = bib.data.find((e) => e.id === key);
          if (!entry) continue;

          hasMatch = true;
          citedKeys.add(key);

          if (m.index > lastIndex) {
            const textToken = new state.Token("text", "", 0);
            textToken.content = child.content.slice(lastIndex, m.index);
            newChildren.push(textToken);
          }

          const cite = new Cite([entry]);
          const rendered = cite.format("citation", {
            template: cslFile ? loadCsl(cslFile) : undefined,
            lang: "en-US",
          });

          const htmlOpen = new state.Token("html_inline", "", 0);
          htmlOpen.content = `<a href="#ref-${key}" class="citation">${rendered}</a>`;
          newChildren.push(htmlOpen);

          lastIndex = m.index + m[0].length;
        }

        if (hasMatch) {
          if (lastIndex < child.content.length) {
            const textToken = new state.Token("text", "", 0);
            textToken.content = child.content.slice(lastIndex);
            newChildren.push(textToken);
          }
        } else {
          newChildren.push(child);
        }
      }
      token.children = newChildren;
    }

    if (citedKeys.size > 0) {
      let bib;
      try {
        bib = loadBib(bibFile);
      } catch {
        return;
      }

      const citedEntries = bib.data.filter((e) => citedKeys.has(e.id));
      if (citedEntries.length === 0) return;

      const refCite = new Cite(citedEntries);
      const bibliography = refCite.format("bibliography", {
        format: "html",
        template: cslFile ? loadCsl(cslFile) : undefined,
        lang: "en-US",
      });

      const headingOpen = new state.Token("heading_open", "h2", 1);
      headingOpen.attrSet("id", "references");
      state.tokens.push(headingOpen);

      const headingInline = new state.Token("inline", "", 0);
      headingInline.content = "References";
      headingInline.children = [];
      const textToken = new state.Token("text", "", 0);
      textToken.content = "References";
      headingInline.children.push(textToken);
      state.tokens.push(headingInline);

      const headingClose = new state.Token("heading_close", "h2", -1);
      state.tokens.push(headingClose);

      const htmlBlock = new state.Token("html_block", "", 0);
      htmlBlock.content = `<div class="references">${bibliography}</div>\n`;
      state.tokens.push(htmlBlock);
    }
  });
}
