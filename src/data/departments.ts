import { DepartmentInfo } from '@/types';
import { LOGOS } from '@/constants';

export const DEPARTMENTS: DepartmentInfo[] = [
  {

    id: 'cse',
    shortCode: 'CSE',
    hodName: 'Ms A. LAVANYA',
    fullName: 'Computer Science  Engineering',
    logoUrl: LOGOS.CSE,
    accentColor: '#A855F7',
  },
  {
    id: 'aids',
    shortCode: 'AI&DS',
    hodName: 'Ms. S. ESTHEER PRAVEENA',
    fullName: 'Artificial Intelligence & Data Science',
    logoUrl: LOGOS.AIDS,
    accentColor: '#000000ff',
  },
  {
    id: 'aiml',
    shortCode: 'AIML',
    hodName: 'Dr. M. KUMAR',
    fullName: 'Artificial Intelligence & Machine Learning',
    logoUrl: LOGOS.AIML,
    accentColor: '#EC4899',
  },
  {
    id: 'cyber',
    shortCode: 'CYS',
    hodName: 'Dr. K. C. JAYASANKAR',
    fullName: 'Cyber Security',
    logoUrl: LOGOS.CYBER,
    accentColor: '#10B981',
  },
  {
    id: 'csbs',
    shortCode: 'CSBS',
    hodName: 'Ms. A. PRAVEENA',
    fullName: 'Computer Science & Business Systems',
    logoUrl: LOGOS.CSBS,
    accentColor: '#00F2FE',
  },
];

