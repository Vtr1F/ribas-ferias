import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Stats from '../components/stats'
import { AuthProvider } from '../context/auth-context'
import { RequestRoutes } from '../api/requestRoutes'

vi.mock('../api/requestRoutes', () => ({
  RequestRoutes: {
    fetchRequests: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('../context/auth-context', async () => {
  const actual = await vi.importActual('../context/auth-context')
  return {
    ...actual,
    useAuth: () => ({ user: { sub: '123', role: 'ADMIN' } })
  }
})

describe('Stats', () => {
  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Stats users={[]} />
        </AuthProvider>
      </BrowserRouter>
    )
    expect(screen.getByText('A carregar...')).toBeInTheDocument()
  })

  it('renders stats after loading', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Stats users={[{ id: '1' }]} />
        </AuthProvider>
      </BrowserRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Total Colaboradores')).toBeInTheDocument()
      expect(screen.getByText('Total Pedidos')).toBeInTheDocument()
      expect(screen.getByText('Férias Marcadas')).toBeInTheDocument()
    })
  })
})