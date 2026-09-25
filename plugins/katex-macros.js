// Custom TeX macros. Keep in sync with the client-side copies in
// src/_includes/layouts/default.njk and cndefault.njk.
export const katexMacros = {
  "\\C": "\\mathbb{C}",
  "\\F": "\\mathbb{F}",
  "\\e": "\\varepsilon",
  "\\eps": "\\varepsilon",
  "\\mex": "\\mathop{\\operatorname{mex}}",
  "\\lcm": "\\mathop{\\operatorname{lcm}}",
  "\\dist": "\\mathop{\\operatorname{dist}}",
  "\\bigtriangleright": "{\\mathop{\\Large \\triangleright}}",
  "\\bigtriangleleft": "{\\mathop{\\Large \\triangleleft}}",
  "\\set": "\\left\\{ #1 \\right\\}",
  "\\floor": "\\left\\lfloor #1 \\right\\rfloor",
  "\\ceil": "\\left\\lceil #1 \\right\\rceil",
  "\\abs": "\\left\\| #1 \\right\\|",
};
