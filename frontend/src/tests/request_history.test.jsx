import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RequestHistory from '../pages/request-history/request_history'

vi.mock('../api/requestRoutes', () => ({
  RequestRoutes: {
    fetchUserRequest: vi.fn().mockResolvedValue([
      { id: 1, request_type: 'Vacation', status: 'Approved', days: ['20240101', '20240102'], reason: 'Férias', created_at: '2024-01-01' },
      { id: 2, request_type: 'SickLeave', status: 'Pending', days: ['20240110'], reason: 'Doença', created_at: '2024-01-05' }
    ])
  }
}))

vi.mock('../context/auth-context', () => ({
  useAuth: () => ({ user: { sub: '1' } }),
  AuthProvider: ({ children }) => <div>{children}</div>
}))

describe('RequestHistory', () => {
  it('renders page title', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <RequestHistory />
        </BrowserRouter>
      )
    })
    expect(screen.getByText('Histórico de Pedidos')).toBeInTheDocument()
  })

  it('renders stats cards', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <RequestHistory />
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

  it('renders filters', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <RequestHistory />
        </BrowserRouter>
      )
    })
    expect(screen.getByPlaceholderText('Pesquisar por motivo ou tipo...')).toBeInTheDocument()
  })

  it('renders requests table', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <RequestHistory />
        </BrowserRouter>
      )
    })
    await waitFor(() => {
      expect(screen.getAllByText('Férias').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Baixa Médica').length).toBeGreaterThan(0)
    })
  })
})