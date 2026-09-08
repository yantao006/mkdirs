import { apiVersion, dataset, projectId, studioUrl } from "@/sanity/lib/api";
import { schemaTypes } from "@/sanity/schemas";
import { codeInput } from "@sanity/code-input";
import { defineConfig } from "sanity";
import { markdownSchema } from "sanity-plugin-markdown";
import { structureTool } from "sanity/structure";

const contentTypes = ["item", "category", "tag", "collection", "group", "page"];
const itemFields = [
  "name",
  "slug",
  "description",
  "introduction",
  "link",
  "categories",
  "tags",
  "collections",
  "icon",
  "image",
  "featured",
  "publishDate",
  "forceHidden",
];

export default defineConfig({
  name: "mkdirs",
  title: "mkdirs content editor",
  basePath: studioUrl,
  projectId,
  dataset,
  schema: {
    // Preserve upstream schema/type compatibility, but do not expose account,
    // order, email or paid-submission editors in this public-content project.
    types: schemaTypes.map((type) =>
      type.name === "item"
        ? {
            ...type,
            fields: type.fields.map((field) =>
              itemFields.includes(field.name)
                ? field
                : {
                    ...field,
                    hidden: true,
                    readOnly: true,
                    initialValue: undefined,
                  },
            ),
          }
        : type,
    ),
    templates: (templates) =>
      templates.filter((template) =>
        contentTypes.includes(template.schemaType),
      ),
  },
  document: {
    newDocumentOptions: (options) =>
      options.filter((option) => contentTypes.includes(option.templateId)),
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Public directory content")
          .items(contentTypes.map((name) => S.documentTypeListItem(name))),
    }),
    markdownSchema(),
    codeInput(),
  ],
});
