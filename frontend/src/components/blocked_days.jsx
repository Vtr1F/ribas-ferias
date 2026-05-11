import { useState, useEffect } from 'react';
import './blocked_days.css';
import { RequestRoutes } from '../api/requestRoutes';

const DAYS_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function formatDate(year, month, day) {
  return `${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;
}

function parseDate(dateStr) {
  return {
    year: parseInt(dateStr.slice(0, 4)),
    month: parseInt(dateStr.slice(4, 6)) - 1,
    day: parseInt(dateStr.slice(6, 8)),
  };
}

function displayDate(dateStr) {
  const { year, month, day } = parseDate(dateStr);
  return `${String(day).padStart(2, '0')} ${MONTHS[month]} ${year}`;
}

function BlockedDays() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [approvedDays, setApprovedDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApprovedDays() {
      try {
        const data = await RequestRoutes.fetchRequests();
        const approved = data
          .filter(r => r.status === 'Approved')
          .flatMap(r => r.days.map(d => String(d)));
        setApprovedDays([...new Set(approved)].sort());
      } catch (err) {
        console.error('Erro ao buscar pedidos aprovados:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApprovedDays();
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="blocked-days-section">
      <h2>Dias Bloqueados</h2>
      <p className="section-desc">
        Dias ja aprovados que ficam automaticamente bloqueados para novos pedidos.
      </p>

      <div className="bd-calendar">
        <div className="bd-calendar-nav">
          <button onClick={prevMonth}>&#8249;</button>
          <span>{MONTHS[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth}>&#8250;</button>
        </div>

        <div className="bd-calendar-grid">
          {DAYS_LABELS.map(l => (
            <div key={l} className="bd-day-label">{l}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const key = formatDate(viewYear, viewMonth, day);
            const isBlocked = approvedDays.includes(key);
            return (
              <div
                key={key}
                className={`bd-day${isBlocked ? ' bd-day--blocked' : ''}`}
                title={isBlocked ? 'Dia com aprovacao' : ''}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bd-list">
        <div className="bd-list-title">Dias com pedidos aprovados</div>
        {loading ? (
          <div className="bd-list-empty">A carregar...</div>
        ) : approvedDays.length === 0 ? (
          <div className="bd-list-empty">Nenhum dia bloqueado.</div>
        ) : (
          approvedDays.map(d => (
            <span key={d} className="bd-tag">{displayDate(d)}</span>
          ))
        )}
      </div>
    </div>
  );
}

export default BlockedDays;
