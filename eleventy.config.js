import { theoremEnvironmentPlugin } from "./plugins/theorem-environments.js";
import { citationPlugin } from "./plugins/citations.js";
import { mathPlugin } from "./plugins/math.js";
import markdownIt from "markdown-it";
import path from "path";

export default function (eleventyConfig) {
  const md = markdownIt({ html: true, typographer: false });
  md.use(mathPlugin);
  md.use(theoremEnvironmentPlugin);
  md.use(citationPlugin, {
    bibFile: path.resolve("reference.bib"),
    cslFile: path.resolve("bib_style.csl"),
  });

  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPassthroughCopy({ static: "/" });

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  );

  eleventyConfig.addCollection("cnposts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/cnposts/*.md")
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  );

  eleventyConfig.addFilter("richTitle", (title) => {
    if (!title) return "";
    return md.renderInline(title);
  });

  eleventyConfig.addFilter("dateFormat", (date) => {
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
