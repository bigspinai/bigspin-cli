export function redactApiKey(value: string): string {
  if (value.length <= 12) {
    return '***';
  }

  return value.slice(0, 12) + '...' + value.slice(-4);
}
