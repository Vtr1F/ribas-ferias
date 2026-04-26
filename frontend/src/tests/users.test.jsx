import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Users from '../pages/users/users'

vi.mock('../api/teamRoutes', () => ({
  TeamRoutes: {
    fetchTeams: vi.fn().mockResolvedValue([
      { id: 1, team_name: 'Team A', description: 'Dev team', leader_id: '1', members: [{ id: '1', nome: 'John Doe', email: 'john@test.com', role_id: 3, team_id: 1 }] }
    ])
  }
}))

vi.mock('../api/requestRoutes', () => ({
  RequestRoutes: {
    fetchRequests: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('../context/auth-context', () => ({
  useAuth: () => ({ user: { sub: '1', role: 1, team_id: 1 } }),
  AuthProvider: ({ children }) => <div>{children}</div>
}))

vi.mock('../components/header/header', () => ({
  default: () => <header>Header</header>
}))

vi.mock('../components/user_avatar', () => ({
  default: () => <div>Avatar</div>
}))

vi.mock('../components/stats', () => ({
  default: () => <div>Stats</div>
}))

vi.mock('../components/alter_user', () => ({
  default: () => null
}))

vi.mock('../components/user/create_user', () => ({
  default: () => null
}))

vi.mock('../components/team/create_team', () => ({
  default: () => null
}))

vi.mock('../components/team/alter_team', () => ({
  default: () => null
}))

vi.mock('../components/team/add_to_team', () => ({
  default: () => null
}))

vi.mock('../components/team/remove_from_team', () => ({
  default: () => null
}))

describe('Users', () => {
  it('renders page title', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      )
    })
    expect(screen.getByText('Gestão de Utilizadores')).toBeInTheDocument()
  })

  it('renders search input', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      )
    })
    expect(screen.getByPlaceholderText('Pesquisar por nome, email ou equipa...')).toBeInTheDocument()
  })

  it('renders admin buttons', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Novo Utilizador')).toBeInTheDocument()
      expect(screen.getByText('Criar Equipa')).toBeInTheDocument()
    })
  })

  it('renders team name', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Users />
        </BrowserRouter>
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Team A')).toBeInTheDocument()
    })
  })
})