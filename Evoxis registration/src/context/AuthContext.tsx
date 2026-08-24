import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffUser, StaffRole } from '../types';

interface AuthContextType {
  user: StaffUser | null;
  currentStation: string;
  assignedEventId?: string;
  soundEnabled: boolean;
  login: (role: StaffRole, station?: string, eventId?: string, name?: string) => void;
  logout: () => void;
  setStation: (station: string) => void;
  setAssignedEventId: (eventId: string) => void;
  toggleSound: () => void;
  hasRole: (roles: StaffRole[]) => boolean;
}

const AUTH_STORAGE_KEY = 'evoxis_op_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentStation, setCurrentStation] = useState<string>(() => {
    return user?.assignedStation || 'Reception Desk 1 (Main Gate A)';
  });

  const [assignedEventId, setAssignedEventIdState] = useState<string | undefined>(() => {
    return user?.assignedEventIds?.[0] || 'TE02';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (role: StaffRole, station?: string, eventId?: string, name?: string) => {
    const defaultNames: Record<StaffRole, string> = {
      SUPER_ADMIN: 'Super Administrator',
      RECEPTION: 'Reception Desk Lead',
      EVENT_COORDINATOR: 'Event Coordinator',
      FOOD_COUNTER: 'Food Counter Staff',
    };

    const newUser: StaffUser = {
      id: 'STAFF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      name: name || defaultNames[role],
      email: `${role.toLowerCase()}@evoxis26.internal`,
      role,
      assignedStation: station || currentStation,
      assignedEventIds: eventId ? [eventId] : ['TE02', 'TE01'],
      token: 'jwt_mock_' + Date.now(),
    };

    setUser(newUser);
    if (station) setCurrentStation(station);
    if (eventId) setAssignedEventIdState(eventId);
  };

  const logout = () => {
    setUser(null);
  };

  const setStation = (station: string) => {
    setCurrentStation(station);
    if (user) {
      setUser({ ...user, assignedStation: station });
    }
  };

  const setAssignedEventId = (eventId: string) => {
    setAssignedEventIdState(eventId);
    if (user) {
      setUser({ ...user, assignedEventIds: [eventId] });
    }
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const hasRole = (roles: StaffRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentStation,
        assignedEventId,
        soundEnabled,
        login,
        logout,
        setStation,
        setAssignedEventId,
        toggleSound,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
