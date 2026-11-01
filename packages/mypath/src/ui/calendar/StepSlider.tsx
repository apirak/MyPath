import type { CSSProperties } from 'react'

// 0–10 hour slider with tick labels. A native range input sits on top for
// a11y and keyboard; the track and marks underneath are decoration.
export default function StepSlider({
  label,
  value,
  min = 0,
  onChange,
}: {
  label: string
  value: number
  min?: number
  onChange: (value: number) => void
}) {
  const steps = Array.from({ length: 11 - min }, (_, index) => index + min)
  const progress = (value - min) / (10 - min)
  return (
    <label className="mp-scp-slider-control">
      <span>
        {label}
        <b>{value === 0 ? 'พัก' : `${value} ชม.`}</b>
      </span>
      <div
        className="mp-scp-step-slider"
        style={{ '--progress': `${progress * 100}%` } as CSSProperties}
      >
        <i className="mp-scp-step-track" aria-hidden="true">
          <i />
        </i>
        <input
          className="mp-scp-step-input"
          aria-label={label}
          type="range"
          min={min}
          max="10"
          step="1"
          value={value}
          onChange={event => onChange(Number(event.target.value))}
        />
        <span className="mp-scp-step-marks" aria-hidden="true">
          {steps.map(step => (
            <i key={step} className={step === value ? 'active' : ''}>
              <b>{step}</b>
            </i>
          ))}
        </span>
      </div>
    </label>
  )
}
