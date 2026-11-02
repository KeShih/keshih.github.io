import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

// Entries for /sitemap.xml (rendered by src/sitemap.njk). Only Ke Shi's own
// content is listed: the homepage, the CV, and the paper and presentation
// PDFs. The blog posts and pages inherited from the chaoxu.github.io fork are
// left out on purpose.

const SITE = "https://keshi.pro";

interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

// A shallow clone reports its newest commit for every file, so lastmod is
// only trusted with full history (the deploy workflow checks out with
// fetch-depth: 0).
function hasFullHistory(): boolean {
  try {
    return git(["rev-parse", "--is-shallow-repository"]) === "false";
  } catch {
    return false;
  }
}

export default function () {
  const fullHistory = hasFullHistory();

  // Date of the last commit touching any of `paths`, as a W3C datetime.
  const lastModified = (paths: string[]): string | undefined => {
    if (!fullHistory) return undefined;
    try {
      return git(["log", "-1", "--format=%cI", "--", ...paths]) || undefined;
    } catch {
      return undefined;
    }
  };

  const entries: SitemapEntry[] = [
    {
      loc: `${SITE}/`,
      lastmod: lastModified(["src/index.njk", "src/_data/pub.yaml"]),
    },
    // Deploys may replace the committed CV with the one built in KeShih/CV,
    // so its commit date here is not a reliable lastmod.
    { loc: `${SITE}/files/CV-en.pdf` },
  ];

  for (const dir of ["static/files/papers", "static/files/presentations"]) {
    const pdfs = fs
      .readdirSync(dir)
      .filter((name) => name.endsWith(".pdf"))
      .sort();
    for (const name of pdfs) {
      const file = path.join(dir, name);
      entries.push({
        loc: `${SITE}/${encodeURI(path.posix.relative("static", file))}`,
        lastmod: lastModified([file]),
      });
    }
  }

  return { entries };
}
