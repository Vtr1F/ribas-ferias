import { useState } from 'react';
import Header from './header/header';
import './settings.css';
import BlockedDays from './blocked_days';
import MinMaxDays from './min_max_days';

function Settings() {
  const [minMax, setMinMax] = useState({ min: 1, max: 30 });

  return (
    <main className="settings-content">
      <Header />
      <h1>Settings</h1>
      <BlockedDays />
      <MinMaxDays minDays={minMax.min} maxDays={minMax.max} onChange={setMinMax} />
    </main>
  );
}

export default Settings;