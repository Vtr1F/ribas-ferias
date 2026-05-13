import Header from './header/header';
import DaltonicoSetting from './daltonico_setting/daltonico_setting';
import './settings.css';

function Settings() {
  return (
    <main className="settings-content">
      <Header />
      <h1>Settings</h1>
      <div className="settings-accessibility">
        <h2 className="settings-section-title">Accessibility</h2>
        <DaltonicoSetting />
      </div>
    </main>
  );
}

export default Settings;