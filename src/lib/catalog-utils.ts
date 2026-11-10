export function extractAuthorNames(relations: unknown): string[] {
  if (!Array.isArray(relations)) return [];
  return relations.flatMap((item: unknown) => {
    if (typeof item !== "object" || item === null || !("authors" in item)) return [];
    const relation = item.authors;
    const author = Array.isArray(relation) ? relation[0] : relation;
    if (typeof author !== "object" || author === null || !("name" in author)) return [];
    return typeof author.name === "string" ? [author.name] : [];
  });
}
