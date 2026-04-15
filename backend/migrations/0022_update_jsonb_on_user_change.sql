-- Update team JSONB when user info changes (role, nome, email, team_id)
CREATE OR REPLACE FUNCTION update_team_jsonb_on_user_change()
RETURNS TRIGGER AS $$
DECLARE
    target_team_id INTEGER;
BEGIN
    target_team_id := COALESCE(NEW.team_id, OLD.team_id);
    
    IF target_team_id IS NOT NULL THEN
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
            WHERE tm.team_id = target_team_id
        )
        WHERE id = target_team_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_team_jsonb_on_user_change ON users;
CREATE TRIGGER trg_update_team_jsonb_on_user_change
AFTER UPDATE OF role_id, nome, email, team_id ON users
FOR EACH ROW
EXECUTE FUNCTION update_team_jsonb_on_user_change();