import React from 'react';
import { HeroSection } from '@/components/hero/HeroSection';
import { EventItem } from '@/types';

import { DepartmentShowcaseSection } from '@/components/departments/DepartmentShowcaseSection';
import { EventsSection } from '@/components/events/EventsSection';
import { ScheduleSection } from '@/components/schedule/ScheduleSection';
import { VenueSection } from '@/components/venue/VenueSection';
// import { GallerySection } from '@/components/gallery/GallerySection';
import { SponsorsSection } from '@/components/sponsors/SponsorsSection';
import { FAQSection } from '@/components/faqs/FAQSection';
import {FlowingMenu} from '@/components/ui/FlowingMenu';
// import Lanyard from '@/components/ui/Lanyard';
import { REGISTRATION_FORM_URL } from '@/constants';
import { DepartmentsSection } from '@/components/departments/DepartmentsSection';

export const HomePage: React.FC = () => {
  const eventDate = import.meta.env.VITE_EVENT_DATE || '2026-09-26T09:00:00+05:30';

  const handleOpenRegister = (_event?: EventItem | null) => {
    window.open(REGISTRATION_FORM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      {/* 1. Hero Section & Countdown */}
      <HeroSection
        eventDate={eventDate}
        onOpenRegister={() => handleOpenRegister()}
      />



      {/* Flowing Menu Component for Extra Decoration */}
      <FlowingMenu
        items={[
          {
            link: "#events",
            text: "15 GRAND CHALLENGES",
            image: "https://res.cloudinary.com/zqpxemhd/image/upload/f_auto/q_auto/infinteMenuLogo.png"
          }
        ]}
        speed={15}
        textColor="#d0ff00ff"
        bgColor="#000000"
        marqueeBgColor="#ffffffff"
        marqueeTextColor="#000000ff"
        borderColor="#e5ff00ff"
      />

      {/* 3. Filterable 16 Events Catalog */}
      <EventsSection
        onOpenRegisterForEvent={(event) => handleOpenRegister(event)}
      />
            {/* 2. Co-Hosting Departments Showcase */}
      <DepartmentsSection />

      {/* 2.1 Department Associate Office Bearers 3D Infinite Showcase */}
      <DepartmentShowcaseSection />

      <SponsorsSection />


      {/* 4. Interactive Master Day Schedule */}
      <ScheduleSection />

      {/* 5. Campus Venue Locator & Transit */}
      <VenueSection />

      {/* 8. Frequently Asked Questions */}
      <FAQSection />
    </div>
  );
};

export default HomePage;
