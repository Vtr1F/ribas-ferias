import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../components/protected-routes'
import { AuthProvider } from '../context/auth-context'

vi.mock('../components/access-denied', () => ({
  default: () => <div data-testid="access-denied">Access Denied</div>
}))

describe('ProtectedRoute', () => {
  it('renders children when authenticated with admin role', () => {
    vi.mocked = vi.fn()
    vi.mock('../context/auth-context', () => ({
      useAuth: () => ({ user: { role: 'ADMIN' }, loading: false, isAuthenticated: true }),
      AuthProvider: ({ children }) => <div>{children}</div>
    }))
    
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})