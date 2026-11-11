// ART search + filter used by Cari ART.
import { Art, arts as ALL } from "./arts";
import type { Filter } from "./store";

export const SERVICES = ["Bersih Rutin", "Bersih Mendalam", "Setrika", "Ramah Hewan", "Pindahan", "Dapur"];
export const SORTS: { id: Filter["sort"]; label: string }[] = [
  { id: "rating", label: "Rating tertinggi" },
  { id: "jarak", label: "Terdekat" },
  { id: "harga", label: "Harga terendah" },
];

const skillsOf = (a: Art) => new Set([...a.tags, ...(a.skills ?? [])]);

/**
 * Query is comma-separated ("Bersih rutin, Alam Sutera"); each part must match the ART's name/skills
 * or the customer's own area (every listed ART serves that area).
 */
export function searchArts(f: Filter, area: string, list: Art[] = ALL): Art[] {
  const parts = f.query.split(",").map((p) => p.trim().toLowerCase()).filter(Boolean);
  const where = area.toLowerCase();
  const res = list.filter((a) => {
    const skills = skillsOf(a);
    const text = [a.name, ...skills].join(" ").toLowerCase();
    return (
      parts.every((p) => text.includes(p) || where.includes(p)) &&
      f.tags.every((t) => skills.has(t)) &&
      a.rating >= f.minRating &&
      (!f.maxPrice || a.pricePerHour <= f.maxPrice)
    );
  });
  const by = { rating: (a: Art, b: Art) => b.rating - a.rating || b.reviews - a.reviews, jarak: (a: Art, b: Art) => a.distanceKm - b.distanceKm, harga: (a: Art, b: Art) => a.pricePerHour - b.pricePerHour };
  return res.sort(by[f.sort]);
}

// self-check against the sample data
{
  const f: Filter = { query: "Bersih rutin, Alam Sutera", tags: ["Ramah Hewan"], minRating: 0, maxPrice: 0, sort: "rating" };
  const ids = searchArts(f, "Alam Sutera, Tangerang").map((a) => a.id).join();
  const cheap = searchArts({ query: "", tags: [], minRating: 0, maxPrice: 40000, sort: "harga" }, "").map((a) => a.id).join();
  const none = searchArts({ query: "zzz", tags: [], minRating: 0, maxPrice: 0, sort: "rating" }, "").length;
  if (ids !== "siti,rina" || cheap !== "nur,rina" || none !== 0) throw new Error(`search.ts self-check failed: ${ids} | ${cheap} | ${none}`);
}
