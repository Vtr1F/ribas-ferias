import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreateTeam from '../components/team/create_team'

vi.mock('../api/teamRoutes', () => ({
  TeamRoutes: {
    fetchTeams: vi.fn().mockResolvedValue([]),
    addTeam: vi.fn().mockResolvedValue({})
  }
}))

describe('CreateTeam', () => {
  it('renders create team form', () => {
    render(<CreateTeam onClose={() => {}} />)
    expect(screen.getByLabelText('Nome da Equipa')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<CreateTeam onClose={() => {}} />)
    expect(screen.getByText('Criar Equipa')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<CreateTeam onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalled()
  })
})