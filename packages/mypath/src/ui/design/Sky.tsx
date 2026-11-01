// Decorative sky behind the event flags. Stays put while the grid scrolls;
// CSS reads --sx (scrollLeft) for parallax: near clouds 0.4x, far ones 0.2x.
const CLOUDS = [
  { left: -4, top: 34, scale: 1.1, dur: 30, far: false },
  { left: 30, top: 10, scale: 0.6, dur: 40, far: true },
  { left: 52, top: 46, scale: 1, dur: 34, far: false },
  { left: 78, top: 16, scale: 0.7, dur: 44, far: true },
  { left: 104, top: 40, scale: 1.2, dur: 32, far: false },
  { left: 124, top: 8, scale: 0.6, dur: 42, far: true },
]

export default function Sky() {
  return (
    <div className="mp-tp-sky-scene" aria-hidden="true">
      {[true, false].map(far => (
        <div key={String(far)} className={`mp-tp-clouds${far ? ' far' : ''}`}>
          {CLOUDS.filter(c => c.far === far).map((c, i) => (
            <svg
              key={i}
              className="mp-tp-cloud"
              viewBox="0 0 260 56"
              style={{
                left: `${c.left}%`,
                top: c.top,
                width: 260 * c.scale,
                animationDuration: `${c.dur}s`,
                // Negative delay so clouds start mid-drift, not all in sync.
                animationDelay: `${-i * 9}s`,
              }}
            >
              <path
                d={
                  'M0 56c6-14 26-20 44-14 6-18 32-26 50-12' +
                  ' 12-24 52-26 66 0 10-8 28-6 36 6' +
                  ' 14-6 32-2 44 12 8 0 16 4 20 8z'
                }
              />
            </svg>
          ))}
        </div>
      ))}
    </div>
  )
}
