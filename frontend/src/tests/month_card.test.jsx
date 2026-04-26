import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MonthCard from '../components/month_card'

describe('MonthCard', () => {
  it('renders month card with correct month name', () => {
    render(
      <MonthCard monthIndex={0} year={2024} vacationMap={{}} selectedDays={[]} onDateClick={() => {}} />
    )
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('renders weekdays header', () => {
    render(
      <MonthCard monthIndex={5} year={2024} vacationMap={{}} selectedDays={[]} onDateClick={() => {}} />
    )
    expect(screen.getByText('Jun')).toBeInTheDocument()
    expect(screen.getByText('Su')).toBeInTheDocument()
    expect(screen.getByText('Mo')).toBeInTheDocument()
  })

  it('renders days in month', () => {
    render(
      <MonthCard monthIndex={0} year={2024} vacationMap={{}} selectedDays={[]} onDateClick={() => {}} />
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()
  })
})