import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

// Pages
import { HomePage } from '@/pages/HomePage';
import { RegisterPage } from '@/pages/RegisterPage';
import { RegistrationSuccessPage } from '@/pages/RegistrationSuccessPage';
import { MyRegistrationPage } from '@/pages/MyRegistrationPage';
import { CommitteeLoginPage } from '@/pages/committee/CommitteeLoginPage';
import { CommitteeDashboardPage } from '@/pages/committee/CommitteeDashboardPage';
import { ReceptionScannerPage } from '@/pages/committee/ReceptionScannerPage';
import { EventScannerPage } from '@/pages/committee/EventScannerPage';
import { AttendanceManagerPage } from '@/pages/committee/AttendanceManagerPage';
import { AdminEventsPage } from '@/pages/admin/AdminEventsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black flex flex-col justify-between">
        {/* Sticky Frosted Navbar */}
        <Navbar />

        {/* Dynamic Route Viewport */}
        <main className="flex-grow">
          <Routes>
            {/* Public Visitor Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/registration-success" element={<RegistrationSuccessPage />} />
            <Route path="/my-registration" element={<MyRegistrationPage />} />
            <Route path="/qr" element={<MyRegistrationPage />} />

            {/* Committee & Admin Scanner Routes */}
            <Route path="/committee/login" element={<CommitteeLoginPage />} />
            <Route path="/committee/dashboard" element={<CommitteeDashboardPage />} />
            <Route path="/committee/reception-scanner" element={<ReceptionScannerPage />} />
            <Route path="/committee/event-scanner" element={<EventScannerPage />} />
            <Route path="/committee/attendance" element={<AttendanceManagerPage />} />
            <Route path="/admin/events" element={<AdminEventsPage />} />

            {/* Fallback */}
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
