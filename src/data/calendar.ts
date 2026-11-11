// shortcut: the booking calendar only covers Oktober 2026 like the design; generate from Date once real availability exists.
export const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DAYS_LONG = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
export const FIRST_DOW = 3; // 1 Oktober 2026 = Kamis

export const dayName = (d: number) => DAYS[(FIRST_DOW + d - 1) % 7];
export const dayLong = (d: number) => DAYS_LONG[(FIRST_DOW + d - 1) % 7];
