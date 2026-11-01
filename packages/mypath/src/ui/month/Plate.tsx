// Fallback cover tile. Solid subject colour = owned; tinted with a coloured
// outline = not bought yet (same encoding as the All timeline).
export default function Plate({
  text,
  color,
  owned,
}: {
  text: string
  color: string
  owned: boolean
}) {
  return (
    <span
      className="mp-plate"
      style={
        owned
          ? { background: color, color: '#fff' }
          : {
              background: `${color}1c`,
              color,
              boxShadow: `inset 0 0 0 2px ${color}`,
            }
      }
    >
      {text}
    </span>
  )
}
