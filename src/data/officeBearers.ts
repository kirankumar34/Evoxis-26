export interface OfficeBearer {
  id: string;
  name: string;
  deptId: 'cse' | 'aids' | 'aiml' | 'cyber' | 'csbs';
  deptName: string;
  deptShort: string;
  position:
    | 'President'
    | 'Vice President'
    | 'Secretary'
    | 'Joint Secretary'
    | 'Treasurer'
    | 'Technical Head'
    | 'Non-Technical Head';
  avatarPool: string[]; // Pool of images to randomly rotate between
  accentColor: string;
  badge: string;
}

export const OFFICE_BEARERS: OfficeBearer[] = [
  // ── CSE (Computer Science & Engineering) ───────────────────────────
  {
    id: 'cse-pres',
    name: 'Harish Kumar S',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'President',
    badge: 'Flagship Captain',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'cse-vp',
    name: 'Sneha Mohan',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'Vice President',
    badge: 'First Mate',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'cse-sec',
    name: 'Vigneshwaran K',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'Secretary',
    badge: 'Chief Navigator',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'cse-jsec',
    name: 'Pooja Varadharajan',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'Joint Secretary',
    badge: 'Tactical Logkeeper',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'cse-treas',
    name: 'Saran',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'Treasurer',
    badge: 'Bounty Treasurer',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,x_35,y_70/CseTreasurer.jpg',
    ],
  },
  {
    id: 'cse-tech',
    name: 'Karthikeyan M',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'Technical Head',
    badge: 'Code Helmsman',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'cse-nontech',
    name: 'Divya Bharathi R',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'Non-Technical Head',
    badge: 'Arena Commander',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },

  // ── AI&DS (Artificial Intelligence & Data Science) ────────────────
  {
    id: 'aids-pres',
    name: 'Shri Hari Kumaran',
    deptId: 'aids',
    deptName: 'Artificial Intelligence & Data Science',
    deptShort: 'AI&DS',
    position: 'President',
    badge: 'Neural Architect',
    accentColor: '#A855F7',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_699,w_699,x_83,y_481/AidsPresident.jpg',
    ],
  },
  {
    id: 'aids-vp',
    name: 'Shree Durga ',
    deptId: 'aids',
    deptName: 'Artificial Intelligence & Data Science',
    deptShort: 'AI&DS',
    position: 'Vice President',
    badge: 'Data Strategist',
    accentColor: '#A855F7',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_auto/AidsVicePresident.jpg',
    ],
  },
  {
    id: 'aids-sec',
    name: 'Panga HariPriya',
    deptId: 'aids',
    deptName: 'Artificial Intelligence & Data Science',
    deptShort: 'AI&DS',
    position: 'Secretary',
    badge: 'Pipeline Marshall',
    accentColor: '#A855F7',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_auto/AidsSeceratory.jpg',


    ],
  },
  {
    id: 'aids-jsec',
    name: 'Gowtham Babu',
    deptId: 'aids',
    deptName: 'Artificial Intelligence & Data Science',
    deptShort: 'AI&DS',
    position: 'Joint Secretary',
    badge: 'Insight Keeper',
    accentColor: '#A855F7',
    avatarPool: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'aids-treas',
    name: 'Abinaya V',
    deptId: 'aids',
    deptName: 'Artificial Intelligence & Data Science',
    deptShort: 'AI&DS',
    position: 'Treasurer',
    badge: 'Resource Auditor',
    accentColor: '#A855F7',
    avatarPool: [
        'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop/AidsTreasurer.jpg',
    ],
  },
  {
    id: 'aids-tech',
    name: 'Yasir Ahamed',
    deptId: 'aids',
    deptName: 'Artificial Intelligence & Data Science',
    deptShort: 'AI&DS',
    position: 'Technical Head',
    badge: 'Model Engineer',
    accentColor: '#A855F7',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_auto,g_north_west/AidsTechHead.jpg',
      
    ],
  },
  {
    id: 'aids-nontech',
    name: 'Pradeep Kumar V',
    deptId: 'aids',
    deptName: 'Artificial Intelligence & Data Science',
    deptShort: 'AI&DS',
    position: 'Non-Technical Head',
    badge: 'Experience Host',
    accentColor: '#A855F7',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/f_auto/q_auto/AidsNonTechHead.jpg',
    ],
  },

  // ── AIML (Artificial Intelligence & Machine Learning) ──────────────
  {
    id: 'aiml-pres',
    name: 'Tarun Prasath N',
    deptId: 'aiml',
    deptName: 'Artificial Intelligence & Machine Learning',
    deptShort: 'AIML',
    position: 'President',
    badge: 'Cognitive Lead',
    accentColor: '#EC4899',
    avatarPool: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'aiml-vp',
    name: 'Harini Sundaresan',
    deptId: 'aiml',
    deptName: 'Artificial Intelligence & Machine Learning',
    deptShort: 'AIML',
    position: 'Vice President',
    badge: 'Vision Strategist',
    accentColor: '#EC4899',
    avatarPool: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'aiml-sec',
    name: 'Pranav Balaji R',
    deptId: 'aiml',
    deptName: 'Artificial Intelligence & Machine Learning',
    deptShort: 'AIML',
    position: 'Secretary',
    badge: 'Algorithm Master',
    accentColor: '#EC4899',
    avatarPool: [
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'aiml-jsec',
    name: 'Akshaya Meenakshi',
    deptId: 'aiml',
    deptName: 'Artificial Intelligence & Machine Learning',
    deptShort: 'AIML',
    position: 'Joint Secretary',
    badge: 'Neural Coordinator',
    accentColor: '#EC4899',
    avatarPool: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'aiml-treas',
    name: 'Sanjay Kumar M',
    deptId: 'aiml',
    deptName: 'Artificial Intelligence & Machine Learning',
    deptShort: 'AIML',
    position: 'Treasurer',
    badge: 'Compute Chancellor',
    accentColor: '#EC4899',
    avatarPool: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  // ── CYBER SECURITY (Department of Cyber Security) ─────────────────
  {
    id: 'cyber-pres',
    name: 'Gokulnath R',
    deptId: 'cyber',
    deptName: 'Department of Cyber Security',
    deptShort: 'Cyber Security',
    position: 'President',
    badge: 'Cyber Vanguard',
    accentColor: '#10B981',
    avatarPool: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'cyber-vp',
    name: 'Bhavani Shankar',
    deptId: 'cyber',
    deptName: 'Department of Cyber Security',
    deptShort: 'Cyber Security',
    position: 'Vice President',
    badge: 'Defensive Sentinel',
    accentColor: '#10B981',
    avatarPool: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'cyber-sec',
    name: 'Naveen Kumar B',
    deptId: 'cyber',
    deptName: 'Department of Cyber Security',
    deptShort: 'Cyber Security',
    position: 'Secretary',
    badge: 'Protocol Chief',
    accentColor: '#10B981',
    avatarPool: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'cyber-jsec',
    name: 'Madhumitha K',
    deptId: 'cyber',
    deptName: 'Department of Cyber Security',
    deptShort: 'Cyber Security',
    position: 'Joint Secretary',
    badge: 'Forensic Officer',
    accentColor: '#10B981',
    avatarPool: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'cyber-treas',
    name: 'Abishek Nathan',
    deptId: 'cyber',
    deptName: 'Department of Cyber Security',
    deptShort: 'Cyber Security',
    position: 'Treasurer',
    badge: 'Vault Keyholder',
    accentColor: '#10B981',
    avatarPool: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },

  // ── CSBS (Computer Science & Business Systems) ────────────────────
  {
    id: 'csbs-pres',
    name: 'Roshan Akil M',
    deptId: 'csbs',
    deptName: 'Computer Science and Business Systems',
    deptShort: 'CSBS',
    position: 'President',
    badge: 'Grand Commodore',
    accentColor: '#00F2FE',
    avatarPool: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'csbs-vp',
    name: 'Niranjan',
    deptId: 'csbs',
    deptName: 'Computer Science and Business Systems',
    deptShort: 'CSBS',
    position: 'Vice President',
    badge: 'Executive Strategist',
    accentColor: '#00F2FE',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,x_35,y_70/CsbsVicePresident.jpg',

    ],
  },
  {
    id: 'csbs-sec',
    name: 'Kishore Kumar J',
    deptId: 'csbs',
    deptName: 'Computer Science and Business Systems',
    deptShort: 'CSBS',
    position: 'Secretary',
    badge: 'Operations Chief',
    accentColor: '#00F2FE',
    avatarPool: [
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'csbs-jsec',
    name: 'Sandhya Murali',
    deptId: 'csbs',
    deptName: 'Computer Science and Business Systems',
    deptShort: 'CSBS',
    position: 'Joint Secretary',
    badge: 'Enterprise Liaison',
    accentColor: '#00F2FE',
    avatarPool: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'csbs-treas',
    name: 'Vasanth Raj V',
    deptId: 'csbs',
    deptName: 'Computer Science and Business Systems',
    deptShort: 'CSBS',
    position: 'Treasurer',
    badge: 'Fiscal Director',
    accentColor: '#00F2FE',
    avatarPool: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
];
