import type { ScheduleRepository } from '../../application/ports/ScheduleRepository'
import type { Day } from '../../domain/Day'

// The table has two data columns in document order
const CONFERENCE_DATES = ['2015-01-28', '2015-01-29'] as const

export class HttpScheduleRepository implements ScheduleRepository {
  private cache: Day[] | null = null

  constructor(
    private readonly url = 'https://conf2015.reactjs.org/schedule.html',
  ) {}

  async getDays(): Promise<Day[]> {
    if (!this.cache) {
      this.cache = await this.fetchAndParse()
    }
    return this.cache
  }

  async getDay(date: string): Promise<Day | null> {
    const days = await this.getDays()
    return days.find((d) => d.date === date) ?? null
  }

  private async fetchAndParse(): Promise<Day[]> {
    const response = await fetch(this.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: HTTP ${response.status}`)
    }
    return this.parseHtml(await response.text())
  }

  parseHtml(html: string): Day[] {
    const doc = new DOMParser().parseFromString(html, 'text/html')

    const days: Day[] = CONFERENCE_DATES.map((date) => ({ date, events: [] }))

    const rows = doc.querySelectorAll('table.schedule-table tbody tr:not(.special)')

    for (const row of rows) {
      const timeCell = row.querySelector('td.time')
      if (!timeCell) continue

      // The official site uses an en-dash (–); normalise to the hyphen our
      // domain functions expect.
      const time = (timeCell.textContent?.trim() ?? '').replace(/\u2013/g, '-')

      const dataCells = row.querySelectorAll('td:not(.time)')
      dataCells.forEach((cell, colIndex) => {
        if (colIndex >= CONFERENCE_DATES.length) return

        const sessionLink = cell.querySelector('.session a')
        if (!sessionLink) return // break / meal without a hyperlink

        const title = sessionLink.textContent?.trim() ?? ''
        if (!title) return

        const speakerSpan = cell.querySelector('.speaker span')
        const speakersText = speakerSpan?.textContent?.trim() ?? ''
        const speakers = speakersText
          ? speakersText.split(' and ').map((name) => ({ name: name.trim() }))
          : []

        days[colIndex].events.push({ title, time, speakers, description: '' })
      })
    }

    return days
  }
}
