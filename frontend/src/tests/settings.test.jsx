import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Settings from '../components/settings'

vi.mock('../context/auth-context', () => ({
  useAuth: () => ({ user: { sub: '1', nome: 'Test' } }),
  AuthProvider: ({ children }) => <div>{children}</div>
}))

vi.mock('../components/header/header', () => ({
  default: () => <header>Header</header>
}))

describe('Settings', () => {
  it('renders settings component', () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    )
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })
})