import { useState, useEffect } from 'react'
import type { Day } from '../domain/Day'
import { getSchedule } from '../application/useCases/getSchedule'
import { InMemoryScheduleRepository } from './adapters/InMemoryScheduleRepository'

const repository = new InMemoryScheduleRepository()

export default function App() {
  const [days, setDays] = useState<Day[]>([])

  useEffect(() => {
    getSchedule(repository).then(setDays)
  }, [])

  return (
    <main>
      <h1>React.js Conf 2015</h1>
      <p>{days.length} day(s) loaded</p>
    </main>
  )
}
