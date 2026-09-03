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
    | 'Non-Technical Head'
    | 'Editing Committee Head'
    | 'Event Organiser';
  avatarPool: string[]; // Pool of images to randomly rotate between
  accentColor: string;
  badge: string;
}

export const OFFICE_BEARERS: OfficeBearer[] = [
  // ── CSE (Computer Science & Engineering) ───────────────────────────
  {
    id: 'cse-pres',
    name: 'LINGESHWARAN G',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'President',
    badge: 'Flagship Captain',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,x_76,y_182/f_auto/q_auto/CsePresident.jpg',
    ],
  },
  {
    id: 'cse-vp',
    name: 'BOOMIKA M',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'Vice President',
    badge: 'First Mate',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_1024,w_948,x_26/f_auto/q_auto/CseJointSeceratory.jpg',
    ],
  },
  {
    id: 'cse-sec',
    name: 'MOHAMMED RAIYAN E',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'Secretary',
    badge: 'Chief Navigator',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_auto,g_auto/CseSeceratory.jpg',
    ],
  },
  {
    id: 'cse-jsec',
    name: 'TAMIZ AZHAGI R',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'Joint Secretary',
    badge: 'Tactical Logkeeper',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_787,w_787,x_79,y_395/f_auto/q_auto/CseVicePresident.jpg',
    ],
  },
  {
    id: 'cse-treas',
    name: 'SARAN B' ,
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
    name: 'Kiran Kumar',
    deptId: 'csbs',
    deptName: 'Computer Science And Business Systems ',
    deptShort: 'CSBS',
    position: 'Technical Head',
    badge: 'Code Helmsman',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_1933,w_1933,x_635,y_1409/f_auto/q_auto/imageUnknown.jpg',
    ],
  },
  {
    id: 'cse-nontech',
    name: 'Chandru',
    deptId: 'cse',
    deptName: 'Computer Science and Engineering',
    deptShort: 'CSE',
    position: 'Non-Technical Head',
    badge: 'Arena Commander',
    accentColor: '#38BDF8',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_1036,w_1036,x_35,y_47/CseTechHead.jpg',
    ],
  },

  // ── AI&DS (Artificial Intelligence & Data Science) ────────────────
  {
    id: 'aids-pres',
    name: 'SRIHARI KUMARAN C S ',
    deptId: 'aids',
    deptName: 'Artificial Intelligence & Data Science',
    deptShort: 'AI&DS',
    position: 'President',
    badge: 'Neural Architect',
    accentColor: '#A855F7',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_auto,g_north_west/f_auto/q_auto/AidsPresident.jpg',
    ],
  },
  {
    id: 'aids-vp',
    name: 'SHREE DURGA K',
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
    name: 'PANGA HARIPRIYA',
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
    id: 'aids-treas',
    name: 'ABINAYA V',
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
    name: 'TIPPUESWAR S',
    deptId: 'aiml',
    deptName: 'Artificial Intelligence & Machine Learning',
    deptShort: 'AIML',
    position: 'President',
    badge: 'Cognitive Lead',
    accentColor: '#EC4899',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_576,w_569,x_7,y_287/AimlPresident.jpg',
    ],
  },
  {
    id: 'aiml-vp',
    name: 'BHARGAVI A',
    deptId: 'aiml',
    deptName: 'Artificial Intelligence & Machine Learning',
    deptShort: 'AIML',
    position: 'Vice President',
    badge: 'Vision Strategist',
    accentColor: '#EC4899',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_1079,w_1079,y_686/f_auto/q_auto/AimlVicePresident.jpg',

    ],
  },
  {
    id: 'aiml-sec',
    name: 'MOHAMMED AREEF A',
    deptId: 'aiml',
    deptName: 'Artificial Intelligence & Machine Learning',
    deptShort: 'AIML',
    position: 'Secretary',
    badge: 'Algorithm Master',
    accentColor: '#EC4899',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_735,w_735,x_46/f_auto/q_auto/AimlSeceratory.jpg',

    ],
  },
  {
    id: 'aiml-jsec',
    name: 'LOKESH P',
    deptId: 'aiml',
    deptName: 'Artificial Intelligence & Machine Learning',
    deptShort: 'AIML',
    position: 'Joint Secretary',
    badge: 'Neural Coordinator',
    accentColor: '#EC4899',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_575,w_575,y_108/f_auto/q_auto/CseTreasurer.jpg',

    ],
  },
  {
    id: 'aiml-treas',
    name: 'SUGANESH S S',
    deptId: 'aiml',
    deptName: 'Artificial Intelligence & Machine Learning',
    deptShort: 'AIML',
    position: 'Treasurer',
    badge: 'Compute Chancellor',
    accentColor: '#EC4899',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_950,w_950,x_37,y_96/f_auto/q_auto/AimlTreasurer.jpg',

    ],
  },
  // ── CYBER SECURITY (Department of Cyber Security) ─────────────────
  {
    id: 'cyber-pres',
    name: 'SATHYA SAI J S',
    deptId: 'cyber',
    deptName: 'Department of Cyber Security',
    deptShort: 'Cyber Security',
    position: 'President',
    badge: 'Cyber Vanguard',
    accentColor: '#10B981',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_872,w_872,x_149,y_303/CysPresident.jpg',

    ],
  },
  {
    id: 'cyber-vp',
    name: 'Magesha N',
    deptId: 'cyber',
    deptName: 'Department of Cyber Security',
    deptShort: 'Cyber Security',
    position: 'Vice President',
    badge: 'Forensic Officer',
    accentColor: '#10B981',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_auto,g_north_west/CysVicePresident.jpg',

    ],
  },

  {
    id: 'cyber-sec',
    name: 'SANJAY T',
    deptId: 'cyber',
    deptName: 'Department of Cyber Security',
    deptShort: 'Cyber Security',
    position: 'Secretary',
    badge: 'Protocol Chief',
    accentColor: '#10B981',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_877,w_877/CysSeceratory.jpg',

    ],
  },
  {
    id: 'cyber-jsec',
    name: 'SANTHOSH',
    deptId: 'cyber',
    deptName: 'Department of Cyber Security',
    deptShort: 'Cyber Security',
    position: 'Joint Secretary',
    badge: 'Forensic Officer',
    accentColor: '#10B981',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_877,w_877,x_76,y_10/CysJointSeceratory.jpg',

    ],
  },
  {
    id: 'cyber-treas',
    name: 'GOKUL P',
    deptId: 'cyber',
    deptName: 'Department of Cyber Security',
    deptShort: 'Cyber Security',
    position: 'Treasurer',
    badge: 'Vault Keyholder',
    accentColor: '#10B981',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_848,w_817,x_7,y_29/CysTreasurer.jpg',
    ],
  },

  // ── CSBS (Computer Science & Business Systems) ────────────────────
  {
    id: 'csbs-pres',
    name: 'VIMITHA M',
    deptId: 'csbs',
    deptName: 'Computer Science and Business Systems',
    deptShort: 'CSBS',
    position: 'President',
    badge: 'Grand Commodore',
    accentColor: '#00F2FE',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_auto,g_north_west/f_auto/q_auto/CsbsPresident.jpg',

    ],
  },
  {
    id: 'csbs-vp',
    name: 'NIRANJAN S',
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
    name: 'GOWTHAM E',
    deptId: 'csbs',
    deptName: 'Computer Science and Business Systems',
    deptShort: 'CSBS',
    position: 'Secretary',
    badge: 'Operations Chief',
    accentColor: '#00F2FE',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_1086,w_937,x_31,y_149/CsbsSecratory.png',
    ],
  },
  {
    id: 'csbs-jsec',
    name: ' VISHAL N A',
    deptId: 'csbs',
    deptName: 'Computer Science and Business Systems',
    deptShort: 'CSBS',
    position: 'Joint Secretary',
    badge: 'Enterprise Liaison',
    accentColor: '#00F2FE',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_1036,w_1027,y_323/CSBSJointSeceratory.jpg',

    ],
  },
  {
    id: 'csbs-treas',
    name: 'MOHAN KUMAR A',
    deptId: 'csbs',
    deptName: 'Computer Science and Business Systems',
    deptShort: 'CSBS',
    position: 'Treasurer',
    badge: 'Fiscal Director',
    accentColor: '#00F2FE',
    avatarPool: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&h=600&fit=crop&auto=format',
    ],
  },
  {
    id: 'event-org',
    name: 'Bhavana Shree J',
    deptId: 'aids',
    deptName: 'Artificial Intelligence & Data Science',
    deptShort: 'AI&DS',
    position: 'Event Organiser',
    badge: 'Neural Architect',
    accentColor: '#A855F7',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_1933,w_1933,x_712,y_785/f_auto/q_auto/Event1.jpg',
    ],
  },
  {
    id: 'committe-head',
    name: 'Gopinath M',
    deptId: 'aids',
    deptName: 'Artificial Intelligence & Data Science',
    deptShort: 'AI&DS',
    position: 'Editing Committee Head',
    badge: 'Neural Architect',
    accentColor: '#A855F7',
    avatarPool: [
      'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_1120,w_1121,x_1,y_51/f_auto/q_auto/EditingTeamHead.png',
    ],
  },
];
