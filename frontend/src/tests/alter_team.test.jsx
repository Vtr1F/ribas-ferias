import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AlterTeam from '../components/team/alter_team'

vi.mock('../api/teamRoutes', () => ({
  TeamRoutes: {
    fetchTeams: vi.fn().mockResolvedValue([]),
    alterTeam: vi.fn().mockResolvedValue({}),
    removeTeam: vi.fn().mockResolvedValue({})
  }
}))

describe('AlterTeam', () => {
  it('renders edit team form', () => {
    render(<AlterTeam team={{ id: 1, team_name: 'Test Team' }} onClose={() => {}} />)
    expect(screen.getByText('Editar Equipa')).toBeInTheDocument()
  })

  it('renders save button', () => {
    render(<AlterTeam team={{ id: 1, team_name: 'Test Team' }} onClose={() => {}} />)
    expect(screen.getByText('Guardar')).toBeInTheDocument()
  })
})