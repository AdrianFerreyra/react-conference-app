import type { Speaker } from './Speaker'

export interface Event {
  /** Identity: unique within a Day */
  title: string
  time: string
  speakers: Speaker[]
  description: string
}
