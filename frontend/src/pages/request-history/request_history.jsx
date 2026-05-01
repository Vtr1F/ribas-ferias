import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth-context";
import { RequestRoutes } from "../../api/requestRoutes";
import UserAvatar from "../../components/user_avatar";
import Header from '../../components/header/header';
import "./request_history.css";

// --- Constants ---
const TYPE_LABELS = {
  Vacation: "Férias",
  SickLeave: "Baixa Médica",
  ParentalLeave: "Licença Parental",
  BereavementLeave: "Luto",
};

const TYPE_ICONS = {
  Vacation: "🌴",
  SickLeave: "🤒",
  ParentalLeave: "👶",
  BereavementLeave: "🕊️",
};

const STATUS_CONFIG = {
  Pending:  { label: "Pendente",  className: "badge-pending"  },
  Approved: { label: "Aprovado",  className: "badge-approved" },
  Rejected: { label: "Rejeitado", className: "badge-rejected" },
};

// --- Helpers ---
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatDay(dayStr) {
  if (!dayStr || String(dayStr).length !== 8) return dayStr;
  const s = String(dayStr);
  return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;
}

// --- Sub-components ---
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className={`rh-badge ${cfg.className}`}>
      <span className="rh-badge-dot" />
      {cfg.label}
    </span>
  );
}

//Download
function Download(filePath) {
  const fileName = filePath.split(/[\\/]/).pop(); 
  RequestRoutes.downloadFile(fileName);
}

function DaysList({ days }) {
  const [expanded, setExpanded] = useState(false);
  const MAX = 3;
  const formatted = (days || []).map(formatDay);
  const shown = expanded ? formatted : formatted.slice(0, MAX);
  const rest = formatted.length - MAX;

  return (
    <div className="rh-days-list">
      {shown.map((d, i) => (
        <span key={i} className="rh-day-chip">{d}</span>
      ))}
      {!expanded && rest > 0 && (
        <button className="rh-expand-btn" onClick={() => setExpanded(true)}>
          +{rest} mais
        </button>
      )}
      {expanded && rest > 0 && (
        <button className="rh-expand-btn" onClick={() => setExpanded(false)}>
          menos
        </button>
      )}
    </div>
  );
}

