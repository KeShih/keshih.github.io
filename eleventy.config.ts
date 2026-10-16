import { theoremEnvironmentPlugin } from "./plugins/theorem-environments.js";
import { citationPlugin } from "./plugins/citations.js";
import { mathPlugin } from "./plugins/math.js";
import markdownIt from "markdown-it";
import path from "path";
import { pathToFileURL } from "url";

interface EleventyCollectionItem {
  date: Date;
}

interface EleventyCollectionApi {
  getFilteredByGlob(glob: string | string[]): EleventyCollectionItem[];
}

// Minimal surface of Eleventy's config API used by this project. Eleventy 3
// ships no type declarations, so we model only what we call here.
interface EleventyConfig {
  setLibrary(name: string, lib: unknown): void;
  addPassthroughCopy(map: string | Record<string, string>): void;
  addCollection(
    name: string,
    callback: (api: EleventyCollectionApi) => unknown,
  ): void;
  addFilter(name: string, callback: (...args: any[]) => unknown): void;
  addDataExtension(
    extension: string,
    options: { read: boolean; parser: (contentsOrPath: string) => unknown },
  ): void;
}

export default function (eleventyConfig: EleventyConfig) {
  const md = markdownIt({ html: true, typographer: false });
  md.use(mathPlugin);
  md.use(theoremEnvironmentPlugin);
  md.use(citationPlugin, {
    bibFile: path.resolve("reference.bib"),
    cslFile: path.resolve("bib_style.csl"),
  });

  eleventyConfig.setLibrary("md", md);

  // Eleventy only auto-discovers .js/.cjs/.mjs global data files. Register `ts`
  // as a data extension (read: false → the parser receives the file path) so
  // src/_data/publications.ts is imported through the tsx loader like a module.
  eleventyConfig.addDataExtension("ts", {
    read: false,
    parser: async (filePath: string) => {
      const mod = await import(pathToFileURL(path.resolve(filePath)).href);
      return typeof mod.default === "function" ? await mod.default() : mod.default;
    },
  });

  eleventyConfig.addPassthroughCopy({ static: "/" });

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => b.date.getTime() - a.date.getTime()),
  );

  eleventyConfig.addCollection("cnposts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/cnposts/*.md")
      .sort((a, b) => b.date.getTime() - a.date.getTime()),
  );

  eleventyConfig.addFilter("richTitle", (title: string) => {
    if (!title) return "";
    return md.renderInline(title);
  });

  eleventyConfig.addFilter("dateFormat", (date: Date) => {
    if (!date) return "";
    return date.toISOString().slice(0, 10);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
