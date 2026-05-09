import { useState } from 'react';
import './daltonico_setting.css';

const COLORBLIND_OPTIONS = [
  { id: 'tritanopia', label: 'Tritanopia' },
  { id: 'protanopia', label: 'Protanopia' },
  { id: 'deuteranopia', label: 'Deuteranopia' },
  { id: 'achromatopsia', label: 'Achromatopsia' },
];

function DaltonicoSetting() {
  const [enabled, setEnabled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? COLORBLIND_OPTIONS.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === COLORBLIND_OPTIONS.length - 1 ? 0 : prev + 1,
    );
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
            onChange={(e) => setEnabled(e.target.checked)}
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
