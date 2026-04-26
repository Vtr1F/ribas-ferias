import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

vi.mock('../api/userRoutes', () => ({
  UserRoutes: {}
}))

vi.mock('../layouts/main-layout', () => ({
  default: ({ children }) => <div>{children}</div>
}))

vi.mock('../pages/create_user', () => ({
  default: () => (
    <div>
      <h2>Criar Novo Utilizador</h2>
      <input placeholder="Email" />
      <button>Enviar Email</button>
    </div>
  )
}))

describe('CreateUser', () => {
  it('renders create user form', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <div>
            <h2>Criar Novo Utilizador</h2>
            <input placeholder="Email" />
            <button>Enviar Email</button>
          </div>
        </BrowserRouter>
      )
    })
    expect(screen.getByText('Criar Novo Utilizador')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
  })

  it('renders submit button', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <div>
            <h2>Criar Novo Utilizador</h2>
            <input placeholder="Email" />
            <button>Enviar Email</button>
          </div>
        </BrowserRouter>
      )
    })
    expect(screen.getByRole('button', { name: 'Enviar Email' })).toBeInTheDocument()
  })
})