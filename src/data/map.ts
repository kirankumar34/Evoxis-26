export type VenueCategory = 'All' | 'Technical' | 'Non-Technical' | 'Ceremony' | 'Special' | 'Amenities';

export type CampusBlock = {
  id: number;
  name: string;
  shortName: string;
  events: string[];
  category: 'Technical' | 'Non-Technical' | 'Ceremony' | 'Special' | 'Amenities';
  className: string;
  color: string;
  description: string;
  amenities: string[];
  walkFromGate: string;
  coordinates?: { lat: number; lng: number };
};

export const CAMPUS_BLOCKS: CampusBlock[] = [
  {
    id: 9,
    name: "Main Entrance & Registration Desk",
    shortName: "Main Gate",
    category: "Amenities",
    events: ["On-Spot Registration (08:30 AM - 09:30 AM)", "Symposium Kit & Badge Distribution", "Information Help Desk"],
    className: "left-[11%] top-[5.5%] w-[24%] h-[13%]",
    color: "#10B981",
    description: "The primary entry gateway into Sriram Engineering College. Report here first for verification, kit collection, and queries.",
    amenities: ["Welcome Arch", "Registration Desks", "Symposium Kits", "Campus Helpdesk"],
    walkFromGate: "Entry Point (0m)",
    coordinates: { lat: 13.1258, lng: 79.9715 }
  },
  {
    id: 1,
    name: "Main Block & Auditorium",
    shortName: "Main Block",
    category: "Ceremony",
    events: ["Grand Inauguration Function (09:30 AM)", "Prize Distribution & Valedictory (04:30 PM)", "Principal & Admin Foyer"],
    className: "left-[35.5%] top-[5.8%] w-[58%] h-[17.5%] rotate-[3deg]",
    color: "#FFC928",
    description: "Central administrative complex housing the grand Main Auditorium, VIP lounge, and symposium headquarters.",
    amenities: ["Central AC Auditorium", "High-Def Audio-Visual", "VIP Dignitary Lounge", "Restrooms"],
    walkFromGate: "1 min walk (80m)",
    coordinates: { lat: 13.1259, lng: 79.9725 }
  },
  {
    id: 2,
    name: "Block A - Academic & Presentation Wing",
    shortName: "Block A",
    category: "Technical",
    events: ["Paper Presentation (10:00 AM - 01:00 PM)", "Technical Research Paper Showcase", "Panel Evaluation Hall"],
    className: "left-[13.5%] top-[18.2%] w-[13.5%] h-[11%] rotate-[2deg]",
    color: "#38BDF8",
    description: "Modern academic wing featuring multimedia projection halls tailored for technical research paper presentations.",
    amenities: ["Full HD Projectors", "Presenter Mic Systems", "Wi-Fi Access", "AC Seminar Hall"],
    walkFromGate: "1.5 min walk (120m)",
    coordinates: { lat: 13.1253, lng: 79.9717 }
  },
  {
    id: 3,
    name: "Block B - Computing Labs & Tech Arena",
    shortName: "Block B",
    category: "Technical",
    events: ["Blind Coding & Code Debugging", "Web Design & UI/UX Challenge", "Software Hackathon Labs"],
    className: "left-[12.5%] top-[32.2%] w-[14%] h-[9%]",
    color: "#60A5FA",
    description: "High-spec computer laboratories equipped with multi-core workstations, gigabit networking, and developer environments.",
    amenities: ["i7/i9 Workstations", "Gigabit LAN Backbone", "Uninterrupted UPS Power", "Air-Conditioned"],
    walkFromGate: "2 min walk (160m)",
    coordinates: { lat: 13.1248, lng: 79.9717 }
  },
  {
    id: 4,
    name: "Block C - Multi-Activity & Quiz Arena",
    shortName: "Block C",
    category: "Non-Technical",
    events: ["Mega Technical Quiz", "E-Sports & Gaming Battles", "Poster Design & Brain Teasers"],
    className: "left-[13.5%] top-[41.2%] w-[13.5%] h-[10.5%]",
    color: "#34D399",
    description: "Spacious interactive activity halls optimized for high-energy quizzes, trivia rounds, and entertainment events.",
    amenities: ["Fast Buzzer System", "Gaming Big Screens", "Surround Sound", "Spacious Seating"],
    walkFromGate: "2.5 min walk (190m)",
    coordinates: { lat: 13.1243, lng: 79.9717 }
  },
  {
    id: 5,
    name: "College Sports Ground",
    shortName: "Sports Ground",
    category: "Special",
    events: ["Outdoor Special Events", "Drone Maneuvering & Robo Sprint", "Open-Air Student Hangout & Exhibits"],
    className: "left-[27%] top-[20%] w-[27.5%] h-[31%] rotate-[4deg]",
    color: "#F59E0B",
    description: "Expansive multi-acre sports arena accommodating large-scale robotics showcases, drone tests, and outdoor activities.",
    amenities: ["Wide Open Arena", "Spectator Seating", "First-Aid Camp", "Safety Barriers"],
    walkFromGate: "1.5 min walk (100m)",
    coordinates: { lat: 13.1249, lng: 79.9723 }
  },
  {
    id: 6,
    name: "Main Seminar Hall (Highlighted)",
    shortName: "Seminar Hall",
    category: "Ceremony",
    events: ["Special Tech Keynote & Industry Address (11:00 AM)", "AI / ML Future Tech Talk", "Certificate Ceremonies"],
    className: "left-[34.8%] top-[53%] w-[16.6%] h-[7.5%]",
    color: "#EF4444",
    description: "Executive tiered seminar hall highlighted in vibrant red. Features acoustic wall panelling, laser projection, and premium seating.",
    amenities: ["Tiered Seating (250+)", "Dual Laser Projectors", "Wireless Collar Mics", "Full Climate Control"],
    walkFromGate: "3 min walk (210m)",
    coordinates: { lat: 13.1242, lng: 79.9725 }
  },
  {
    id: 7,
    name: "Innovation Block & Mechanical Wing",
    shortName: "Mech & Workshop",
    category: "Technical",
    events: ["Hardware & IoT Prototype Showcase", "Robotics Arena & Testing", "Maker Space Demos"],
    className: "left-[13.5%] top-[54%] w-[19%] h-[15.5%] -rotate-[35deg]",
    color: "#A855F7",
    description: "The diamond-angled engineering laboratory complex dedicated to hardware models, 3D prototypes, and robotics displays.",
    amenities: ["3-Phase Power Outlets", "Tool & Soldering Stations", "Component Storage", "Safety Ventilation"],
    walkFromGate: "3.5 min walk (230m)",
    coordinates: { lat: 13.1239, lng: 79.9719 }
  },
  {
    id: 8,
    name: "Campus Food Court & Canteen",
    shortName: "College Canteen",
    category: "Amenities",
    events: ["Complimentary Buffet Lunch (01:00 PM - 02:30 PM)", "Tea, Coffee & Refreshment Breaks", "Snacks Counters"],
    className: "left-[32%] top-[61%] w-[20%] h-[11%]",
    color: "#FB923C",
    description: "Hygienic multi-counter dining hall providing hot meals, complimentary lunch for registered symposium participants, and refreshments.",
    amenities: ["Seating for 400+ Students", "Hygienic Food Counters", "Handwash & RO Drinking Water", "Fresh Juice Stall"],
    walkFromGate: "3.5 min walk (250m)",
    coordinates: { lat: 13.1237, lng: 79.9725 }
  }
];