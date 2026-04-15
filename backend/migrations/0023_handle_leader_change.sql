-- Handle leader change: remove from old team, add to new team, update JSONB
CREATE OR REPLACE FUNCTION handle_team_leader_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.leader_id IS NOT NULL AND NEW.leader_id <> OLD.leader_id THEN
        -- Remove old leader from all team_members
        DELETE FROM team_members 
        WHERE user_id = OLD.leader_id;
        
        -- Add new leader to team_members
        INSERT INTO team_members (team_id, user_id, leader)
        VALUES (NEW.id, NEW.leader_id, TRUE)
        ON CONFLICT DO NOTHING;
        
        -- Update JSONB for new team
        UPDATE teams
        SET members = (
            SELECT COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'id', u.id,
                        'nome', u.nome,
                        'email', u.email,
                        'role_id', u.role_id
                    )
                ),
                '[]'::jsonb
            )
            FROM users u
            JOIN team_members tm ON u.id = tm.user_id
            WHERE tm.team_id = NEW.id
        )
        WHERE id = NEW.id;
        
        -- If old leader was in another team, update that team's JSONB
        IF OLD.leader_id IS NOT NULL THEN
            UPDATE teams
            SET members = (
                SELECT COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'id', u.id,
                            'nome', u.nome,
                            'email', u.email,
                            'role_id', u.role_id
                        )
                    ),
                    '[]'::jsonb
                )
                FROM users u
                JOIN team_members tm ON u.id = tm.user_id
                WHERE tm.team_id = OLD.id
            )
            WHERE id = OLD.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_handle_team_leader_change ON teams;
CREATE TRIGGER trg_handle_team_leader_change
AFTER UPDATE OF leader_id ON teams
FOR EACH ROW
EXECUTE FUNCTION handle_team_leader_change();