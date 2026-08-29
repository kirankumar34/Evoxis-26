import React from 'react';
import { HeroSection } from '@/components/hero/HeroSection';
import { DepartmentsSection } from '@/components/departments/DepartmentsSection';
import { EventsSection } from '@/components/events/EventsSection';
import { ScheduleSection } from '@/components/schedule/ScheduleSection';
import { VenueSection } from '@/components/venue/VenueSection';
// import { GallerySection } from '@/components/gallery/GallerySection';
// import { SponsorsSection } from '@/components/sponsors/SponsorsSection';
import { FAQSection } from '@/components/faqs/FAQSection';
import { useRegistrationModal } from '@/context/RegistrationModalContext';
import {FlowingMenu} from '@/components/ui/FlowingMenu';

export const HomePage: React.FC = () => {
  const { openRegisterModal } = useRegistrationModal();
  const eventDate = import.meta.env.VITE_EVENT_DATE || '2026-09-26T09:00:00+05:30';

  return (
    <div>
      {/* 1. Hero Section & Countdown */}
      <HeroSection
        eventDate={eventDate}
        onOpenRegister={() => openRegisterModal(null)}
      />

      {/* 2. Co-Hosting Departments Showcase */}
      <DepartmentsSection />

      {/* Flowing Menu Component for Extra Decoration */}
      <FlowingMenu
        items={[
          {
            link: "#events",
            text: "15 GRAND CHALLENGES",
            image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&h=400&fit=crop&auto=format"
          }
        ]}
        speed={15}
        textColor="#FFC928"
        bgColor="#070D1E"
        marqueeBgColor="#E2231A"
        marqueeTextColor="#FFFFFF"
        borderColor="#ffffff25"
      />

      {/* 3. Filterable 16 Events Catalog */}
      <EventsSection
        onOpenRegisterForEvent={(event) => openRegisterModal(event)}
      />

      {/* 4. Interactive Master Day Schedule */}
      <ScheduleSection />

      {/* 5. Campus Venue Locator & Transit */}
      <VenueSection />

      {/* 6. Photo Highlights Gallery */}
      {/* <GallerySection /> */}

      {/* 7. Corporate & Tech Partners */}
      {/* <SponsorsSection /> */}

      {/* 8. Frequently Asked Questions */}
      <FAQSection />
    </div>
  );
};

export default HomePage;
