import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TeamRequests from '../pages/team-requests/team_requests'

vi.mock('../api/teamRoutes', () => ({
  TeamRoutes: {
    fetchTeams: vi.fn().mockResolvedValue([
      { id: 1, team_name: 'Team A', description: 'Dev team', leader_id: '1', members: [{ id: '1', nome: 'John' }] }
    ])
  }
}))

vi.mock('../api/requestRoutes', () => ({
  RequestRoutes: {
    fetchTeamRequest: vi.fn().mockResolvedValue([
      { id: 1, user_id: '1', request_type: 'Vacation', status: 'Approved', days: ['20240101'], reason: 'Holiday', created_at: '2024-01-01' }
    ])
  }
}))

vi.mock('../context/auth-context', () => ({
  useAuth: () => ({ user: { sub: '1', role: 'TEAM_LEADER' } }),
  AuthProvider: ({ children }) => <div>{children}</div>
}))

vi.mock('../components/header/header', () => ({
  default: () => <header>Header</header>
}))

vi.mock('../components/user_avatar', () => ({
  default: () => <div>Avatar</div>
}))

describe('TeamRequests', () => {
  it('renders page title', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <TeamRequests />
        </BrowserRouter>
      )
    })
    expect(screen.getByText('Pedidos por Equipa')).toBeInTheDocument()
  })

  it('renders stats cards', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <TeamRequests />
        </BrowserRouter>
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Total')).toBeInTheDocument()
      expect(screen.getByText('Pendentes')).toBeInTheDocument()
      expect(screen.getByText('Aprovados')).toBeInTheDocument()
      expect(screen.getByText('Rejeitados')).toBeInTheDocument()
    })
  })

  it('renders search input', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <TeamRequests />
        </BrowserRouter>
      )
    })
    expect(screen.getByPlaceholderText('Pesquisar por colaborador, motivo ou tipo...')).toBeInTheDocument()
  })

  it('renders team name', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <TeamRequests />
        </BrowserRouter>
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Team A')).toBeInTheDocument()
    })
  })
})