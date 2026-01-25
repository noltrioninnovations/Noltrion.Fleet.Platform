import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './features/auth/Login';

import { PlanningBoard } from './features/planning/PlanningBoard';
import { PodApproval } from './features/monitoring/PodApproval';
import { TripManagement } from './features/monitoring/TripManagement';
import { Customers } from './features/master/Customers';
import { Vehicles } from './features/master/Vehicles';
import { Drivers } from './features/master/Drivers';
import { Jobs } from './features/jobs/Jobs';
import { Organizations } from './features/master/Organizations';
import { Users } from './features/admin/Users';
import { Invoices } from './features/billing/Invoices';
import { DashboardWrapper } from './features/dashboard/DashboardWrapper';
import { Manifests } from './features/fleet/Manifests';
import { JobRequests } from './features/portal/JobRequests';
import { CustomerManifests } from './features/portal/CustomerManifests';
import { OfficeJobRequests } from './features/office/OfficeJobRequests';

import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardWrapper />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="manifests" element={<Manifests />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="customers" element={<Customers />} />
              <Route path="planning" element={<PlanningBoard />} />
              <Route path="pod-approval" element={<PodApproval />} />
              <Route path="monitoring/trips" element={<TripManagement />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="organizations" element={<Organizations />} />
              <Route path="users" element={<Users />} />

              {/* Customer Portal */}
              <Route path="portal/requests" element={<JobRequests />} />
              <Route path="portal/manifests" element={<CustomerManifests />} />

              {/* Office / Internal */}
              <Route path="office/requests" element={<OfficeJobRequests />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
