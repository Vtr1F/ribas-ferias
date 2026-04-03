import MainLayout from '../layouts/main-layout';
import './dashboard.css'

function Dashboard() {
 const currentYear = 2026;
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = Array.from({ length: 12 }, (_, i) => i); // [0, 1, 2...11]

  return (
    <MainLayout>
      <main className="dashboard-content">
        <div className="year-grid-container">
          
          {/* We map directly here */}
          {months.map((monthIndex) => {
            const monthDate = new Date(currentYear, monthIndex);
            const monthName = monthDate.toLocaleString('default', { month: 'long' });
            const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
            const firstDayIndex = new Date(currentYear, monthIndex, 1).getDay();

            return (
              <div className="calendar-card" key={monthIndex}>
                <header className="calendar-header">
                  <h2>{monthName} {currentYear}</h2>
                </header>
                <div className="calendar-grid">
                  {weekDays.map(day => <div key={day} className="weekday-label">{day}</div>)}
                  
                  {/* Empty slots for start of month */}
                  {[...Array(firstDayIndex)].map((_, i) => (
                    <div key={`empty-${i}`} className="calendar-day empty"></div>
                  ))}
                  
                  {/* Actual days */}
                  {[...Array(daysInMonth)].map((_, i) => (
                    <div key={i + 1} className="calendar-day">{i + 1}</div>
                  ))}
                </div>
              </div>
            );
          })}

        </div>
      </main>
    </MainLayout>
  );
}

export default Dashboard;