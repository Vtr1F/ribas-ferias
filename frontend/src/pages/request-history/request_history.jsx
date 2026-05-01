import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/auth-context";
import { RequestRoutes } from "../../api/requestRoutes";
import Header from '../../components/header/header';
import "./request_history.css";
import RequestDetailOverlay from '../../components/request_detail_overlay';
import RequestHistoryRow from "../../components/request_history_row";




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

  // Map request ID to its number (oldest = #1, going up to newest)
  const requestNumberMap = useMemo(() => {
    const sorted = [...requests].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    const map = {};
    sorted.forEach((req, idx) => {
      map[req.id] = idx + 1;
    });
    return map;
  }, [requests]);

  const filtered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (typeFilter !== "all" && r.request_type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchReason = r.reason?.toLowerCase().includes(q);
      if (!matchReason) return false;
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
              <span>Avatar</span>
              <span>Tipo</span>
              <span>Estado</span>
              <span>Dias</span>
              <span>Nº</span>
              <span>Data</span>
              <span>Motivo</span>
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
                <div 
                  key={req.id} 
                  className="rh-row-clickable"
                  onClick={() => setSelectedRequest(req)}
                >
                  <RequestHistoryRow
                    req={req}
                    requestNumber={requestNumberMap[req.id] || idx + 1}
                  />
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
          showUserInfo={false}
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
