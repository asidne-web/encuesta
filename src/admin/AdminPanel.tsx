import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AdminLayout } from './AdminLayout';
import { LoginScreen } from './LoginScreen';
import { DashboardPage } from './DashboardPage';
import { SubmissionDetail } from './SubmissionDetail';
import { generatePdf } from '../lib/generatePdf';
import type { SubmissionRow } from '../lib/adminService';

type AdminView = 'dashboard' | 'detail';

export const AdminPanel: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [view, setView] = useState<AdminView>('dashboard');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleViewDetail = useCallback((submission: SubmissionRow) => {
    setSelectedSubmission(submission);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGeneratePdf = useCallback(async (submission: SubmissionRow) => {
    try {
      await generatePdf(submission);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setView('dashboard');
    setSelectedSubmission(null);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    // Reload the selected submission data
    if (selectedSubmission) {
      // Force re-render to pick up changes
      handleBackToDashboard();
    }
  }, [selectedSubmission, handleBackToDashboard]);

  // Loading
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gradient-bg)',
      }}>
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  // Not authenticated → Login
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Authenticated → Admin
  return (
    <AdminLayout currentView={view} onNavigate={(v) => { setView(v); setSelectedSubmission(null); }}>
      {view === 'dashboard' && (
        <DashboardPage
          key={refreshKey}
          onViewDetail={handleViewDetail}
          onGeneratePdf={handleGeneratePdf}
        />
      )}
      {view === 'detail' && selectedSubmission && (
        <SubmissionDetail
          submission={selectedSubmission}
          onBack={handleBackToDashboard}
          onGeneratePdf={handleGeneratePdf}
          onRefresh={handleRefresh}
        />
      )}
    </AdminLayout>
  );
};
