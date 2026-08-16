/** YYYY-MM-DD, for `datetime` attributes and structured data. */
export function machineDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** How a date reads to a person: 16 August 2026. */
export function displayDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
