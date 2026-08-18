import { DepartmentInfo } from '@/types';

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'csbs',
    shortCode: 'CSBS',
    fullName: 'Computer Science and Business Systems',
    hodName: 'Dr. S. Rajalakshmi',
    tagline: 'Bridging Enterprise Strategy with Cutting-Edge Computation',
    description: 'Pioneering multidisciplinary innovation by uniting advanced software engineering, computational finance, cloud ERP, and executive technology strategy.',
    icon: 'Briefcase',
    accentColor: '#00F2FE',
    stats: [
      { label: 'Industry Ties', value: '15+ MNCs' },
      { label: 'Focus', value: 'Enterprise Tech' }
    ]
  },
  {
    id: 'cse',
    shortCode: 'CSE',
    fullName: 'Computer Science and Engineering',
    hodName: 'Dr. M. K. Prakash',
    tagline: 'Foundations of Algorithms, Distributed Systems & Global Tech',
    description: 'The core powerhouse driving algorithmic excellence, compiler construction, scalable distributed systems, high-performance computing, and open-source breakthroughs.',
    icon: 'Terminal',
    accentColor: '#38BDF8',
    stats: [
      { label: 'Coding Hub', value: '24/7 Labs' },
      { label: 'Alumni', value: 'Global Reach' }
    ]
  },
  {
    id: 'aids',
    shortCode: 'AI&DS',
    fullName: 'Artificial Intelligence & Data Science',
    hodName: 'Dr. V. Anitha',
    tagline: 'Extracting Wisdom from Massive Data & Cognitive Architectures',
    description: 'Empowering future data architects with advanced machine learning pipelines, predictive neural networks, computer vision, and big data infrastructure.',
    icon: 'Brain',
    accentColor: '#A855F7',
    stats: [
      { label: 'Compute Power', value: 'GPU Clusters' },
      { label: 'Focus', value: 'Deep Learning' }
    ]
  },
  {
    id: 'aiml',
    shortCode: 'AIML',
    fullName: 'Artificial Intelligence and Machine Learning',
    hodName: 'Dr. R. Karthikeyan',
    tagline: 'Architecting Autonomous Intelligence & Next-Gen Neural Systems',
    description: 'Specializing in generative AI, large language models, reinforcement learning, robotics vision, and adaptive human-computer cognition.',
    icon: 'Cpu',
    accentColor: '#EC4899',
    stats: [
      { label: 'GenAI Lab', value: 'Active R&D' },
      { label: 'Focus', value: 'Autonomous AI' }
    ]
  },
  {
    id: 'cyber',
    shortCode: 'Cyber Security',
    fullName: 'Department of Cyber Security',
    hodName: 'Dr. P. Sundaram',
    tagline: 'Defending Cyberspace with Offensive Forensics & Cryptography',
    description: 'Forging cyber warriors skilled in zero-trust architecture, ethical hacking, digital forensics, malware reverse engineering, and defensive threat intelligence.',
    icon: 'ShieldCheck',
    accentColor: '#10B981',
    stats: [
      { label: 'War Room', value: 'CTF Arena' },
      { label: 'Focus', value: 'Defensive Ops' }
    ]
  }
];
