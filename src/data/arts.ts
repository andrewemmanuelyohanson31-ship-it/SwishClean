// ART (housecleaner) list. Single source for every screen, so an admin "add ART"
// feature later only needs to write to this collection (swap for an API/DB then).
export type Art = {
  id: string;
  name: string;
  initials: string;
  color: string; // avatar placeholder until real photos exist
  rating: number;
  reviews: number;
  years: number;
  distanceKm: number;
  tags: string[];
  pricePerHour: number;
  favorite?: boolean;
  jobs?: number;
  onTime?: number;
  about?: string;
  skills?: string[];
  languages?: string;
  hours?: string;
};

export const arts: Art[] = [
  {
    id: "siti", name: "Siti Rahmawati", initials: "SR", color: "#F6C9A8", rating: 4.9, reviews: 128, years: 6, distanceKm: 1.2,
    tags: ["Bersih Rutin", "Setrika"], pricePerHour: 45000, favorite: true, jobs: 412, onTime: 98,
    about: "Sudah 6 tahun membantu keluarga di Tangerang. Teliti di dapur dan kamar mandi, terbiasa dengan kucing dan anjing.",
    skills: ["Bersih Rutin", "Setrika", "Ramah Hewan"], languages: "Indonesia, Jawa", hours: "Sen–Sab, 07.00–16.00",
  },
  { id: "dewi", name: "Dewi Lestari", initials: "DL", color: "#BFE3DC", rating: 4.8, reviews: 96, years: 4, distanceKm: 2.0, tags: ["Bersih Mendalam", "Dapur"], pricePerHour: 42000 },
  { id: "rina", name: "Rina Marlina", initials: "RM", color: "#F8D98F", rating: 4.9, reviews: 74, years: 3, distanceKm: 2.8, tags: ["Bersih Rutin", "Ramah Hewan"], pricePerHour: 40000 },
  { id: "sri", name: "Sri Wahyuni", initials: "SW", color: "#CFD8F6", rating: 4.7, reviews: 152, years: 8, distanceKm: 3.1, tags: ["Pindahan", "Bersih Mendalam"], pricePerHour: 50000 },
  // Only appears on ART Langgananku in the design; reviews/years/distance/tags are sample values.
  { id: "nur", name: "Nur Aini", initials: "NA", color: "#F5C1C9", rating: 4.8, reviews: 61, years: 5, distanceKm: 2.4, tags: ["Bersih Rutin", "Setrika"], pricePerHour: 38000 },
];

export const getArt = (id?: string) => arts.find((a) => a.id === id) ?? arts[0];

// Indonesian formatting: Rp45.000, 1,2 km. Done by hand so Hermes/web output is identical.
export const rupiah = (n: number) => "Rp" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export const km = (n: number) => n.toFixed(1).replace(".", ",");
