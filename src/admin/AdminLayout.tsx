import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './AdminLayout.css';

type AdminView = 'dashboard' | 'detail';

interface AdminLayoutProps {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentView,
  onNavigate,
  children,
}) => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userEmail = user?.email || 'admin';
  const userInitial = userEmail.charAt(0).toUpperCase();

  const navItems = [
    { id: 'dashboard' as AdminView, icon: '📊', label: 'Dashboard' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__brand">RentaFácil</div>
          <div className="admin-sidebar__subtitle">Panel de Administración</div>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`admin-sidebar__link ${currentView === item.id ? 'admin-sidebar__link--active' : ''}`}
              onClick={() => {
                onNavigate(item.id);
                setSidebarOpen(false);
              }}
            >
              <span className="admin-sidebar__link-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <a href="/" className="admin-sidebar__link" style={{ marginTop: 'auto' }}>
            <span className="admin-sidebar__link-icon">🌐</span>
            Encuesta pública
          </a>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">{userInitial}</div>
            <div className="admin-sidebar__user-info">
              <div className="admin-sidebar__user-name">{userEmail}</div>
              <div className="admin-sidebar__user-role">Administrador</div>
            </div>
          </div>
          <button className="admin-sidebar__logout" onClick={signOut}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        className="admin-sidebar__mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Main content */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};
