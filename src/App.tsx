import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';


// Participant Pages
import { HomePage } from '@/pages/HomePage';
import { EventsPage } from '@/pages/EventsPage';
import { EventDetailPage } from '@/pages/EventDetailPage';


export const App: React.FC = () => {
  return (
    <BrowserRouter>

        <div className="w-full max-w-full min-h-screen bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black flex flex-col justify-between overflow-x-hidden">
          {/* Sticky Frosted Navbar */}
          <Navbar />

          {/* Dynamic Route Viewport */}
          <main className="flex-grow">
            <Routes>
              {/* Participant Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />

              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />
        </div>
    </BrowserRouter>
  );
};

export default App;
