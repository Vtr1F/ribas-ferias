import { useState } from 'react';
import './daltonico_setting.css';
import { SettingsManager, DaltonismModes } from '../../constants/settingsData';

const COLORBLIND_OPTIONS = [
  { id: DaltonismModes.DEUTERANOMALY, label: 'Deuteranomaly' },
  { id: DaltonismModes.PROTONOMALY, label: 'Protonomaly' },
  { id: DaltonismModes.DEUTERANOPIA, label: 'Deuteranopia' },
  { id: DaltonismModes.PROTANOPIA, label: 'Protanopia' },
];

const modeIndexMap = Object.fromEntries(
  COLORBLIND_OPTIONS.map((opt, idx) => [opt.id, idx])
);

function DaltonicoSetting() {
  const [enabled, setEnabled] = useState(() => {
    try { return SettingsManager.GetSetting("DALTONISM") ?? false; }
    catch { return false; }
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    try { return modeIndexMap[SettingsManager.GetSetting("DALTONISM_MODE")] ?? 0; }
    catch { return 0; }
  });

  const toggleEnabled = (e) => {
    const next = e.target.checked;
    setEnabled(next);
    try { SettingsManager.SaveSettings({ ...SettingsManager.GetSettings(), DALTONISM: next }); }
    catch { /* localStorage not available */ }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const next = prev === 0 ? COLORBLIND_OPTIONS.length - 1 : prev - 1;
      const mode = COLORBLIND_OPTIONS[next].id;
      try { SettingsManager.SaveSettings({ ...SettingsManager.GetSettings(), DALTONISM: enabled, DALTONISM_MODE: mode }); }
      catch { /* localStorage not available */ }
      return next;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const next = prev === COLORBLIND_OPTIONS.length - 1 ? 0 : prev + 1;
      const mode = COLORBLIND_OPTIONS[next].id;
      try { SettingsManager.SaveSettings({ ...SettingsManager.GetSettings(), DALTONISM: enabled, DALTONISM_MODE: mode }); }
      catch { /* localStorage not available */ }
      return next;
    });
  };

  const currentOption = COLORBLIND_OPTIONS[currentIndex];

  return (
    <div className="daltonico-setting">
      <div className="daltonico-setting-header">
        <span className="daltonico-setting-label">Opcões de Daltonismo</span>
        <label className="daltonico-toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={toggleEnabled}
          />
          <span className="daltonico-toggle-slider" />
        </label>
      </div>
      {enabled && (
        <div className="daltonico-selector">
          <button
            className="daltonico-arrow"
            onClick={handlePrev}
            aria-label="Previous colorblind option"
          >
            ❮
          </button>
          <span className="daltonico-current-option">
            {currentOption.label}
          </span>
          <button
            className="daltonico-arrow"
            onClick={handleNext}
            aria-label="Next colorblind option"
          >
            ❯
          </button>
        </div>
      )}
    </div>
  );
}

export default DaltonicoSetting;
