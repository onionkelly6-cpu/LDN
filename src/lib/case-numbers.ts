/**
 * Case numbers are `<practice-area code>-<year>-<5 digits>`, e.g.
 * `PR-2026-00182`. Shared by Lead → Convert to Matter and by an attorney
 * opening a case directly from `/firm/matters`.
 */
export function generateCaseNumber(practiceAreaCode: string): string {
  const year = new Date().getFullYear();
  const sequence = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `${practiceAreaCode}-${year}-${sequence}`;
}
