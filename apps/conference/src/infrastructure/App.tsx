import { useState, useEffect } from 'react'
import type { Event } from '../domain/Event'
import type { Clock } from '../application/ports/Clock'
import { getSchedule } from '../application/useCases/getSchedule'
import { getCurrentEvent } from '../application/useCases/getCurrentEvent'
import { InMemoryScheduleRepository } from './adapters/InMemoryScheduleRepository'

const repository = new InMemoryScheduleRepository()

interface Props {
  clock: Clock
}

export default function App({ clock }: Props) {
  const [dayCount, setDayCount] = useState(0)
  const [currentEvent, setCurrentEvent] = useState<Event | null | undefined>(undefined)

  useEffect(() => {
    getSchedule(repository).then((days) => setDayCount(days.length))
    getCurrentEvent(repository, clock).then(setCurrentEvent)
  }, [clock])

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
      ) : (
        <p>No ongoing event right now</p>
      )}
    </main>
  )
}
