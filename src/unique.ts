export function generateUniqueID(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()}`;
}
