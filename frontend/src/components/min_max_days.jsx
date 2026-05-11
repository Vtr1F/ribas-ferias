import { useState } from 'react';
import './min_max_days.css';

function Stepper({ value, onChange, min = 1, max = 365, hasError }) {
  function decrement() { if (value > min) onChange(value - 1); }
  function increment() { if (value < max) onChange(value + 1); }

  function handleInput(e) {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) onChange(val);
  }

  return (
    <div className="minmax-stepper">
      <button onClick={decrement} disabled={value <= min}>-</button>
      <input
        type="number"
        value={value}
        onChange={handleInput}
        min={min}
        max={max}
        className={hasError ? 'minmax-error' : ''}
      />
      <button onClick={increment} disabled={value >= max}>+</button>
      <span className="minmax-unit">dias</span>
    </div>
  );
}

function MinMaxDays({ minDays = 1, maxDays = 30, onChange }) {
  const [min, setMin] = useState(minDays);
  const [max, setMax] = useState(maxDays);
  const hasError = min >= max;

  function handleMinChange(val) { setMin(val); onChange?.({ min: val, max }); }
  function handleMaxChange(val) { setMax(val); onChange?.({ min, max: val }); }

  return (
    <div className="minmax-section">
      <h2>Dias Minimos e Maximos</h2>
      <p className="section-desc">
        Define o intervalo de dias permitido por pedido de ausencia.
      </p>

      <div className="minmax-card">
        <div className="minmax-field">
          <label>Minimo</label>
          <p className="minmax-hint">Numero minimo de dias por pedido</p>
          <Stepper value={min} onChange={handleMinChange} min={1} max={max - 1} hasError={hasError} />
        </div>

        <div className="minmax-field">
          <label>Maximo</label>
          <p className="minmax-hint">Numero maximo de dias por pedido</p>
          <Stepper value={max} onChange={handleMaxChange} min={min + 1} max={365} hasError={hasError} />
        </div>

        {hasError && (
          <p className="minmax-validation-error">O minimo deve ser menor que o maximo.</p>
        )}
      </div>
    </div>
  );
}

export default MinMaxDays;
