import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Logout from '../components/logout'

vi.mock('../context/auth-context', () => ({
  useAuth: () => ({ setUser: vi.fn() })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

describe('Logout', () => {
  it('renders logout button', () => {
    render(
      <BrowserRouter>
        <Logout />
      </BrowserRouter>
    )
    expect(screen.getByTitle('Terminar Sessão')).toBeInTheDocument()
  })

  it('shows confirmation on click', () => {
    render(
      <BrowserRouter>
        <Logout />
      </BrowserRouter>
    )
    fireEvent.click(screen.getByTitle('Terminar Sessão'))
    expect(screen.getByText('Tem a certeza que deseja terminar a sessão?')).toBeInTheDocument()
  })

  it('closes confirmation on cancel', () => {
    render(
      <BrowserRouter>
        <Logout />
      </BrowserRouter>
    )
    fireEvent.click(screen.getByTitle('Terminar Sessão'))
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Tem a certeza que deseja terminar a sessão?')).not.toBeInTheDocument()
  })
})