// Booking calendar: Oktober–Desember 2026. A "day" is a number counted from 1 Oktober 2026
// (1–31 Okt, 32–61 Nov, 62–92 Des), so weekday math and stored orders keep working across months.
// shortcut: fixed to Q4 2026 like the design's "today" (15 Okt); switch to real Date values when the app goes live.
export const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DAYS_LONG = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
export const FIRST_DOW = 3; // 1 Oktober 2026 = Kamis

export const MONTHS = [
  { name: "Oktober", short: "Okt", num: 10, start: 1, len: 31 },
  { name: "November", short: "Nov", num: 11, start: 32, len: 30 },
  { name: "Desember", short: "Des", num: 12, start: 62, len: 31 },
];
export const LAST_DAY = 92; // 31 Desember 2026

export const dayName = (d: number) => DAYS[(FIRST_DOW + d - 1) % 7];
export const dayLong = (d: number) => DAYS_LONG[(FIRST_DOW + d - 1) % 7];
export const monthIndex = (d: number) => (d >= 62 ? 2 : d >= 32 ? 1 : 0);
export const dateNum = (d: number) => d - MONTHS[monthIndex(d)].start + 1;
/** 22 → "22 Okt", 33 → "2 Nov" */
export const dayShort = (d: number) => `${dateNum(d)} ${MONTHS[monthIndex(d)].short}`;
/** 22 → "22 Oktober 2026" */
export const dayFull = (d: number) => `${dateNum(d)} ${MONTHS[monthIndex(d)].name} 2026`;
/** Grid cells for one month: leading blanks (Monday-first week), then that month's day numbers. */
export const monthCells = (m: number): (number | null)[] => {
  const { start, len } = MONTHS[m];
  return [...Array<null>((FIRST_DOW + start - 1) % 7).fill(null), ...Array.from({ length: len }, (_, i) => start + i)];
};
/** day ↔ "2026-MM-DD" for the database */
export const toIsoDate = (d: number) => `2026-${MONTHS[monthIndex(d)].num}-${String(dateNum(d)).padStart(2, "0")}`;
export const fromIsoDate = (iso: string) => {
  const m = MONTHS.findIndex((x) => x.num === Number(iso.slice(5, 7)));
  return m < 0 ? 1 : MONTHS[m].start + Number(iso.slice(8, 10)) - 1;
};

// self-check: 1 Nov 2026 is a Sunday, 25 Des 2026 a Friday, ISO round-trips.
if (dayName(32) !== "Min" || dayShort(32) !== "1 Nov" || dayName(86) !== "Jum" || dayShort(86) !== "25 Des" ||
    toIsoDate(86) !== "2026-12-25" || fromIsoDate("2026-11-02") !== 33 || monthCells(1)[6] !== 32 || monthCells(2).filter(Boolean).length !== 31) {
  throw new Error("calendar self-check failed");
}
