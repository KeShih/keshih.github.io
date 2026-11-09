import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import markdownIt from "markdown-it";
import { mathPlugin } from "../../plugins/math.js";

const md = markdownIt({ html: true });
md.use(mathPlugin);

function renderInline(text: string): string {
  if (!text) return "";
  return md.renderInline(text);
}

function renderBlock(text: string): string {
  if (!text) return "";
  return md.render(text);
}

interface Meta {
  venues: Record<string, string>;
  people: Record<string, string | null | undefined>;
  types: Record<string, string>;
  typeStatus?: Record<string, string>; // per type: bib line "<year>, <status>" for papers without `bib`
  selectedMode?: boolean; // list only `selected` papers until "See all publications"
}

interface RawPaper {
  id: string;
  title: string;
  authors?: string[];
  type: string;
  pub?: string;
  year: number;
  bib?: string;
  pdf?: string; // external PDF (e.g. arXiv); defaults to files/papers/<id>.pdf
  show?: string[];
  notes?: string[];
  abstract?: string;
  dedication?: string;
  selected?: boolean;
}

interface Coauthor {
  name: string;
  link: string;
}

type ProcessedPaper = Omit<RawPaper, "authors" | "pub" | "selected"> & {
  authors: Coauthor[];
  pub?: { name: string; venue: string };
  selected: string; // CSS class; "cv-non-selected" hides the paper in selected mode
  show: string[];
  pdfHref?: string; // the paper's PDF: `pdf` if given, else the copy in files/papers
  slidesHref?: string;
};

function coauthorList(authors: string[], people: Meta["people"]): Coauthor[] {
  return authors.map((name) => ({
    name,
    link: people[name] || "",
  }));
}

function buildPaper(paper: RawPaper, meta: Meta): ProcessedPaper {
  const { pub, ...rest } = paper;
  const show = paper.show || [];
  const result: ProcessedPaper = {
    ...rest,
    show,
    pdfHref: show.includes("d") ? paper.pdf || `/files/papers/${paper.id}.pdf` : undefined,
    slidesHref: show.includes("p") ? `/files/presentations/${paper.id}.pdf` : undefined,
    title: renderInline(paper.title),
    authors: coauthorList(paper.authors || [], meta.people),
    selected: meta.selectedMode && !paper.selected ? "cv-non-selected" : "cv-selected",
  };

  const status = meta.typeStatus?.[paper.type];
  if (!paper.bib && status) {
    result.bib = `${paper.year}, ${status}`;
  }
  if (paper.notes) {
    result.notes = paper.notes.map(renderInline);
  }
  if (pub) {
    result.pub = {
      name: pub,
      venue: meta.venues[pub] || pub,
    };
  }
  if (paper.abstract) {
    result.show.push("a");
    result.abstract = renderBlock(paper.abstract);
  }
  if (paper.dedication) {
    result.dedication = renderInline(paper.dedication);
  }
  return result;
}

export default function () {
  const raw = fs.readFileSync(path.resolve("src/_data/pub.yaml"), "utf8");
  const docs = yaml.loadAll(raw) as unknown[];
  const meta = docs[0] as Meta;
  const papers = docs.slice(1).filter((d): d is RawPaper => d != null);

  const types = meta.types;
  const pubTypes: { title: string; papers: ProcessedPaper[] }[] = [];

  for (const [typeKey, typeTitle] of Object.entries(types)) {
    const typePapers = papers.filter((p) => p.type === typeKey);
    if (typePapers.length === 0) continue;
    pubTypes.push({
      title: typeTitle,
      papers: typePapers.map((p) => buildPaper(p, meta)),
    });
  }

  return { pubTypes, selectedMode: Boolean(meta.selectedMode) };
}
