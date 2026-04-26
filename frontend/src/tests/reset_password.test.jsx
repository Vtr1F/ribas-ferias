import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ResetPassword from '../pages/reset_password'

vi.mock('../api/loginRoute', () => ({
  LoginRoute: {
    requestPassword: vi.fn().mockResolvedValue({})
  }
}))

vi.mock('../layouts/login-layout', () => ({
  default: ({ children }) => <div>{children}</div>
}))

describe('ResetPassword', () => {
  it('renders reset password form', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      )
    })
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
  })

  it('renders submit button', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      )
    })
    expect(screen.getByRole('button', { name: 'Enviar Código' })).toBeInTheDocument()
  })

  it('updates email state', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      )
    })
    const emailInput = screen.getByPlaceholderText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    expect(emailInput.value).toBe('test@test.com')
  })
})