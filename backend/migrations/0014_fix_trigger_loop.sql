-- Fix infinite trigger loop between teams and team_members
DROP TRIGGER IF EXISTS trg_sync_team_members ON teams;
DROP TRIGGER IF EXISTS trg_update_team_members_json ON team_members;
DROP TRIGGER IF EXISTS trg_assign_users_without_team ON users;
DROP FUNCTION IF EXISTS sync_team_members();
DROP FUNCTION IF EXISTS update_team_members_json();
DROP FUNCTION IF EXISTS assign_users_without_team();

-- Insert Sem Equipa team if not exists
INSERT INTO teams (team_name, description, leader_id)
VALUES ('Sem Equipa', 'Colaboradores Sem Equipa', NULL)
ON CONFLICT (team_name) DO NOTHING;

-- Function to assign users without team (run manually or via scheduled job)
CREATE OR REPLACE FUNCTION assign_users_without_team()
RETURNS void AS $$
DECLARE
    sem_equipa_id INTEGER;
BEGIN
    SELECT id INTO sem_equipa_id FROM teams WHERE team_name = 'Sem Equipa';
    
    IF sem_equipa_id IS NOT NULL THEN
        UPDATE users 
        SET team_id = sem_equipa_id 
        WHERE team_id IS NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;
