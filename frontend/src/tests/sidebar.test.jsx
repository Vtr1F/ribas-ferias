import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Sidebar from '../components/sidebar'

vi.mock('../context/auth-context', () => ({
  useAuth: () => ({ user: { sub: '1', nome: 'Test User', role: 'ADMIN' } }),
  AuthProvider: ({ children }) => <div>{children}</div>
}))

vi.mock('../components/user_avatar', () => ({
  default: () => <div data-testid="avatar">Avatar</div>
}))

vi.mock('../components/logout', () => ({
  default: () => <button data-testid="logout">Logout</button>
}))

describe('Sidebar', () => {
  it('renders sidebar with navigation links', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    )
    expect(screen.getByText('Calendário')).toBeInTheDocument()
    expect(screen.getByText('Perfil')).toBeInTheDocument()
    expect(screen.getByText('Histórico')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})