export interface StationConfig {
  id: string;
  name: string;
  category: 'RECEPTION' | 'EVENT' | 'FOOD' | 'ADMIN';
  defaultLocation: string;
  assignedEventId?: string;
}

export const PRESET_STATIONS: StationConfig[] = [
  // Reception Desks
  { id: 'REC-01', name: 'Reception Desk 1 (Main Gate A)', category: 'RECEPTION', defaultLocation: 'Main Entrance Lobby' },
  { id: 'REC-02', name: 'Reception Desk 2 (Main Gate B)', category: 'RECEPTION', defaultLocation: 'Main Entrance Lobby' },
  { id: 'REC-03', name: 'Reception Desk 3 (Helpdesk & Query)', category: 'RECEPTION', defaultLocation: 'Admin Block Front' },

  // Food Counter Stations
  { id: 'FOOD-01', name: 'Food Counter 1 (Auditorium North)', category: 'FOOD', defaultLocation: 'Dining Hall A' },
  { id: 'FOOD-02', name: 'Food Counter 2 (Auditorium South)', category: 'FOOD', defaultLocation: 'Dining Hall B' },
  { id: 'FOOD-03', name: 'Food Counter 3 (VIP & Coordinators)', category: 'FOOD', defaultLocation: 'Executive Lounge' },

  // Super Admin Stations
  { id: 'ADM-01', name: 'Super Admin Command Center', category: 'ADMIN', defaultLocation: 'Control Room 101' },
];
