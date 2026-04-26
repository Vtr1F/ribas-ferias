import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/login'

vi.mock('../api/loginRoute', () => ({
  LoginRoute: {
    loginPost: vi.fn().mockResolvedValue({ id: '1', role: 1 })
  }
}))

vi.mock('../context/auth-context', () => ({
  useAuth: () => ({ setUser: vi.fn() }),
  AuthProvider: ({ children }) => <div>{children}</div>
}))

vi.mock('../layouts/login-layout', () => ({
  default: ({ children }) => <div>{children}</div>
}))

describe('Login', () => {
  it('renders login form', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )
    })
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('renders login button', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )
    })
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('renders forgot password button', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )
    })
    expect(screen.getByText('Esqueceu-se da palavra-passe?')).toBeInTheDocument()
  })

  it('updates email state', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )
    })
    const emailInput = screen.getByPlaceholderText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    expect(emailInput.value).toBe('test@test.com')
  })

  it('updates password state', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )
    })
    const passwordInput = screen.getByPlaceholderText('Password')
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    expect(passwordInput.value).toBe('password123')
  })
})