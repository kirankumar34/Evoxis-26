import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReceptionPage } from './pages/ReceptionPage';
import { EventsHubPage } from './pages/EventsHubPage';
import { EventScanPage } from './pages/EventScanPage';
import { FoodPage } from './pages/FoodPage';
import { ParticipantDetailPage } from './pages/ParticipantDetailPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { StaffRole } from './types';

import { QrGeneratorPage } from './pages/QrGeneratorPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: StaffRole[];
}> = ({ children, allowedRoles }) => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    // Redirect to default route for their role
    if (user.role === 'RECEPTION') return <Navigate to="/reception" replace />;
    if (user.role === 'EVENT_COORDINATOR') return <Navigate to="/events" replace />;
    if (user.role === 'FOOD_COUNTER') return <Navigate to="/food" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main Layout Wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Super Admin Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Reception Desk */}
            <Route
              path="/reception"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RECEPTION']}>
                  <ReceptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reception/scan"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RECEPTION']}>
                  <ReceptionPage />
                </ProtectedRoute>
              }
            />

            {/* Event Desks */}
            <Route
              path="/events"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'EVENT_COORDINATOR']}>
                  <EventsHubPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:eventId"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'EVENT_COORDINATOR']}>
                  <EventScanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:eventId/scan"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'EVENT_COORDINATOR']}>
                  <EventScanPage />
                </ProtectedRoute>
              }
            />

            {/* Food Counter */}
            <Route
              path="/food"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FOOD_COUNTER']}>
                  <FoodPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food/scan"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FOOD_COUNTER']}>
                  <FoodPage />
                </ProtectedRoute>
              }
            />

            {/* Participant Profile Inspector */}
            <Route
              path="/participants/:id"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'RECEPTION']}>
                  <ParticipantDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Audit Logs */}
            <Route
              path="/audit"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <AuditLogPage />
                </ProtectedRoute>
              }
            />

            {/* QR Code Inventory Generator */}
            <Route
              path="/admin/qr-generator"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <QrGeneratorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qr-generator"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <QrGeneratorPage />
                </ProtectedRoute>
              }
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Default fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
};
