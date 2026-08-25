import React, { createContext, useContext, useState } from 'react';
import { EventItem } from '@/types';
import { RegistrationModal } from '@/components/registration/RegistrationModal';

interface RegistrationModalContextType {
  openRegisterModal: (event?: EventItem | null) => void;
  closeRegisterModal: () => void;
  isRegisterModalOpen: boolean;
  preselectedEvent: EventItem | null;
}

const RegistrationModalContext = createContext<RegistrationModalContextType | undefined>(undefined);

export const RegistrationModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const openRegisterModal = (event: EventItem | null = null) => {
    setSelectedEvent(event || null);
    setIsOpen(true);
  };

  const closeRegisterModal = () => {
    setIsOpen(false);
  };

  return (
    <RegistrationModalContext.Provider
      value={{
        openRegisterModal,
        closeRegisterModal,
        isRegisterModalOpen: isOpen,
        preselectedEvent: selectedEvent,
      }}
    >
      {children}
      <RegistrationModal
        isOpen={isOpen}
        onClose={closeRegisterModal}
        initialEvent={selectedEvent}
      />
    </RegistrationModalContext.Provider>
  );
};

export const useRegistrationModal = (): RegistrationModalContextType => {
  const context = useContext(RegistrationModalContext);
  if (!context) {
    throw new Error('useRegistrationModal must be used within a RegistrationModalProvider');
  }
  return context;
};
