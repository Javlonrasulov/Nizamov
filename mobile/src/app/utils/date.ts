export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function enumerateDateRange(start: string, end: string): string[] {
  const result: string[] = [];
  const current = parseDateString(start);
  const endDate = parseDateString(end);

  while (current <= endDate) {
    result.push(toLocalDateString(current));
    current.setDate(current.getDate() + 1);
  }

  return result;
}
