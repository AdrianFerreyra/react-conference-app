import { useState, useEffect, useMemo } from 'react'
import type { Event } from '../domain/Event'
import type { Clock } from '../application/ports/Clock'
import type { ScheduleRepository } from '../application/ports/ScheduleRepository'
import { getSchedule } from '../application/useCases/getSchedule'
import { getCurrentEvent } from '../application/useCases/getCurrentEvent'
import { getUpcomingEvents } from '../application/useCases/getUpcomingEvents'

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface Props {
  clock: Clock
  repository: ScheduleRepository
}

export default function App({ clock, repository }: Props) {
  const [dayCount, setDayCount] = useState(0)
  const [currentEvent, setCurrentEvent] = useState<Event | null | undefined>(undefined)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [currentTime, setCurrentTime] = useState<Date>(() => clock.now())

  const activeClock = useMemo<Clock>(() => ({ now: () => currentTime }), [currentTime])

  useEffect(() => {
    getSchedule(repository).then((days) => setDayCount(days.length))
    getCurrentEvent(repository, activeClock).then(setCurrentEvent)
    getUpcomingEvents(repository, activeClock).then(setUpcomingEvents)
  }, [activeClock, repository])

  return (
    <div className="app">
      <header className="header">
        <p className="header__eyebrow">Conference Schedule</p>
        <h1 className="header__title">React.js Conf 2015</h1>
        {dayCount > 0 && (
          <p className="header__meta">{dayCount} {dayCount === 1 ? 'day' : 'days'}</p>
        )}
      </header>

      <section aria-label="Time travel" className="time-travel">
          <label>
            Time travel:
            <input
              type="datetime-local"
              data-testid="time-travel-input"
              value={toDatetimeLocalValue(currentTime)}
              onChange={(e) => {
                const parsed = new Date(e.target.value)
                if (!isNaN(parsed.getTime())) {
                  setCurrentTime(parsed)
                }
              }}
            />
          </label>
          <button
            data-testid="time-travel-reset"
            onClick={() => setCurrentTime(clock.now())}
          >
            Reset to now
          </button>
        </section>

      <main className="content">
        {currentEvent === undefined ? null : currentEvent ? (
          <section aria-label="Current event">
            <p className="section-label">Happening now</p>
            <div className="current-event">
              <div className="current-event__accent" />
              <div className="current-event__body">
                <span className="current-event__badge">Live</span>
                <h2 className="current-event__title">{currentEvent.title}</h2>
                <p className="current-event__time">{currentEvent.time}</p>
                {currentEvent.description && (
                  <p className="current-event__description">{currentEvent.description}</p>
                )}
                {currentEvent.speakers.length > 0 && (
                  <div className="current-event__speakers">
                    {currentEvent.speakers.map((s) => (
                      <span key={s.name} className="speaker-chip">{s.name}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <p className="empty-state">No ongoing event right now</p>
        )}

        {upcomingEvents.length > 0 && (
          <section aria-label="Upcoming events">
            <p className="section-label">Up next</p>
            <div className="upcoming-list">
              {upcomingEvents.map((event) => (
                <article key={event.title} className="upcoming-card">
                  <div className="upcoming-card__header">
                    <h2 className="upcoming-card__title">{event.title}</h2>
                    <span className="upcoming-card__time">{event.time}</span>
                  </div>
                  {event.description && (
                    <p className="upcoming-card__description">{event.description}</p>
                  )}
                  {event.speakers.length > 0 && (
                    <div className="upcoming-card__speakers">
                      {event.speakers.map((s) => (
                        <span key={s.name} className="speaker-chip">{s.name}</span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
