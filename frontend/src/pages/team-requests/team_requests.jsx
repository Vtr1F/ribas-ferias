import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/auth-context';
import { TeamRoutes } from '../../api/teamRoutes';
import { RequestRoutes } from '../../api/requestRoutes';
import { ROLES } from '../../constants/roles';
import Header from '../../components/header/header';
import UserAvatar from '../../components/user_avatar';
import ConfirmModal from '../../components/confirm_modal'; // Ajusta o caminho se necessário
import './team_requests.css';
import { TYPE_LABELS,TYPE_ICONS } from '../../constants/requestConstants';
import RequestDetailOverlay from '../../components/request_detail_overlay';
import { STATUS_CONFIG } from '../../constants/requestConstants';
import RequestRow from '../../components/request_row';

// --- Main Page ---
export default function TeamRequests() {
  const { user: currentUser } = useAuth();
  const isAdmin  = currentUser?.role === ROLES.ADMIN;
  const isLeader = currentUser?.role === ROLES.TEAM_LEADER;

  const [teams, setTeams]               = useState([]);
  const [requestsByTeam, setRequestsByTeam] = useState({});
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingReqs, setLoadingReqs]   = useState(false);
  const [error, setError]               = useState(null);
  const [collapsedTeams, setCollapsedTeams] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch]             = useState('');
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Estados para o Modal de Confirmação
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDecision, setPendingDecision] = useState(null);

  const fetchAllRequests = async (teamList) => {
    setLoadingReqs(true);
    try {
      const results = await Promise.all(
        teamList.map((t) =>
          RequestRoutes.fetchTeamRequest(t.id)
            .then((reqs) => ({ teamId: t.id, reqs }))
            .catch(() => ({ teamId: t.id, reqs: [] }))
        )
      );
      const map = {};
      results.forEach(({ teamId, reqs }) => { map[teamId] = reqs; });
      setRequestsByTeam(map);
    } finally {
      setLoadingReqs(false);
    }
  };

  const triggerDecision = (requestId, decisionType) => {
    setPendingDecision({ id: requestId, type: decisionType });
    setShowConfirm(true);
  };

  const handleConfirmDecision = async () => {
    if (!pendingDecision) return;
    
    const { id, type } = pendingDecision;
    const actionText = type === 'accept' ? 'aprovar' : 'rejeitar';
    
    setIsActionLoading(true);
    setShowConfirm(false);

    try {
      if (type === 'accept') {
        await RequestRoutes.sendAcceptRequest(id);
      } else {
        await RequestRoutes.sendRejectRequest(id);
      }
      
      await fetchAllRequests(teams); 
      setSelectedRequest(null);
    } catch (err) {
      alert(`Erro ao ${actionText} o pedido. Por favor, tente novamente.`);
      console.error(err);
    } finally {
      setIsActionLoading(false);
      setPendingDecision(null);
    }
  };

  // Fetch teams on mount
  useEffect(() => {
    setLoadingTeams(true);
    TeamRoutes.fetchTeams()
      .then((data) => {
        const visible = isAdmin
          ? data
          : data.filter((t) => t.leader_id === currentUser?.sub);
        setTeams(visible);
        fetchAllRequests(visible);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingTeams(false));
  }, []);

  // Build member lookup map per team
  const memberMapByTeam = useMemo(() => {
    const result = {};
    teams.forEach((t) => {
      const map = {};
      (t.members || []).forEach((m) => { map[m.id] = m; });
      result[t.id] = map;
    });
    return result;
  }, [teams]);

  // Stats across all teams
  const allRequests = useMemo(() =>
    Object.values(requestsByTeam).flat(), [requestsByTeam]);

  const stats = {
    total:    allRequests.length,
    pending:  allRequests.filter((r) => r.status === 'Pending').length,
    approved: allRequests.filter((r) => r.status === 'Approved' || r.status === 'Accepted').length,
    rejected: allRequests.filter((r) => r.status === 'Rejected').length,
  };

  const toggleTeam = (id) =>
    setCollapsedTeams((prev) => ({ ...prev, [id]: !prev[id] }));

  // Filter requests
  const getFilteredReqs = (teamId) => {
    const reqs = requestsByTeam[teamId] || [];
    return reqs
      .filter((r) => statusFilter === 'all' || r.status === statusFilter)
      .filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const member = memberMapByTeam[teamId]?.[r.user_id];
        return (
          member?.nome?.toLowerCase().includes(q) ||
          r.reason?.toLowerCase().includes(q) ||
          TYPE_LABELS[r.request_type]?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const loading = loadingTeams || loadingReqs;

  return (
    <div className="tr-page">
      <Header />

      <div className="page-header">
        <h1>Pedidos por Equipa</h1>
      </div>

      <div className="tr-stats-grid">
        {[
          { label: 'Total',      value: stats.total,    mod: 'blue'   },
          { label: 'Pendentes',  value: stats.pending,  mod: 'yellow' },
          { label: 'Aprovados',  value: stats.approved, mod: 'green'  },
          { label: 'Rejeitados', value: stats.rejected, mod: 'red'    },
        ].map((s) => (
          <div key={s.label} className={`tr-stat-card tr-stat-${s.mod}`}>
            <span className="tr-stat-value">{loading ? '—' : s.value}</span>
            <span className="tr-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="users-container">
        <div className="users-header">
          <div className="search-wrapper">
            <span className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              type="text"
              className="users-search"
              placeholder="Pesquisar por colaborador, motivo ou tipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="tr-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os estados</option>
            <option value="Pending">Pendente</option>
            <option value="Approved">Aprovado</option>
            <option value="Rejected">Rejeitado</option>
          </select>

          {(statusFilter !== 'all' || search) && (
            <button
              className="tr-clear-btn"
              onClick={() => { setStatusFilter('all'); setSearch(''); }}
            >
              Limpar
            </button>
          )}
        </div>

        <div className="users-list">
          {loading && !teams.length ? (
            <div className="tr-state-center">
              <div className="tr-spinner" />
              <p>A carregar pedidos...</p>
            </div>
          ) : error ? (
            <p className="users-error">⚠️ {error}</p>
          ) : teams.length === 0 ? (
            <p className="users-no-results">Nenhuma equipa encontrada.</p>
          ) : (
            teams.map((team) => {
              const filtered = getFilteredReqs(team.id);
              const collapsed = collapsedTeams[team.id];
              const total     = (requestsByTeam[team.id] || []).length;
              const pending   = (requestsByTeam[team.id] || []).filter((r) => r.status === 'Pending').length;

              return (
                <div key={team.id} className="team-group">
                  <div className="team-header">
                    <div className="team-header-left" onClick={() => toggleTeam(team.id)}>
                      <span className="team-toggle">{collapsed ? '▶' : '▼'}</span>
                      <span className="team-name">{team.team_name}</span>
                      {team.description && (
                        <span className="team-description">{team.description}</span>
                      )}
                    </div>
                    <div className="team-header-right">
                      {pending > 0 && (
                        <span className="tr-pending-pill">{pending} pendente{pending !== 1 ? 's' : ''}</span>
                      )}
                      <span className="team-member-count">{total} pedido{total !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {!collapsed && (
                    <div className="tr-requests-container">
                      {filtered.length > 0 && (
                        <div className="tr-table-head">
                          <span>Colaborador</span>
                          <span>Tipo</span>
                          <span>Estado</span>
                          <span>Dias</span>
                          <span>Nº</span>
                          <span>Data</span>
                          <span>Motivo</span>
                        </div>
                      )}

                      {filtered.length === 0 ? (
                        <div className="tr-empty">
                          {(requestsByTeam[team.id] || []).length === 0
                            ? '📭 Sem pedidos nesta equipa'
                            : '🔍 Nenhum pedido corresponde aos filtros'}
                        </div>
                      ) : (
                        filtered.map((req) => (
                          <div 
                            key={req.id} 
                            className="tr-row-clickable" 
                            onClick={() => setSelectedRequest({ req, member: memberMapByTeam[team.id]?.[req.user_id] })}
                          >
                            <RequestRow
                              req={req}
                              memberMap={memberMapByTeam[team.id] || {}}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL DE DETALHES */}
      {selectedRequest && (
        <RequestDetailOverlay 
          req={selectedRequest.req}
          member={selectedRequest.member}
          isLoading={isActionLoading}
          onClose={() => setSelectedRequest(null)}
          onDecision={triggerDecision}
        />
      )}

      <ConfirmModal
        isOpen={showConfirm}
        title={pendingDecision?.type === 'accept' ? "Aprovar Pedido" : "Rejeitar Pedido"}
        message={`Tem a certeza que deseja ${pendingDecision?.type === 'accept' ? 'aprovar' : 'rejeitar'} este pedido?`}
        onConfirm={handleConfirmDecision}
        onCancel={() => {
          setShowConfirm(false);
          setPendingDecision(null);
        }}
        confirmClass={pendingDecision?.type === 'accept' ? 'btn-success' : 'btn-danger'}
      />
    </div>
  );
}