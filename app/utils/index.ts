export function filterTruthyValues<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => Boolean(value))
  ) as Partial<T>;
}
