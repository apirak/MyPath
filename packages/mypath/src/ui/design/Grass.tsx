// Decorative grass along the bottom of the event strip. Scrolls 1:1 with the
// grid (unlike Sky); positions are % of the strip width.
const GRASS = [
  1, 4.5, 9, 13, 18.5, 22, 27, 31.5, 35, 40, 44.5, 48, 53, 57.5, 61, 66, 70.5,
  74, 79, 83.5, 87, 92, 96, 99,
]

export default function Grass() {
  return (
    <div className="mp-tp-grass-row" aria-hidden="true">
      {GRASS.map((left, i) => (
        <svg
          key={left}
          className="mp-tp-grass"
          viewBox="0 0 20 10"
          style={{
            left: `${left}%`,
            animationDelay: `${-i * 0.37}s`,
            scale: i % 3 ? '1' : '1.4',
          }}
        >
          <path
            d={
              'M1 10C3 6 4 4 4 0c2 3 3 6 3 10M6 10c1-4 3-6 7-8-2 3-3 5-3 8' +
              'M10 10c2-3 5-5 9-5-3 2-5 3-6 5z'
            }
          />
        </svg>
      ))}
    </div>
  )
}
