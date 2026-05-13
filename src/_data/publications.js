import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import markdownIt from "markdown-it";
import { mathPlugin } from "../../plugins/math.js";

const md = markdownIt({ html: true });
md.use(mathPlugin);

function renderInline(text) {
  if (!text) return "";
  return md.renderInline(text);
}

function renderBlock(text) {
  if (!text) return "";
  return md.render(text);
}

function coauthorList(authors, people) {
  return authors.map((name) => ({
    name,
    link: people[name] || "",
  }));
}

function buildPaper(paper, meta) {
  const result = { ...paper };
  result.show = result.show || [];
  result.title = renderInline(result.title);
  result.authors = coauthorList(result.authors || [], meta.people);

  if (result.notes) {
    result.notes = result.notes.map(renderInline);
  }
  if (result.pub) {
    result.pub = {
      name: result.pub,
      venue: meta.venues[result.pub] || result.pub,
    };
  }
  if (result.abstract) {
    result.show.push("a");
    result.abstract = renderBlock(result.abstract);
  }
  if (result.dedication) {
    result.dedication = renderInline(result.dedication);
  }
  result.selected = result.selected ? "cv-selected" : "cv-non-selected";
  return result;
}

export default function () {
  const raw = fs.readFileSync(
    path.resolve("src/_data/pub.yaml"),
    "utf8"
  );
  const docs = yaml.loadAll(raw);
  const meta = docs[0];
  const papers = docs.slice(1).filter((d) => d != null);

  const types = meta.types;
  const pubTypes = [];

  for (const [typeKey, typeTitle] of Object.entries(types)) {
    const typePapers = papers.filter((p) => p.type === typeKey);
    if (typePapers.length === 0) continue;
    pubTypes.push({
      title: typeTitle,
      papers: typePapers.map((p) => buildPaper(p, meta)),
    });
  }

  return { pubTypes };
}
