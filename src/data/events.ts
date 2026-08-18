import { EventItem } from '@/types';

export const EVENTS: EventItem[] = [
  // ==========================================
  // TECHNICAL EVENTS (6)
  // ==========================================
  {
    id: 'paper-presentation',
    eventId: 'TE01',
    sheetSlug: 'paper-presentation',
    title: 'Paper Presentation',
    category: 'Technical',
    tagline: 'Defend Innovations. Inspire Academic Breakthroughs.',
    shortDescription: 'Present your novel research, architectures, and engineering prototypes before an esteemed jury of academic & industry researchers.',
    fullDescription: 'Paper Presentation provides a premier platform for aspiring student researchers to present original work in cutting-edge computing paradigms including Generative AI, Quantum Computing, Blockchain, IoT, Cyber Defense, and Cloud-Native Distributed Systems.',
    teamSize: {
      min: 1,
      max: 3,
      description: '1 to 3 Members per Team'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Abstract & Paper Screening',
        description: 'Submission of IEEE format paper (maximum 6 pages) prior to symposium day for initial peer evaluation.',
        duration: 'Pre-event'
      },
      {
        roundNumber: 2,
        title: 'Live Technical Presentation',
        description: '8-minute PPT presentation of research methodology, experimental results, and architectural diagrams followed by 3-minute Q&A with the jury.',
        duration: '11 Mins / Team'
      }
    ],
    rules: [
      'Papers must strictly follow standard IEEE double-column conference format.',
      'Plagiarism index must not exceed 15% as verified via Turnitin/iThenticate.',
      'Teams must bring 2 hard copies of the full manuscript and their presentation on a formatted USB drive.',
      'Decision of the jury panel regarding technical novelty and methodology is final and binding.'
    ],
    judgingCriteria: [
      'Technical Novelty & Innovation (30%)',
      'Methodology & Implementation Rigor (25%)',
      'Clarity of Presentation & Visual Slides (25%)',
      'Response to Jury Cross-Examination (20%)'
    ],
    prizes: {
      first: '₹5,000 Cash Prize + Memento + Certificate of Excellence',
      second: '₹3,000 Cash Prize + Certificate of Excellence',
      third: '₹1,500 Cash Prize + Certificate of Merit',
      allParticipants: 'Certificate of National Participation'
    },
    coordinators: [
      {
        name: 'Dr. S. Rajalakshmi',
        role: 'Faculty Coordinator',
        department: 'CSBS',
        phone: '+91 98401 23456',
        whatsapp: '919840123456',
        email: 'rajalakshmi.csbs@sriram.edu.in'
      },
      {
        name: 'Kavin Kumar R',
        role: 'Student Coordinator',
        department: 'CSE (Final Year)',
        phone: '+91 91234 56780',
        whatsapp: '919123456780'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '10:00 AM - 01:00 PM',
      venue: 'Main Auditorium / Seminar Hall 1'
    },
    featuredTag: 'Flagship Tech',
    iconName: 'FileText',
    accentColor: '#00F2FE'
  },
  {
    id: 'business-battle',
    eventId: 'TE02',
    sheetSlug: 'business-battle',
    title: 'Business Battle',
    category: 'Technical',
    tagline: 'From Code to Capital: The Ultimate Startup Pitch.',
    shortDescription: 'Pitch your startup vision, revenue models, market defensibility, and tech prototypes before angel mentors and venture judges.',
    fullDescription: 'Business Battle challenges entrepreneurial technologists to transform code into commercially viable ventures. Pitch your deck, defend unit economics, calculate customer acquisition cost (CAC), and prove market product-market fit.',
    teamSize: {
      min: 2,
      max: 4,
      description: '2 to 4 Members per Team'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Executive Pitch Deck Screening',
        description: 'Submission of a 10-slide pitch deck covering Problem, Solution, Market Size, Tech Architecture, and Revenue Model.',
        duration: 'Pre-event'
      },
      {
        roundNumber: 2,
        title: 'Shark Arena Live Defense',
        description: '7-minute live investor pitch with product demo, followed by 5 minutes of intensive shark interrogation by VC judges.',
        duration: '12 Mins / Team'
      }
    ],
    rules: [
      'Teams must submit their pitch deck in PDF format 24 hours prior to the event.',
      'Working prototypes or live MVP links receive significant bonus points.',
      'Plagiarized ideas or misleading financial projections result in disqualification.'
    ],
    judgingCriteria: [
      'Market Opportunity & Problem Significance (25%)',
      'Product Innovation & Technical Defensibility (25%)',
      'Business Model, Monetization & Unit Economics (25%)',
      'Pitch Delivery & Q&A Handling (25%)'
    ],
    prizes: {
      first: '₹5,000 Cash Prize + Incubation Mentorship Pass + Trophy',
      second: '₹3,000 Cash Prize + Certificate of Excellence',
      third: '₹1,500 Cash Prize + Certificate of Merit',
      allParticipants: 'Certificate of National Participation'
    },
    coordinators: [
      {
        name: 'Dr. A. Venkatesh',
        role: 'Faculty Coordinator',
        department: 'CSBS',
        phone: '+91 98402 88776',
        whatsapp: '919840288776'
      },
      {
        name: 'Ananya S',
        role: 'Student Coordinator',
        department: 'CSBS (Final Year)',
        phone: '+91 98401 11223',
        whatsapp: '919840111223'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '10:30 AM - 01:30 PM',
      venue: 'MBA Seminar Hall (Block 1)'
    },
    featuredTag: 'Startup Pitch',
    iconName: 'TrendingUp',
    accentColor: '#38BDF8'
  },
  {
    id: 'mind-sparks',
    eventId: 'TE03',
    sheetSlug: 'mind-sparks',
    title: 'Mind Sparks',
    category: 'Technical',
    tagline: 'High-Octane Algorithmic & Cognitive Trivia Clash.',
    shortDescription: 'Test your computing speed, system trivia, algorithm deciphering, and tech puzzle-solving in an electrifying buzzer arena.',
    fullDescription: 'Mind Sparks is not an ordinary quiz. It is a high-speed battle of intellect where teams crack cryptographic ciphers, identify obscure tech history, solve algorithmic logic riddles, and master rapid-fire buzzer rounds.',
    teamSize: {
      min: 1,
      max: 2,
      description: '1 or 2 Members per Team'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Pen & Pixel Prelims',
        description: '30-minute written/digital test featuring 40 tricky algorithmic, OS, AI trivia, and puzzle questions. Top 6 teams qualify.',
        duration: '30 Mins'
      },
      {
        roundNumber: 2,
        title: 'Grand Buzzer Stage Finals',
        description: 'Live 4-stage finals: Tech Connect, Audio-Visual Clues, Code Output Deciphering, and Rapid-Fire Negative Buzzer Round.',
        duration: '60 Mins'
      }
    ],
    rules: [
      'Electronic devices strictly prohibited during preliminary testing.',
      'Negative marking applies in final buzzer round (-5 for wrong buzz).',
      'Quizmaster decision is indisputable.'
    ],
    judgingCriteria: [
      'Speed & Accuracy in Prelims (Rankings)',
      'Stage Round Point Accumulation'
    ],
    prizes: {
      first: '₹4,000 Cash Prize + Trophy + Certificate',
      second: '₹2,500 Cash Prize + Certificate',
      third: '₹1,000 Cash Prize + Certificate'
    },
    coordinators: [
      {
        name: 'Dr. M. K. Prakash',
        role: 'Faculty Coordinator',
        department: 'CSE',
        phone: '+91 97890 12345',
        whatsapp: '919789012345'
      },
      {
        name: 'Siddharth M',
        role: 'Student Coordinator',
        department: 'CSE (3rd Year)',
        phone: '+91 90031 99887',
        whatsapp: '919003199887'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '11:00 AM - 01:00 PM',
      venue: 'CSE Smart Classroom 2'
    },
    iconName: 'Zap',
    accentColor: '#F59E0B'
  },
  {
    id: 'editomania',
    eventId: 'TE04',
    sheetSlug: 'editomania',
    title: 'EditoMania',
    category: 'Technical',
    tagline: 'UI/UX Prototyping & Visual Storytelling Showdown.',
    shortDescription: 'Craft immersive modern user interfaces and motion graphics on surprise real-world product themes within tight time limits.',
    fullDescription: 'EditoMania puts your creative frontend and design chops to the test. Combine Figma prototyping, aesthetic color theory, micro-interaction animation, and visual storytelling to build intuitive digital experiences.',
    teamSize: {
      min: 1,
      max: 2,
      description: 'Individual or Team of 2'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Theme Release & Rapid Prototyping',
        description: 'Surprise problem statement unveiled. 90 minutes to design an end-to-end interactive mobile/web prototype in Figma.',
        duration: '90 Mins'
      },
      {
        roundNumber: 2,
        title: 'Design Walkthrough & Critique',
        description: '4-minute design defense presenting user journey, component hierarchy, accessibility choices, and micro-interactions.',
        duration: '5 Mins / Team'
      }
    ],
    rules: [
      'Participants may use Figma, Adobe XD, or Illustrator.',
      'Pre-built complete UI templates are strictly banned; pre-made icons/assets allowed with attribution.',
      'Final submission must be a live interactive Figma prototype link.'
    ],
    judgingCriteria: [
      'Aesthetic Design Quality & Modern Polish (35%)',
      'UX Flow & Problem Solving Logic (30%)',
      'Micro-Interactions & Prototyping Fidelity (20%)',
      'Presentation Defense (15%)'
    ],
    prizes: {
      first: '₹4,000 Cash Prize + Trophy + Certificate',
      second: '₹2,500 Cash Prize + Certificate',
      allParticipants: 'Certificate of National Participation'
    },
    coordinators: [
      {
        name: 'Prof. G. Hema',
        role: 'Faculty Coordinator',
        department: 'AI&DS',
        phone: '+91 98412 34567',
        whatsapp: '919841234567'
      },
      {
        name: 'Rithanya S',
        role: 'Student Coordinator',
        department: 'AI&DS (3rd Year)',
        phone: '+91 93456 78901',
        whatsapp: '919345678901'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '10:00 AM - 01:00 PM',
      venue: 'Design & Multimedia Lab (Block 3)'
    },
    iconName: 'Layout',
    accentColor: '#EC4899'
  },
  {
    id: 'lego-build-with-ai',
    eventId: 'TE05',
    sheetSlug: 'lego-build-with-ai',
    title: 'Lego Build with AI',
    category: 'Technical',
    tagline: 'Bridging Physical Modular Hardware with Generative AI.',
    shortDescription: 'Construct modular robotic/structural hardware prototypes and enhance them with custom AI prompt logic and vision systems.',
    fullDescription: 'An exhilarating fusion of tactile physical engineering and generative AI intelligence. Teams receive physical modular building components and a surprise structural challenge that must be interfaced or conceptualized with AI models.',
    teamSize: {
      min: 2,
      max: 3,
      description: '2 to 3 Members per Team'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Prompt-Driven Architecture Plan',
        description: 'Generate structural architectural blueprints using AI prompt engineering workflows.',
        duration: '30 Mins'
      },
      {
        roundNumber: 2,
        title: 'Physical Assembly & Integration',
        description: 'Hands-on construction and functional demonstration before the evaluation jury.',
        duration: '75 Mins'
      }
    ],
    rules: [
      'Modular building kits will be provided at the venue.',
      'Teams must bring at least one laptop for AI prompt synthesis and documentation.',
      'Destructive handling of components will lead to instant disqualification.'
    ],
    judgingCriteria: [
      'Structural Stability & Mechanical Ingenuity (35%)',
      'Creativity of AI Prompt Integration (35%)',
      'Demonstration & Live Testing (30%)'
    ],
    prizes: {
      first: '₹4,500 Cash Prize + Certificate of Excellence',
      second: '₹2,500 Cash Prize + Certificate',
      allParticipants: 'Certificate of National Participation'
    },
    coordinators: [
      {
        name: 'Dr. R. Karthikeyan',
        role: 'Faculty Coordinator',
        department: 'AIML',
        phone: '+91 98840 98765',
        whatsapp: '919884098765'
      },
      {
        name: 'Dinesh Kumar T',
        role: 'Student Coordinator',
        department: 'AIML (Final Year)',
        phone: '+91 97910 11223',
        whatsapp: '919791011223'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '11:00 AM - 01:30 PM',
      venue: 'Robotics & Embedded Systems Lab'
    },
    iconName: 'Cpu',
    accentColor: '#A855F7'
  },
  {
    id: 'cyber-investigation',
    eventId: 'TE06',
    sheetSlug: 'cyber-investigation',
    title: 'Cyber Investigation',
    category: 'Technical',
    tagline: 'Trace the Intrusion. Decode Digital Forensics.',
    shortDescription: 'Analyze simulated cyber security breaches, examine memory dumps, track malicious network packets, and solve CTF forensic clues.',
    fullDescription: 'Step into the boots of a cyber threat intelligence investigator. You are presented with compromised server logs, encrypted disk images, and intercepted packet captures. Trace the hacker, uncover IOCs (Indicators of Compromise), and submit the forensics incident report.',
    teamSize: {
      min: 2,
      max: 3,
      description: '2 to 3 Members per Team'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Forensic Triage & Packet Analysis',
        description: 'Identify the breach vector, decode Wireshark PCAPs, and extract the first malicious payload.',
        duration: '45 Mins'
      },
      {
        roundNumber: 2,
        title: 'CTF Reverse Engineering & Report',
        description: 'Decrypt the adversary communication channel, retrieve the flag, and document the vulnerability patch.',
        duration: '60 Mins'
      }
    ],
    rules: [
      'Teams must bring laptops configured with standard tools (Wireshark, FTK Imager, Ghidra, Volatility, CyberChef).',
      'Attacking the tournament infrastructure will result in immediate disqualification and campus blacklisting.',
      'Collaboration between different teams is strictly forbidden.'
    ],
    judgingCriteria: [
      'Accuracy of Captured Forensic Flags (50%)',
      'Investigation Speed & Timestamp Records (30%)',
      'Clarity of Incident Response Report (20%)'
    ],
    prizes: {
      first: '₹5,000 Cash Prize + Shield + Certificate',
      second: '₹3,000 Cash Prize + Certificate',
      allParticipants: 'Certificate of National Participation'
    },
    coordinators: [
      {
        name: 'Dr. P. Sundaram',
        role: 'Faculty Coordinator',
        department: 'Cyber Security',
        phone: '+91 94440 11223',
        whatsapp: '919444011223'
      },
      {
        name: 'Pragatheeshwaran K',
        role: 'Student Coordinator',
        department: 'Cyber Security (Final Year)',
        phone: '+91 96001 23499',
        whatsapp: '919600123499'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '10:00 AM - 01:00 PM',
      venue: 'Cyber Security War Room Lab'
    },
    featuredTag: 'High Stakes CTF',
    iconName: 'ShieldAlert',
    accentColor: '#10B981'
  },

  // ==========================================
  // NON-TECHNICAL EVENTS (6)
  // ==========================================
  {
    id: 'start-music',
    eventId: 'NT01',
    sheetSlug: 'start-music',
    title: 'Start Music',
    category: 'Non-Technical',
    tagline: 'Feel the Beat. Name the Track in Seconds.',
    shortDescription: 'The ultimate music guessing and rhythm showdown covering movie soundtracks, reverse melodies, and live karaoke cues.',
    fullDescription: 'Start Music brings the high-energy excitement of television game shows to the college auditorium. Test your music memory across 90s classics, viral beats, BGM recognition, and reverse audio puzzles.',
    teamSize: {
      min: 2,
      max: 3,
      description: '2 to 3 Members per Team'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Buzzer Beats Prelims',
        description: 'Guess the song from a 3-second isolated instrument intro or reverse audio clip.',
        duration: '30 Mins'
      },
      {
        roundNumber: 2,
        title: 'Lyric Flip & Rapid Melody Stage',
        description: 'Complete missing lyrics, identify singers, and buzz in on rapid medley mixes.',
        duration: '45 Mins'
      }
    ],
    rules: [
      'Buzzer priority decides who answers; prompt answers required within 5 seconds of buzzing.',
      'No Shazam, SoundHound, or smartphone assistance allowed.',
      'Audience prompts will nullify the question.'
    ],
    judgingCriteria: ['Point accumulation in finals buzzer rounds'],
    prizes: {
      first: '₹3,500 Cash Prize + Memento + Certificate',
      second: '₹2,000 Cash Prize + Certificate'
    },
    coordinators: [
      {
        name: 'Varun Teja',
        role: 'Student Coordinator',
        department: 'CSE (3rd Year)',
        phone: '+91 98409 55443',
        whatsapp: '919840955443'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '01:30 PM - 03:30 PM',
      venue: 'Open Air Amphitheatre'
    },
    iconName: 'Music',
    accentColor: '#EC4899'
  },
  {
    id: 'indo-japanese-game',
    eventId: 'NT02',
    sheetSlug: 'indo-japanese-game',
    title: 'Indo Japanese Game',
    category: 'Non-Technical',
    tagline: 'Traditional Strategy, Cognitive Reflexes & Dexterity.',
    shortDescription: 'Compete in fun, tactical mini-games blending traditional Indian and Japanese cultural strategy and physical dexterity challenges.',
    fullDescription: 'Experience an exotic blend of ancient cultural games and cognitive dexterity battles! From Kendama balance and Origami speed runs to Indian strategic board puzzles and chopstick bean sprints.',
    teamSize: {
      min: 1,
      max: 2,
      description: 'Individual or Duo'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Dexterity Sprint',
        description: 'Chopstick precision relay, Kendama balance tricks, and quick puzzle assembly.',
        duration: '30 Mins'
      },
      {
        roundNumber: 2,
        title: 'Strategic Mind Face-off',
        description: 'Speed tactical board game elimination rounds.',
        duration: '40 Mins'
      }
    ],
    rules: [
      'All game equipment provided by organizers.',
      'Strict time limits for each mini-game station.',
      'Fair play and sportsmanship mandatory.'
    ],
    judgingCriteria: ['Fastest completion time and total station score'],
    prizes: {
      first: '₹3,000 Cash Prize + Trophy + Certificate',
      second: '₹1,500 Cash Prize + Certificate'
    },
    coordinators: [
      {
        name: 'Swetha R',
        role: 'Student Coordinator',
        department: 'CSBS (2nd Year)',
        phone: '+91 97109 88776',
        whatsapp: '919710988776'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '02:00 PM - 04:00 PM',
      venue: 'Indoor Sports Complex Activity Hall'
    },
    iconName: 'Gamepad2',
    accentColor: '#F59E0B'
  },
  {
    id: 'ipl-auction',
    eventId: 'NT03',
    sheetSlug: 'ipl-auction',
    title: 'IPL Auction',
    category: 'Non-Technical',
    tagline: 'Strategic Bidding. Build the Ultimate Championship Squad.',
    shortDescription: 'Step into the shoes of franchise team owners with a fixed virtual purse to outbid rivals and assemble the highest-rated IPL XI.',
    fullDescription: 'Do you have the analytical acumen and cricketing intuition of a franchise owner? Manage an ₹80 Crore virtual budget, make high-stakes bidding decisions, balance overseas quotas, and build a championship-winning playing 11.',
    teamSize: {
      min: 3,
      max: 4,
      description: '3 to 4 Members per Team'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Cricket Trivia & Roster Strategy Prelims',
        description: 'Written cricket trivia & tactical player stats test to qualify for franchise bidding seats.',
        duration: '25 Mins'
      },
      {
        roundNumber: 2,
        title: 'Live Auctioneer Hammer Round',
        description: 'Intense live bidding with paddle raises, marquee player sets, accelerated bidding, and surprise player trade windows.',
        duration: '90 Mins'
      }
    ],
    rules: [
      'Each squad must have exactly 11 players including min 4 bowlers, min 1 wicketkeeper, and max 4 overseas stars.',
      'Teams going bankrupt before filling 11 slots are penalized heavily in ratings.',
      'Player ratings are pre-determined based on international and IPL career metrics.'
    ],
    judgingCriteria: [
      'Total Team Rating Points (60%)',
      'Budget Efficiency & Remaining Purse (20%)',
      'Squad Balance & Bowling Variety (20%)'
    ],
    prizes: {
      first: '₹4,500 Cash Prize + Champions Trophy + Certificates',
      second: '₹2,500 Cash Prize + Certificates'
    },
    coordinators: [
      {
        name: 'Gokulnath P',
        role: 'Student Coordinator',
        department: 'AI&DS (Final Year)',
        phone: '+91 99401 55667',
        whatsapp: '919940155667'
      },
      {
        name: 'Harish Kumar S',
        role: 'Student Coordinator',
        department: 'CSE (3rd Year)',
        phone: '+91 94451 22334',
        whatsapp: '919445122334'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '01:30 PM - 04:30 PM',
      venue: 'Main Auditorium Tier Hall'
    },
    featuredTag: 'High Energy Fan Favorite',
    iconName: 'Trophy',
    accentColor: '#38BDF8'
  },
  {
    id: 'reel-rush',
    eventId: 'NT04',
    sheetSlug: 'reel-rush',
    title: 'Reel Rush',
    category: 'Non-Technical',
    tagline: 'Shoot. Edit. Go Viral in 90 Minutes.',
    shortDescription: 'Capture on-campus symposium energy, edit crisp dynamic Instagram reels, and showcase your viral cinematography storytelling.',
    fullDescription: 'Reel Rush is the ultimate fast-paced filmmaking and video editing challenge. Participants receive dynamic campus prompts and have 90 minutes to shoot cinematic footage, add transitions, sound design, and submit a high-impact 30–60 second reel.',
    teamSize: {
      min: 1,
      max: 2,
      description: 'Individual or Duo'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Theme Drop & Shoot Window',
        description: 'Campus prompt announced. Capture 4K/HD video clips across symposium event venues.',
        duration: '60 Mins'
      },
      {
        roundNumber: 2,
        title: 'Rapid Cut & Color Grade',
        description: 'Post-production editing on mobile/laptop with background music and effects.',
        duration: '45 Mins'
      }
    ],
    rules: [
      'All footage must be recorded on campus on symposium day.',
      'Reel duration must strictly be between 30 and 60 seconds.',
      'Aspect ratio must be 9:16 (vertical mobile video).',
      'No copyrighted watermark or offensive content.'
    ],
    judgingCriteria: [
      'Cinematography & Camera Angles (30%)',
      'Editing Pace, Transitions & Sound Sync (30%)',
      'Creativity & Campus Vibe Capture (25%)',
      'Visual Color Grading (15%)'
    ],
    prizes: {
      first: '₹3,500 Cash Prize + Certificate',
      second: '₹2,000 Cash Prize + Certificate'
    },
    coordinators: [
      {
        name: 'Monisha B',
        role: 'Student Coordinator',
        department: 'AIML (2nd Year)',
        phone: '+91 93801 44556',
        whatsapp: '919380144556'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '01:00 PM - 03:30 PM',
      venue: 'Campus Wide / Media Center Hub'
    },
    iconName: 'Video',
    accentColor: '#A855F7'
  },
  {
    id: 'squid-game',
    eventId: 'NT05',
    sheetSlug: 'squid-game',
    title: 'Squid Game',
    category: 'Non-Technical',
    tagline: 'Outsmart. Outlast. Survive the Elimination Arena.',
    shortDescription: 'High-stakes obstacle rounds, red-light-green-light reaction tests, and survival strategy puzzles where one wrong move means elimination.',
    fullDescription: 'Inspired by iconic survival challenges, Squid Game puts your patience, reflex speed, equilibrium balance, and psychological endurance to the test across 4 intense knockout rounds.',
    teamSize: {
      min: 1,
      max: 1,
      description: 'Individual Participation Only'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Motion Freeze (Red Light, Green Light)',
        description: 'Sprint across the field and freeze immediately on sensory audio cue.',
        duration: '15 Mins'
      },
      {
        roundNumber: 2,
        title: 'Honeycomb Precision Carve',
        description: 'Delicate shape extraction without snapping fragile boundaries.',
        duration: '15 Mins'
      },
      {
        roundNumber: 3,
        title: 'Glass Bridge Balance',
        description: 'Memory step pathway across sensory ground pads.',
        duration: '20 Mins'
      }
    ],
    rules: [
      'Strict single-elimination at every round.',
      'Judges maintain zero tolerance on movement violations.',
      'Sports shoes recommended for agility.'
    ],
    judgingCriteria: ['Last player standing / Fastest flawless completion'],
    prizes: {
      first: '₹4,000 Cash Prize + The Golden Survivor Trophy + Certificate',
      second: '₹2,000 Cash Prize + Certificate'
    },
    coordinators: [
      {
        name: 'Sanjay Kumar V',
        role: 'Student Coordinator',
        department: 'Cyber Security (3rd Year)',
        phone: '+91 98410 77889',
        whatsapp: '919841077889'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '02:00 PM - 04:30 PM',
      venue: 'Central Quadrangle Ground'
    },
    featuredTag: 'Knockout Arena',
    iconName: 'Flame',
    accentColor: '#EF4444'
  },
  {
    id: 'clash-of-talent',
    eventId: 'NT06',
    sheetSlug: 'clash-of-talent',
    title: 'Clash of Talent',
    category: 'Non-Technical',
    tagline: 'Own the Spotlight. Dazzle the Audience.',
    shortDescription: 'An open-stage variety showcase for beatboxing, mimicry, stand-up comedy, instrumental solos, magic, and theatrical mastery.',
    fullDescription: 'Step onto the grand stage and leave the crowd spellbound! Whether you are a master of acoustic guitar, an illusionist, a mimicry artist, or an electrifying solo performer, Clash of Talent is your canvas.',
    teamSize: {
      min: 1,
      max: 2,
      description: 'Solo or Duo Performance'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Stage Showcase & Live Performance',
        description: '4-minute uninterrupted live performance before a 1,000+ member audience and celebrity artist jury.',
        duration: '4 Mins / Performance'
      }
    ],
    rules: [
      'Props or background music must be submitted 30 minutes prior to event commencement on a pen drive.',
      'Vulgarity, political satire, or offensive language will lead to immediate disqualification.',
      'Time limit strictly enforced (buzzer rings at 3:45 mins).'
    ],
    judgingCriteria: [
      'Stage Presence & Confidence (30%)',
      'Artistic Talent & Technical Skill (35%)',
      'Audience Engagement & Entertainment Value (25%)',
      'Adherence to Time Limits (10%)'
    ],
    prizes: {
      first: '₹4,000 Cash Prize + Memento + Certificate',
      second: '₹2,500 Cash Prize + Certificate'
    },
    coordinators: [
      {
        name: 'Keerthana M',
        role: 'Student Coordinator',
        department: 'CSBS (Final Year)',
        phone: '+91 97891 33221',
        whatsapp: '919789133221'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '02:30 PM - 04:45 PM',
      venue: 'Main Auditorium Grand Stage'
    },
    iconName: 'Sparkles',
    accentColor: '#00F2FE'
  },

  // ==========================================
  // SPECIAL EVENTS (4)
  // ==========================================
  {
    id: 'box-cricket',
    eventId: 'SP01',
    sheetSlug: 'box-cricket',
    title: 'Box Cricket',
    category: 'Special',
    tagline: 'Short Format. Maximum Voltage Turf Action.',
    shortDescription: 'High-speed 6-over turf cricket with customized box boundaries, sudden death overs, and electric running between wickets.',
    fullDescription: 'Box Cricket brings fast, thrilling cricket to the enclosed artificial turf. With restricted boundary dimensions, running bonus runs, and direct hit wickets, every ball delivers nail-biting suspense.',
    teamSize: {
      min: 6,
      max: 7,
      description: '6 Players + 1 Rolling Substitute'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Knockout Group Matches',
        description: '5-over per side knockout fixtures.',
        duration: '25 Mins / Match'
      },
      {
        roundNumber: 2,
        title: 'Grand Turf Final',
        description: '6-over high-pressure championship match.',
        duration: '40 Mins'
      }
    ],
    rules: [
      'Underarm bowling only; direct wall hits without pitch are declared out.',
      'Tennis ball with standard safety turf gear.',
      'Umpire decisions are final.'
    ],
    judgingCriteria: ['Match winning score and tournament bracket progress'],
    prizes: {
      first: '₹6,000 Cash Prize + Grand Champions Trophy + Medals',
      second: '₹3,500 Cash Prize + Runner Trophy + Medals'
    },
    coordinators: [
      {
        name: 'Ashwin S',
        role: 'Student Coordinator',
        department: 'CSE (Final Year)',
        phone: '+91 99621 88770',
        whatsapp: '919962188770'
      },
      {
        name: 'Praveen Raj',
        role: 'Student Coordinator',
        department: 'AIML (3rd Year)',
        phone: '+91 98402 11990',
        whatsapp: '919840211990'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '09:30 AM - 04:00 PM',
      venue: 'Sriram Turf Ground 1'
    },
    featuredTag: 'Mega Championship',
    iconName: 'Activity',
    accentColor: '#10B981'
  },
  {
    id: 'football',
    eventId: 'SP02',
    sheetSlug: 'football',
    title: '5-a-Side Football',
    category: 'Special',
    tagline: 'Speed. Tiki-Taka. Unstoppable Strikes.',
    shortDescription: '5-a-side knockout football tournament on synthetic turf testing tactical agility, fast passes, and goalkeeping reflexes.',
    fullDescription: 'Experience the electric intensity of 5-a-side futsal. Short halves, rolling substitutions, and compact pitch dimensions demand quick decision making, crisp passing, and lethal finishing.',
    teamSize: {
      min: 5,
      max: 7,
      description: '5 on field + 2 Substitutes'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Knockout Stages',
        description: '10-minute halves (5-minute break) knockout format.',
        duration: '25 Mins / Match'
      },
      {
        roundNumber: 2,
        title: 'Championship Final',
        description: '15-minute halves with sudden death penalty shootouts if tied.',
        duration: '35 Mins'
      }
    ],
    rules: [
      'No sliding tackles permitted on turf.',
      'Corner kicks and kick-ins from sidelines.',
      'Yellow/Red card disciplinary rules apply strictly.'
    ],
    judgingCriteria: ['Goal tally and knockout tournament advancement'],
    prizes: {
      first: '₹6,000 Cash Prize + Football Cup + Medals',
      second: '₹3,500 Cash Prize + Medals'
    },
    coordinators: [
      {
        name: 'Mohammed Faiz',
        role: 'Student Coordinator',
        department: 'Cyber Security (Final Year)',
        phone: '+91 97901 66554',
        whatsapp: '919790166554'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '09:30 AM - 04:00 PM',
      venue: 'Sriram Sports Complex Turf 2'
    },
    iconName: 'Award',
    accentColor: '#38BDF8'
  },
  {
    id: 'fashion-walk',
    eventId: 'SP03',
    sheetSlug: 'fashion-walk',
    title: 'Fashion Walk',
    category: 'Special',
    tagline: 'Couture. Poise. Thematic Runway Elegance.',
    shortDescription: 'Thematic runway ramp walk expressing high-fashion aesthetics, sustainability, cultural fusion, and commanding stage poise.',
    fullDescription: 'The runway is set! Fashion Walk invites style icons and creative designers to present curated themes: Cyberpunk Futurism, Indian Heritage Fusion, or Eco-Sustainable Haute Couture before an esteemed jury of fashion mentors.',
    teamSize: {
      min: 1,
      max: 2,
      description: 'Solo Model or Pair Walk'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Thematic Ramp Showcase',
        description: 'Ramp walk with background thematic track followed by 1-minute theme explanation to the jury.',
        duration: '3 Mins / Entry'
      }
    ],
    rules: [
      'Costumes and styling must maintain decorum and college cultural standards.',
      'Theme tracks must be submitted in MP3 format to audio console 45 mins prior to the event.',
      'Props allowed upon advance coordinator approval.'
    ],
    judgingCriteria: [
      'Attire Design & Thematic Cohesion (35%)',
      'Walk Confidence, Poise & Posture (35%)',
      'Overall Stage Presence (30%)'
    ],
    prizes: {
      first: '₹4,500 Cash Prize + Crown / Trophy + Certificate',
      second: '₹2,500 Cash Prize + Certificate'
    },
    coordinators: [
      {
        name: 'Sneha Priyadharshini',
        role: 'Student Coordinator',
        department: 'AI&DS (3rd Year)',
        phone: '+91 98408 22119',
        whatsapp: '919840822119'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '03:00 PM - 05:00 PM',
      venue: 'Main Auditorium Grand Ramp'
    },
    iconName: 'Crown',
    accentColor: '#EC4899'
  },
  {
    id: 'e-sports',
    eventId: 'SP04',
    sheetSlug: 'e-sports',
    title: 'E-Sports Arena',
    category: 'Special',
    tagline: 'Battlegrounds. Reflexes. Claim the Champion Chicken Dinner.',
    shortDescription: 'High-octane mobile battle royale showdown (BGMI & Free Fire) with custom room lobby matches and live-streamed commentary.',
    fullDescription: 'Gear up your squad for the ultimate gaming tournament! Compete in custom BGMI / Free Fire lobbies across Erangel and Bermuda maps. Coordinated rotations, zone control, and tactical gunplay will crown the supreme esports champions.',
    teamSize: {
      min: 4,
      max: 4,
      description: 'Squad of 4 Players'
    },
    rounds: [
      {
        roundNumber: 1,
        title: 'Qualifying Lobby Matches',
        description: '2 Erangel lobby matches. Top 8 squads qualify based on placement + kill points.',
        duration: '45 Mins'
      },
      {
        roundNumber: 2,
        title: 'Grand Finals Arena',
        description: '3 consecutive tournament maps with real-time broadcast and big screen live spectator view.',
        duration: '75 Mins'
      }
    ],
    rules: [
      'Players must bring their own mobile devices, charging cables, and earphones/headphones.',
      'Emulators, triggers, iPad devices, and hack clients are strictly banned; hardware inspections conducted before lobbies start.',
      'Stable college high-speed 5G Wi-Fi provided at the arena.'
    ],
    judgingCriteria: [
      'Kill Points (1 Pt / Frag) + Placement Multiplier Points'
    ],
    prizes: {
      first: '₹5,000 Cash Prize + MVP Trophy + Certificates',
      second: '₹3,000 Cash Prize + Certificates',
      third: '₹1,500 Cash Prize + Certificates'
    },
    coordinators: [
      {
        name: 'Naveen Kumar R',
        role: 'Student Coordinator',
        department: 'AIML (3rd Year)',
        phone: '+91 99402 77881',
        whatsapp: '919940277881'
      },
      {
        name: 'Deepak V',
        role: 'Student Coordinator',
        department: 'CSE (2nd Year)',
        phone: '+91 98841 33445',
        whatsapp: '919884133445'
      }
    ],
    schedule: {
      date: 'September 26, 2026',
      timeSlot: '11:00 AM - 03:30 PM',
      venue: 'High Performance Computing Lab (Block 2)'
    },
    featuredTag: 'Live Broadcast',
    iconName: 'Gamepad',
    accentColor: '#00F2FE'
  }
];
