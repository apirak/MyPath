import { createContext, type KeyboardEvent } from 'react'

// Lets Month/All cards open the course sheet without prop-drilling;
// <MyPath> owns which course is open.
export const OpenCourseContext = createContext<(courseId: string) => void>(
  () => {},
)

// Props that make a non-<button> card or bar act like a button (Enter/Space).
// Cards can't be real buttons because some contain other controls.
export const courseButton = (
  open: (courseId: string) => void,
  courseId: string,
) => ({
  role: 'button',
  tabIndex: 0,
  onClick: () => open(courseId),
  onKeyDown: (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      open(courseId)
    }
  },
})
