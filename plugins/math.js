export function mathPlugin(md) {
  md.inline.ruler.after("escape", "math_inline", (state, silent) => {
    if (state.src[state.pos] !== "$") return false;
    if (state.src[state.pos + 1] === "$") return false;

    const start = state.pos + 1;
    let end = start;
    while (end < state.posMax) {
      if (state.src[end] === "$" && state.src[end - 1] !== "\\") break;
      end++;
    }
    if (end >= state.posMax) return false;
    if (start === end) return false;

    if (!silent) {
      const token = state.push("math_inline", "span", 0);
      token.markup = "$";
      token.content = state.src.slice(start, end);
    }

    state.pos = end + 1;
    return true;
  });

  md.block.ruler.before("fence", "math_block", (state, startLine, endLine, silent) => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine];
    const maxPos = state.eMarks[startLine];
    const line = state.src.slice(startPos, maxPos);

    if (!line.startsWith("$$")) return false;

    if (line.length > 2 && line.endsWith("$$") && line.length > 4) {
      if (!silent) {
        const token = state.push("math_block", "div", 0);
        token.content = line.slice(2, -2).trim();
        token.map = [startLine, startLine + 1];
      }
      state.line = startLine + 1;
      return true;
    }

    let nextLine = startLine + 1;
    while (nextLine < endLine) {
      const pos = state.bMarks[nextLine] + state.tShift[nextLine];
      const max = state.eMarks[nextLine];
      const nextContent = state.src.slice(pos, max);
      if (nextContent.trim() === "$$") {
        if (!silent) {
          const token = state.push("math_block", "div", 0);
          token.content = state.src
            .slice(state.bMarks[startLine + 1], state.bMarks[nextLine])
            .trim();
          if (line.trim() !== "$$") {
            token.content = line.slice(2).trim() + "\n" + token.content;
          }
          token.map = [startLine, nextLine + 1];
        }
        state.line = nextLine + 1;
        return true;
      }
      nextLine++;
    }

    return false;
  });

  md.renderer.rules.math_inline = (tokens, idx) => {
    return `<span class="math">${escapeHtml(tokens[idx].content)}</span>`;
  };

  md.renderer.rules.math_block = (tokens, idx) => {
    return `<span class="math display">${escapeHtml(tokens[idx].content)}</span>\n`;
  };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
