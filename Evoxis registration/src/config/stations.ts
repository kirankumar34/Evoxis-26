export interface StationConfig {
  id: string;
  name: string;
  category: 'RECEPTION' | 'EVENT' | 'ADMIN';
  defaultLocation: string;
  assignedEventId?: string;
}

export const PRESET_STATIONS: StationConfig[] = [
  // Reception Desks
  { id: 'REC-01', name: 'Reception Desk 1 (Main Gate A)', category: 'RECEPTION', defaultLocation: 'Main Entrance Lobby' },
  { id: 'REC-02', name: 'Reception Desk 2 (Main Gate B)', category: 'RECEPTION', defaultLocation: 'Main Entrance Lobby' },
  { id: 'REC-03', name: 'Reception Desk 3 (Helpdesk & Query)', category: 'RECEPTION', defaultLocation: 'Admin Block Front' },

  // Super Admin Stations
  { id: 'ADM-01', name: 'Super Admin Command Center', category: 'ADMIN', defaultLocation: 'Control Room 101' },
];
