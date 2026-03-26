import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpScheduleRepository } from '../HttpScheduleRepository'

// Minimal HTML fixture that mirrors the structure of the official site:
// - schedule table with links referencing anchor names
// - .talk sections *outside* the table, each with an a.anchor and a .description
const SCHEDULE_HTML = `
<!DOCTYPE html>
<html><body>
<table class="schedule-table">
  <thead>
    <tr><th></th><th>Wednesday</th><th>Thursday</th></tr>
  </thead>
  <tbody>
    <tr class="special">
      <td class="time">9:00\u201310:00am</td>
      <td><div class="session">Registration &amp; Breakfast</div></td>
      <td><div class="session">Breakfast</div></td>
    </tr>
    <tr>
      <td class="time">10:00\u201310:30am</td>
      <td>
        <div class="session"><a href="#keynote">Keynote</a></div>
        <div class="speaker"><span>Tom Occhino and Christopher Chedeau</span></div>
      </td>
      <td>
        <div class="session"><a href="#react-native">React Native</a></div>
        <div class="speaker"><span>Christopher Chedeau</span></div>
      </td>
    </tr>
    <tr class="special">
      <td class="time">11:00\u201311:30am</td>
      <td><div class="session">Break</div></td>
      <td><div class="session">Break</div></td>
    </tr>
    <tr>
      <td class="time">2:00\u20132:30pm</td>
      <td>
        <div class="session"><a href="#channels">Communicating with channels</a></div>
        <div class="speaker"><span>James Long</span></div>
      </td>
      <td>
        <div class="session"><a href="#data-viz">Scalable Data Visualization</a></div>
        <div class="speaker"><span>Zach Nation</span></div>
      </td>
    </tr>
    <tr>
      <td class="time">5:30\u20136:00pm</td>
      <td>
        <div class="session"><a href="#hype">Hype!</a></div>
        <div class="speaker"><span>Ryan Florence</span></div>
      </td>
      <td>
        <div class="session"><a href="#qa">Q&amp;A with the team</a></div>
      </td>
    </tr>
  </tbody>
</table>

<div class="talk">
  <a class="anchor" name="keynote"></a>
  <div class="description">Opening remarks about React</div>
</div>
<div class="talk">
  <a class="anchor" name="react-native"></a>
  <div class="description">Building native apps with React</div>
</div>
<div class="talk">
  <a class="anchor" name="channels"></a>
  <div class="description"></div>
</div>
<div class="talk">
  <a class="anchor" name="data-viz"></a>
</div>
<div class="talk">
  <a class="anchor" name="hype"></a>
  <div class="description">Closing talk</div>
</div>
</body></html>
`

function makeFetch(html: string, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 503,
    text: () => Promise.resolve(html),
  })
}

describe('HttpScheduleRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('getDays', () => {
    it('returns two days in schedule order', async () => {
      vi.stubGlobal('fetch', makeFetch(SCHEDULE_HTML))
      const repo = new HttpScheduleRepository()
      const days = await repo.getDays()
      expect(days).toHaveLength(2)
      expect(days[0].date).toBe('2015-01-28')
      expect(days[1].date).toBe('2015-01-29')
    })

    it('skips special rows (breaks, meals)', async () => {
      vi.stubGlobal('fetch', makeFetch(SCHEDULE_HTML))
      const repo = new HttpScheduleRepository()
      const days = await repo.getDays()
      const allTimes = days.flatMap((d) => d.events.map((e) => e.time))
      // 9:00-10:00am (registration) and 11:00-11:30am (break) must not appear
      expect(allTimes).not.toContain('9:00-10:00am')
      expect(allTimes).not.toContain('11:00-11:30am')
    })

    it('normalises en-dash time separators to hyphens', async () => {
      vi.stubGlobal('fetch', makeFetch(SCHEDULE_HTML))
      const repo = new HttpScheduleRepository()
      const days = await repo.getDays()
      expect(days[0].events[0].time).toBe('10:00-10:30am')
    })

    it('splits multi-speaker strings on " and "', async () => {
      vi.stubGlobal('fetch', makeFetch(SCHEDULE_HTML))
      const repo = new HttpScheduleRepository()
      const days = await repo.getDays()
      const keynote = days[0].events.find((e) => e.title === 'Keynote')
      expect(keynote?.speakers).toEqual([
        { name: 'Tom Occhino' },
        { name: 'Christopher Chedeau' },
      ])
    })

    it('produces an empty speakers array when no speaker element is present', async () => {
      vi.stubGlobal('fetch', makeFetch(SCHEDULE_HTML))
      const repo = new HttpScheduleRepository()
      const days = await repo.getDays()
      const qa = days[1].events.find((e) => e.title === 'Q&A with the team')
      expect(qa?.speakers).toEqual([])
    })

    it('throws when the HTTP response is not ok', async () => {
      vi.stubGlobal('fetch', makeFetch('', false))
      const repo = new HttpScheduleRepository()
      await expect(repo.getDays()).rejects.toThrow('HTTP 503')
    })

    it('caches the result so fetch is only called once', async () => {
      const fetchMock = makeFetch(SCHEDULE_HTML)
      vi.stubGlobal('fetch', fetchMock)
      const repo = new HttpScheduleRepository()
      await repo.getDays()
      await repo.getDays()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('getDay', () => {
    it('returns the matching day', async () => {
      vi.stubGlobal('fetch', makeFetch(SCHEDULE_HTML))
      const repo = new HttpScheduleRepository()
      const day = await repo.getDay('2015-01-28')
      expect(day?.date).toBe('2015-01-28')
    })

    it('returns null for an unknown date', async () => {
      vi.stubGlobal('fetch', makeFetch(SCHEDULE_HTML))
      const repo = new HttpScheduleRepository()
      expect(await repo.getDay('1999-01-01')).toBeNull()
    })
  })

  describe('parseHtml (unit — no fetch)', () => {
    it('parses all non-special events from the fixture', () => {
      const repo = new HttpScheduleRepository()
      const days = repo.parseHtml(SCHEDULE_HTML)
      // 3 talk rows × 2 columns, but Q&A has no speaker link on day 2 col — still has <a>
      expect(days[0].events).toHaveLength(3) // Keynote, Channels, Hype!
      expect(days[1].events).toHaveLength(3) // React Native, Data Viz, Q&A
    })

    it('extracts description from .talk .description', () => {
      const repo = new HttpScheduleRepository()
      const days = repo.parseHtml(SCHEDULE_HTML)
      const keynote = days[0].events.find((e) => e.title === 'Keynote')
      expect(keynote?.description).toBe('Opening remarks about React')
    })

    it('leaves description empty when .description div is absent', () => {
      const repo = new HttpScheduleRepository()
      const days = repo.parseHtml(SCHEDULE_HTML)
      const qa = days[1].events.find((e) => e.title === 'Q&A with the team')
      expect(qa?.description).toBe('')
    })

    it('leaves description empty when .description div has no text', () => {
      const repo = new HttpScheduleRepository()
      const days = repo.parseHtml(SCHEDULE_HTML)
      const channels = days[0].events.find((e) => e.title === 'Communicating with channels')
      expect(channels?.description).toBe('')
    })
  })
})
