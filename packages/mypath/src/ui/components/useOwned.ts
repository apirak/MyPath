import type { ExamEvent } from '../../types'
import { usePlan } from '../../MyPathProvider'

// Ownership rule shared by Month and All (ADR-0002): courses and mocks are
// owned when bought; real exams have nothing to buy, so they always count.
export function useOwned() {
  const { owned } = usePlan().data
  return {
    course: (id: string) => owned.includes(id),
    event: (event: ExamEvent) =>
      event.kind === 'exam' || owned.includes(event.id),
  }
}
