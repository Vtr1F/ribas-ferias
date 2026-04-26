import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SessionExpired from '../components/session-expired'

describe('SessionExpired', () => {
  it('renders session expired message', () => {
    render(<SessionExpired />)
    expect(screen.getByText('A sua sessão foi terminada!')).toBeInTheDocument()
  })
})