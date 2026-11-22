import path from "path";
import { pathToFileURL } from "url";

// Minimal surface of Eleventy's config API used by this project. Eleventy 3
// ships no type declarations, so we model only what we call here.
interface EleventyConfig {
  addPassthroughCopy(map: string | Record<string, string>): void;
  addDataExtension(
    extension: string,
    options: { read: boolean; parser: (contentsOrPath: string) => unknown },
  ): void;
}

export default function (eleventyConfig: EleventyConfig) {
  // Eleventy only auto-discovers .js/.cjs/.mjs global data files. Register `ts`
  // as a data extension (read: false → the parser receives the file path) so
  // the files in src/_data/*.ts are imported through the tsx loader as modules.
  eleventyConfig.addDataExtension("ts", {
    read: false,
    parser: async (filePath: string) => {
      const mod = await import(pathToFileURL(path.resolve(filePath)).href);
      return typeof mod.default === "function" ? await mod.default() : mod.default;
    },
  });

  eleventyConfig.addPassthroughCopy({ static: "/" });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
  };
}