function RequestDetailOverlay({ req, member, onClose }) {
  if (!req) return null;

  const displayName = member?.nome || member?.name || "O meu perfil";

  return (
    <div className="tr-modal-overlay" onClick={onClose}>
      <div className="tr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tr-modal-header">
          <h2>Detalhes do Pedido</h2>
          <button className="tr-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="tr-modal-body">
          <div className="tr-detail-user">
            <UserAvatar 
              userId={req.user_id} 
              name={displayName} 
              size="large" 
            />
            <div className="tr-detail-user-info">
              <h3>{displayName}</h3>
            </div>
          </div>

          <div className="tr-detail-grid">
            <div className="tr-detail-item">
              <strong>Tipo:</strong>
              <span> {TYPE_ICONS[req.request_type]} {TYPE_LABELS[req.request_type] || req.request_type}</span>
            </div>
            <div className="tr-detail-item">
              <strong>Estado:</strong> <StatusBadge status={req.status} />
            </div>
            <div className="tr-detail-item">
              <strong>Submetido em:</strong> {formatDate(req.created_at)}
            </div>
            <div className="tr-detail-item">
              <strong>Duração:</strong> {req.days?.length} dias
            </div>
            {req.file_path && (
               <div className="tr-detail-item">
                <strong>Anexo:</strong>
                <button 
                  className="rh-btn-download" 
                  onClick={() => Download(req.file_path)}
                >
                  Download
                </button>
              </div>
            )}
          </div>

          <div className="tr-detail-days-section">
            <strong>Dias Solicitados:</strong>
            <div className="tr-detail-days-grid">
              {req.days?.map(d => <span key={d} className="tr-day-chip">{formatDay(d)}</span>)}
            </div>
          </div>

          {req.reason && (
            <div className="tr-detail-reason">
              <strong>Motivo / Justificação:</strong>
              <p>{req.reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function RequestHistory() {
  const { user } = useAuth();
  const userId = user?.sub;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [search, setSearch]             = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    RequestRoutes.fetchUserRequest(userId)
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRequests(sorted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (typeFilter !== "all" && r.request_type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchReason = r.reason?.toLowerCase().includes(q);
      const matchType   = TYPE_LABELS[r.request_type]?.toLowerCase().includes(q);
      if (!matchReason && !matchType) return false;
    }
    return true;
  });

  const stats = {
    total:    requests.length,
    pending:  requests.filter((r) => r.status === "Pending").length,
    approved: requests.filter((r) => r.status === "Approved").length,
    rejected: requests.filter((r) => r.status === "Rejected").length,
  };

  const hasFilters = statusFilter !== "all" || typeFilter !== "all" || !!search;

  return (
    <div className="rh-page">
      <Header /> 
      
      <div className="rh-header">
        <h1 className="main-title">Histórico de Pedidos</h1>
        <p className="rh-subtitle">Todos os teus pedidos de ausência numa só vista</p>
      </div>

      {/* Stats */}
      <div className="rh-stats-grid">
        {[
          { label: "Total",      value: stats.total,    mod: "blue"   },
          { label: "Pendentes",  value: stats.pending,  mod: "yellow" },
          { label: "Aprovados",  value: stats.approved, mod: "green"  },
          { label: "Rejeitados", value: stats.rejected, mod: "red"    },
        ].map((s) => (
          <div key={s.label} className={`rh-stat-card rh-stat-${s.mod}`}>
            <span className="rh-stat-value">{loading ? "—" : s.value}</span>
            <span className="rh-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rh-filters">
        <div className="rh-search-wrap">
          <span className="rh-search-icon">🔍</span>
          <input
            className="rh-search"
            type="text"
            placeholder="Pesquisar por motivo ou tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="rh-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos os estados</option>
          <option value="Pending">Pendente</option>
          <option value="Approved">Aprovado</option>
          <option value="Rejected">Rejeitado</option>
        </select>

        <select
          className="rh-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Todos os tipos</option>
          <option value="Vacation">Férias</option>
          <option value="SickLeave">Baixa Médica</option>
          <option value="ParentalLeave">Licença Parental</option>
          <option value="BereavementLeave">Luto</option>
        </select>

        {hasFilters && (
          <button
            className="rh-clear-btn"
            onClick={() => { setStatusFilter("all"); setTypeFilter("all"); setSearch(""); }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rh-table-card">

        {loading ? (
          <div className="rh-state-center">
            <div className="rh-spinner" />
            <p>A carregar pedidos...</p>
          </div>
        ) : error ? (
          <div className="rh-state-center rh-error">⚠️ {error}</div>
        ) : (
          <>
            {/* Table head */}
            <div className="rh-table-head">
              <span>#</span>
              <span>Tipo</span>
              <span>Estado</span>
              <span>Dias</span>
              <span>Nº Dias</span>
              <span>Data Pedido</span>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="rh-state-center">
                <span className="rh-empty-icon">{hasFilters ? "🔍" : "📭"}</span>
                <p className="rh-empty-title">
                  {hasFilters ? "Nenhum pedido encontrado" : "Sem pedidos ainda"}
                </p>
                <p className="rh-empty-sub">
                  {hasFilters ? "Tenta ajustar os filtros" : "Os teus pedidos aparecerão aqui"}
                </p>
              </div>
            ) : (
              filtered.map((req, idx) => (
                <div key={req.id} className={`rh-table-row ${idx % 2 === 0 ? "" : "rh-row-alt"}`}
                onClick={() => setSelectedRequest(req)} style={{ cursor: 'pointer' }}>
                  <span className="rh-id">#{req.id}</span>

                  <div className="rh-type-cell">
                    <span className="rh-type-label">
                      <span className="rh-type-icon">{TYPE_ICONS[req.request_type] || "📋"}</span>
                      {TYPE_LABELS[req.request_type] || req.request_type}
                    </span>
                    {req.reason && (
                      <p className="rh-reason">{req.reason}</p>
                    )}
                  </div>

                  <div>
                    <StatusBadge status={req.status} />
                  </div>

                  <DaysList days={req.days} />

                  <span className="rh-count">
                    {req.days?.length ?? 0} dia{req.days?.length !== 1 ? "s" : ""}
                  </span>

                  <span className="rh-date">{formatDate(req.created_at)}</span>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Modal Details */}
      {selectedRequest && (
        <RequestDetailOverlay 
          req={selectedRequest} 
          member={user}
          onClose={() => setSelectedRequest(null)} 
        />
      )}

      {/* Footer count */}
      {!loading && !error && filtered.length > 0 && (
        <p className="rh-footer-count">
          A mostrar {filtered.length} de {requests.length} pedido{requests.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
