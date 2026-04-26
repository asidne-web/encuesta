import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  fetchDashboardStats,
  fetchSubmissions,
  updateSubmissionStatus,
  type SubmissionRow,
  type DashboardStats,
  type StatusFilter,
} from '../lib/adminService';
import './DashboardPage.css';

interface DashboardPageProps {
  onViewDetail: (submission: SubmissionRow) => void;
  onGeneratePdf: (submission: SubmissionRow) => void;
}

/* ---- Stat Card ---- */
const StatCard: React.FC<{
  icon: string;
  label: string;
  value: number;
  variant: string;
}> = ({ icon, label, value, variant }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="stat-card"
  >
    <div className="stat-card__header">
      <div className={`stat-card__icon stat-card__icon--${variant}`}>{icon}</div>
    </div>
    <div className="stat-card__value">{value}</div>
    <div className="stat-card__label">{label}</div>
  </motion.div>
);

/* ---- Status Badge ---- */
const StatusBadge: React.FC<{ status: SubmissionRow['status'] }> = ({ status }) => {
  const config: Record<string, { emoji: string; label: string }> = {
    pending: { emoji: '🟡', label: 'Pendiente' },
    reviewed: { emoji: '🔵', label: 'Revisado' },
    completed: { emoji: '🟢', label: 'Completado' },
    archived: { emoji: '⚫', label: 'Archivado' },
  };
  const { emoji, label } = config[status] || config.pending;
  return <span className={`status-badge status-badge--${status}`}>{emoji} {label}</span>;
};

/* ---- Status Select (inline) ---- */
const StatusSelect: React.FC<{
  current: SubmissionRow['status'];
  onChange: (s: SubmissionRow['status']) => void;
}> = ({ current, onChange }) => (
  <select
    className="table-toolbar__filter"
    value={current}
    onChange={(e) => onChange(e.target.value as SubmissionRow['status'])}
    style={{ fontSize: '11px', padding: '4px 8px' }}
  >
    <option value="pending">🟡 Pendiente</option>
    <option value="reviewed">🔵 Revisado</option>
    <option value="completed">🟢 Completado</option>
    <option value="archived">⚫ Archivado</option>
  </select>
);

/* ---- Main Dashboard ---- */
export const DashboardPage: React.FC<DashboardPageProps> = ({
  onViewDetail,
  onGeneratePdf,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const pageSize = 15;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, subsData] = await Promise.all([
        fetchDashboardStats(),
        fetchSubmissions({
          status: statusFilter,
          search: searchDebounced,
          page,
          pageSize,
        }),
      ]);
      setStats(statsData);
      setSubmissions(subsData.data);
      setTotal(subsData.total);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchDebounced, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchDebounced]);

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: SubmissionRow['status']) => {
    try {
      await updateSubmissionStatus(id, newStatus);
      await loadData(); // refresh
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div>
      <div className="admin-content__header">
        <div>
          <h1 className="admin-content__title">Dashboard</h1>
          <p className="admin-content__subtitle">
            Gestión de cuestionarios IRPF 2025
          </p>
        </div>
        <button className="table-action" onClick={loadData} style={{ padding: '8px 16px' }}>
          🔄 Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="stats-grid">
          <StatCard icon="📋" label="Total recibidas" value={stats.total} variant="total" />
          <StatCard icon="🟡" label="Pendientes" value={stats.pending} variant="pending" />
          <StatCard icon="🔵" label="Revisadas" value={stats.reviewed} variant="reviewed" />
          <StatCard icon="🟢" label="Completadas" value={stats.completed} variant="completed" />
          <StatCard icon="📅" label="Hoy" value={stats.today} variant="today" />
        </div>
      )}

      {/* Toolbar */}
      <div className="table-toolbar">
        <input
          className="table-toolbar__search"
          type="text"
          placeholder="🔍 Buscar por nombre o NIF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="table-toolbar__filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">🟡 Pendientes</option>
          <option value="reviewed">🔵 Revisados</option>
          <option value="completed">🟢 Completados</option>
          <option value="archived">⚫ Archivados</option>
        </select>
      </div>

      {/* Table */}
      <div className="submissions-table-wrap">
        {loading ? (
          <div className="loading-spinner">Cargando encuestas...</div>
        ) : submissions.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty__icon">📭</div>
            <p>No se encontraron encuestas</p>
          </div>
        ) : (
          <>
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Contribuyente</th>
                  <th>NIF</th>
                  <th>Estado</th>
                  <th>Cambiar estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="submissions-table__date">
                      {formatDate(sub.submitted_at)}
                    </td>
                    <td className="submissions-table__name">{sub.client_name}</td>
                    <td className="submissions-table__nif">{sub.client_nif}</td>
                    <td>
                      <StatusBadge status={sub.status} />
                    </td>
                    <td>
                      <StatusSelect
                        current={sub.status}
                        onChange={(s) => handleStatusChange(sub.id, s)}
                      />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="table-action"
                          onClick={() => onViewDetail(sub)}
                        >
                          👁️ Ver
                        </button>
                        <button
                          className="table-action table-action--pdf"
                          onClick={() => onGeneratePdf(sub)}
                        >
                          📄 PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="table-pagination">
              <span>
                Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
              </span>
              <div className="table-pagination__buttons">
                <button
                  className="table-pagination__btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Anterior
                </button>
                <button
                  className="table-pagination__btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
