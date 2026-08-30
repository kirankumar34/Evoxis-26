import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/hero/HeroSection';

import { DepartmentShowcaseSection } from '@/components/departments/DepartmentShowcaseSection';
import { EventsSection } from '@/components/events/EventsSection';
import { ScheduleSection } from '@/components/schedule/ScheduleSection';
import { VenueSection } from '@/components/venue/VenueSection';
// import { GallerySection } from '@/components/gallery/GallerySection';
// import { SponsorsSection } from '@/components/sponsors/SponsorsSection';
import { FAQSection } from '@/components/faqs/FAQSection';
import {FlowingMenu} from '@/components/ui/FlowingMenu';
// import Lanyard from '@/components/ui/Lanyard';
import { DepartmentsSection } from '@/components/departments/DepartmentsSection';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const eventDate = import.meta.env.VITE_EVENT_DATE || '2026-09-26T09:00:00+05:30';

  return (
    <div>
      {/* 1. Hero Section & Countdown */}
      <HeroSection
        eventDate={eventDate}
        onOpenRegister={() => navigate('/register')}
      />



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
        onOpenRegisterForEvent={(event) => navigate(`/register?event=${event.eventId}`)}
      />
            {/* 2. Co-Hosting Departments Showcase */}
      <DepartmentsSection />

      {/* 2.1 Department Associate Office Bearers 3D Infinite Showcase */}
      <DepartmentShowcaseSection />

      {/* 4. Interactive Master Day Schedule */}
      <ScheduleSection />

      {/* 5. Campus Venue Locator & Transit */}
      <VenueSection />

      {/* <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} /> */}

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
