import { useState, useEffect } from 'react'
import type { Event } from '../domain/Event'
import type { Clock } from '../application/ports/Clock'
import type { ScheduleRepository } from '../application/ports/ScheduleRepository'
import { getSchedule } from '../application/useCases/getSchedule'
import { getCurrentEvent } from '../application/useCases/getCurrentEvent'
import { getUpcomingEvents } from '../application/useCases/getUpcomingEvents'

interface Props {
  clock: Clock
  repository: ScheduleRepository
}

export default function App({ clock, repository }: Props) {
  const [dayCount, setDayCount] = useState(0)
  const [currentEvent, setCurrentEvent] = useState<Event | null | undefined>(undefined)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])

  useEffect(() => {
    getSchedule(repository).then((days) => setDayCount(days.length))
    getCurrentEvent(repository, clock).then(setCurrentEvent)
    getUpcomingEvents(repository, clock).then(setUpcomingEvents)
  }, [clock, repository])

  return (
    <main>
      <h1>React.js Conf 2015</h1>
      <p>{dayCount} day(s) loaded</p>
      {currentEvent === undefined ? null : currentEvent ? (
        <section aria-label="Current event">
          <h2>{currentEvent.title}</h2>
          <p>{currentEvent.time}</p>
          <p>{currentEvent.description}</p>
          <p>Speakers: {currentEvent.speakers.map((s) => s.name).join(', ')}</p>
        </section>
      ) : upcomingEvents.length === 0 ? (
        <p>No ongoing event right now</p>
      ) : null}
      {upcomingEvents.length > 0 && (
        <section aria-label="Upcoming events">
          {upcomingEvents.map((event) => (
            <article key={event.title}>
              <h2>{event.title}</h2>
              <p>{event.time}</p>
              <p>{event.description}</p>
              <p>Speakers: {event.speakers.map((s) => s.name).join(', ')}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}
