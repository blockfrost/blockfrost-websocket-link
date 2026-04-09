declare module 'memoizee/profile.js' {
  declare const statistics: { [id: string]: { initial: number; cached: number } };

  declare function log(): string;
}
