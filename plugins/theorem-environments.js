const incrementalBlocks = [
  "Theorem", "Conjecture", "Definition", "Example",
  "Lemma", "Problem", "Proposition", "Corollary",
  "定理", "猜想", "定义", "例", "引理", "问题", "命题", "推论",
];

const otherBlocks = ["Proof", "Remark", "证明", "备注"];

const allBlocks = [...incrementalBlocks, ...otherBlocks];

const OPEN_RE = /^:{3,}\s*(?:\{\s*\.(\S+?)(?:\s+#([\w-]+))?(?:\s+title="([^"]*)")?\s*\}|(\S+?))\s*(?:::*)?\s*$/;
const CLOSE_RE = /^:{3,}\s*$/;

export function theoremEnvironmentPlugin(md) {
  md.block.ruler.before("fence", "theorem_div", (state, startLine, endLine, silent) => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine];
    const maxPos = state.eMarks[startLine];
    const line = state.src.slice(startPos, maxPos);

    const match = OPEN_RE.exec(line);
    if (!match) return false;

    const className = match[1] || match[4];
    if (!allBlocks.includes(className)) return false;

    if (silent) return true;

    const id = match[2] || "";
    const title = match[3] || "";

    let nestLevel = 1;
    let nextLine = startLine + 1;
    while (nextLine < endLine && nestLevel > 0) {
      const pos = state.bMarks[nextLine] + state.tShift[nextLine];
      const max = state.eMarks[nextLine];
      const content = state.src.slice(pos, max);

      if (OPEN_RE.test(content)) {
        nestLevel++;
      } else if (CLOSE_RE.test(content)) {
        nestLevel--;
      }
      nextLine++;
    }

    const tokenOpen = state.push("theorem_open", "div", 1);
    tokenOpen.info = { className, id, title };
    tokenOpen.map = [startLine, nextLine];
    tokenOpen.block = true;

    const contentStart = startLine + 1;
    const contentEnd = nextLine - 1;

    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;
    state.parentType = "theorem";
    state.lineMax = contentEnd;
    state.md.block.tokenize(state, contentStart, contentEnd);
    state.parentType = oldParent;
    state.lineMax = oldLineMax;

    const tokenClose = state.push("theorem_close", "div", -1);
    tokenClose.block = true;

    state.line = nextLine;
    return true;
  });

  md.core.ruler.push("theorem_numbering", (state) => {
    let counter = 1;
    const theoremIndex = new Map();

    for (const token of state.tokens) {
      if (token.type !== "theorem_open") continue;
      const { className, id } = token.info;
      if (incrementalBlocks.includes(className)) {
        token.info.index = counter;
        if (id) {
          theoremIndex.set(id, { type: className, index: counter });
        }
        counter++;
      }
    }

    state.env._theoremIndex = theoremIndex;
  });

  md.core.ruler.push("theorem_crossref", (state) => {
    const theoremIndex = state.env._theoremIndex;
    if (!theoremIndex || theoremIndex.size === 0) return;

    const citeRe = /\[@([\w-]+)\]/g;

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
          const refId = m[1];
          const entry = theoremIndex.get(refId);
          if (!entry) continue;

          hasMatch = true;
          if (m.index > lastIndex) {
            const textToken = new state.Token("text", "", 0);
            textToken.content = child.content.slice(lastIndex, m.index);
            newChildren.push(textToken);
          }

          const linkOpen = new state.Token("link_open", "a", 1);
          linkOpen.attrSet("href", `#${refId}`);
          newChildren.push(linkOpen);

          const linkText = new state.Token("text", "", 0);
          linkText.content = `${entry.type} ${entry.index}`;
          newChildren.push(linkText);

          const linkClose = new state.Token("link_close", "a", -1);
          newChildren.push(linkClose);

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
  });

  md.renderer.rules.theorem_open = (tokens, idx) => {
    const { className, id, title, index } = tokens[idx].info;
    const idAttr = id ? ` id="${id}"` : "";
    const parts = [];
    parts.push(`<div${idAttr} class="${className} theorem-environment">`);
    parts.push(`<span class="theorem-header">`);
    parts.push(`<span class="type">${className}</span>`);
    if (index !== undefined) {
      parts.push(`<span class="index">${index}</span>`);
    }
    if (title) {
      const renderedTitle = md.renderInline(title);
      parts.push(`<span class="name">${renderedTitle}</span>`);
    }
    parts.push(`</span>`);
    return parts.join("");
  };

  md.renderer.rules.theorem_close = () => {
    return "</div>\n";
  };
}
