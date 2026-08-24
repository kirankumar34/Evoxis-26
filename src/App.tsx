import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

// Participant Pages
import { HomePage } from '@/pages/HomePage';
import { EventsPage } from '@/pages/EventsPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { RegistrationSuccessPage } from '@/pages/RegistrationSuccessPage';
import { MyRegistrationPage } from '@/pages/MyRegistrationPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black flex flex-col justify-between">
        {/* Sticky Frosted Navbar */}
        <Navbar />

        {/* Dynamic Route Viewport */}
        <main className="flex-grow">
          <Routes>
            {/* Participant-Only Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/registration-success" element={<RegistrationSuccessPage />} />
            <Route path="/my-registration" element={<MyRegistrationPage />} />
            <Route path="/qr" element={<MyRegistrationPage />} />

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
