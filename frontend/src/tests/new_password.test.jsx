import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import NewPassword from '../pages/new_password'

vi.mock('../api/loginRoute', () => ({
  LoginRoute: {
    updatePassword: vi.fn().mockResolvedValue({})
  }
}))

vi.mock('../layouts/login-layout', () => ({
  default: ({ children }) => <div>{children}</div>
}))

describe('NewPassword', () => {
  it('renders password form with token', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/new-password?token=abc123']}>
          <Routes>
            <Route path="/new-password" element={<NewPassword />} />
          </Routes>
        </MemoryRouter>
      )
    })
    expect(screen.getByPlaceholderText('Nova Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Confirmar Password')).toBeInTheDocument()
  })

  it('renders submit button', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/new-password?token=abc123']}>
          <Routes>
            <Route path="/new-password" element={<NewPassword />} />
          </Routes>
        </MemoryRouter>
      )
    })
    expect(screen.getByRole('button', { name: 'Atualizar Password' })).toBeInTheDocument()
  })

  it('renders page title', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/new-password?token=abc123']}>
          <Routes>
            <Route path="/new-password" element={<NewPassword />} />
          </Routes>
        </MemoryRouter>
      )
    })
    expect(screen.getByText('Nova Password')).toBeInTheDocument()
  })
})