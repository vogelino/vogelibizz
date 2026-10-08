export function commonValue<Row, Key extends keyof Row>(
  rows: Row[],
  key: Key,
): Row[Key] | undefined {
  if (rows.length === 0) return undefined;
  const first = rows[0][key];
  return rows.every((row) => Object.is(row[key], first)) ? first : undefined;
}

export function hasCommonValue<Row, Key extends keyof Row>(rows: Row[], key: Key): boolean {
  return rows.length > 0 && rows.every((row) => Object.is(row[key], rows[0][key]));
}

export function unionRelations<Relation extends { id: number }>(
  rows: { relations?: Relation[] }[],
): Relation[] {
  const relations = new Map<number, Relation>();
  for (const row of rows) {
    for (const relation of row.relations ?? []) relations.set(relation.id, relation);
  }
  return [...relations.values()];
}

export function relationsFromOptionValues<Relation extends { id: number }>(
  optionValues: { value: string | number }[],
  availableRelations: Relation[],
): Relation[] {
  const selectedIds = new Set(optionValues.map(({ value }) => String(value)));
  return availableRelations.filter((relation) => selectedIds.has(String(relation.id)));
}

export function applyRelationDelta<Relation extends { id: number }>(
  originalRelations: Relation[],
  initialUnion: Relation[],
  nextUnion: Relation[],
): Relation[] {
  const nextIds = new Set(nextUnion.map(({ id }) => id));
  const removedIds = new Set(initialUnion.filter(({ id }) => !nextIds.has(id)).map(({ id }) => id));
  const originalIds = new Set(originalRelations.map(({ id }) => id));
  const addedRelations = nextUnion.filter(
    ({ id }) => !initialUnion.some((relation) => relation.id === id) && !originalIds.has(id),
  );
  return [...originalRelations.filter(({ id }) => !removedIds.has(id)), ...addedRelations];
}

export type RelationIntent = "add" | "remove";

export function getRelationCounts<Relation extends { id: number }>(
  rows: Relation[][],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const relations of rows) {
    for (const { id } of relations) {
      const key = String(id);
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return counts;
}

export function applyRelationIntents<Relation extends { id: number }>(
  originalRelations: Relation[],
  availableRelations: Relation[],
  intents: Record<string, RelationIntent>,
): Relation[] {
  const removedIds = new Set(
    Object.entries(intents)
      .filter(([, intent]) => intent === "remove")
      .map(([id]) => id),
  );
  const nextRelations = originalRelations.filter(({ id }) => !removedIds.has(String(id)));
  const nextIds = new Set(nextRelations.map(({ id }) => String(id)));
  for (const relation of availableRelations) {
    if (intents[String(relation.id)] !== "add" || nextIds.has(String(relation.id))) continue;
    nextRelations.push(relation);
    nextIds.add(String(relation.id));
  }
  return nextRelations;
}

export function pickChanged<Value extends object>(
  value: Value,
  changedFields: ReadonlySet<keyof Value>,
): Partial<Value> {
  return Object.fromEntries([...changedFields].map((key) => [key, value[key]])) as Partial<Value>;
}
