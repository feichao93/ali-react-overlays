export function pick<T>(obj: T, keys: (keyof T)[]): Partial<T> {
  const result: Partial<T> = {};
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}

export function groupBy<T, K extends string>(list: T[], iteratee: (t: T) => K) {
  const groups: { [key in K]: T[] } = {} as any;
  for (const item of list) {
    const key = iteratee(item);
    if (groups[key] == null) {
      groups[key] = [];
    }
    groups[key].push(item);
  }
  return groups;
}
