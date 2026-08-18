import React, { useState } from 'react';
import { EventItem } from '@/types';
import { HeroSection } from '@/components/hero/HeroSection';
import { DepartmentsSection } from '@/components/departments/DepartmentsSection';
import { EventsSection } from '@/components/events/EventsSection';
import { ScheduleSection } from '@/components/schedule/ScheduleSection';
import { VenueSection } from '@/components/venue/VenueSection';
import { GallerySection } from '@/components/gallery/GallerySection';
import { SponsorsSection } from '@/components/sponsors/SponsorsSection';
import { FAQSection } from '@/components/faqs/FAQSection';
import { RegistrationModal } from '@/components/registration/RegistrationModal';

export const HomePage: React.FC = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerEvent, setRegisterEvent] = useState<EventItem | null>(null);

  const eventDate = import.meta.env.VITE_EVENT_DATE || '2026-09-26T09:00:00+05:30';

  const handleOpenRegister = (event: EventItem | null = null) => {
    setRegisterEvent(event);
    setIsRegisterOpen(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
  };

  return (
    <div>
      {/* 1. Hero Section & Countdown */}
      <HeroSection
        eventDate={eventDate}
        onOpenRegister={() => handleOpenRegister(null)}
      />

      {/* 2. Co-Hosting Departments Showcase */}
      <DepartmentsSection />

      {/* 3. Filterable 16 Events Catalog */}
      <EventsSection
        onOpenRegisterForEvent={(event) => handleOpenRegister(event)}
      />

      {/* 4. Interactive Master Day Schedule */}
      <ScheduleSection />

      {/* 5. Campus Venue Locator & Transit */}
      <VenueSection />

      {/* 6. Photo Highlights Gallery */}
      <GallerySection />

      {/* 7. Corporate & Tech Partners */}
      <SponsorsSection />

      {/* 8. Frequently Asked Questions */}
      <FAQSection />

      {/* Global Interactive Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={handleCloseRegister}
        initialEvent={registerEvent}
      />
    </div>
  );
};

export default HomePage;
