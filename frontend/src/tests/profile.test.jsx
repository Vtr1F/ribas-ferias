import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Profile from '../components/profile'
import { AuthProvider } from '../context/auth-context'

vi.mock('../api/userRoutes', () => ({
  UserRoutes: {
    fetchUser: vi.fn().mockResolvedValue({ id: '1', nome: 'Test User', email: 'test@test.com', birthday: '1990-01-01', phone_number: '123456789', headquarter: 'Lisbon', dias_ferias_disponiveis: 20 })
  }
}))

vi.mock('../context/auth-context', () => ({
  useAuth: () => ({ user: { sub: '1', nome: 'Test User' } }),
  AuthProvider: ({ children }) => <div>{children}</div>
}))

vi.mock('../components/header/header', () => ({
  default: () => <header>Header</header>
}))

vi.mock('../components/user_avatar', () => ({
  default: () => <div>Avatar</div>
}))

describe('Profile', () => {
  it('renders profile component', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Perfil')).toBeInTheDocument()
    })
  })
})