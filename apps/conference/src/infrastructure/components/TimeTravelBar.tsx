function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface Props {
  currentTime: Date
  onTimeChange: (date: Date) => void
  onReset: () => void
}

export default function TimeTravelBar({ currentTime, onTimeChange, onReset }: Props) {
  return (
    <div className="time-travel">
      <span className="time-travel__icon" aria-hidden>⏱</span>
      <label className="time-travel__label">
        <span className="time-travel__label-text">Time travel</span>
        <input
          className="time-travel__input"
          type="datetime-local"
          data-testid="time-travel-input"
          value={toDatetimeLocalValue(currentTime)}
          onChange={(e) => {
            const parsed = new Date(e.target.value)
            if (!isNaN(parsed.getTime())) onTimeChange(parsed)
          }}
        />
      </label>
      <button
        className="time-travel__reset"
        data-testid="time-travel-reset"
        onClick={onReset}
        aria-label="Reset to now"
      >
        ↺
      </button>
    </div>
  )
}
