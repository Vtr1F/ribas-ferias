-- Remove user from team_members when user is deleted and update JSONB
CREATE OR REPLACE FUNCTION remove_user_from_team_members()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        DELETE FROM team_members WHERE user_id = NEW.id;
        
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
            WHERE tm.team_id = OLD.team_id
        )
        WHERE id = OLD.team_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_remove_user_from_team_members ON users;
CREATE TRIGGER trg_remove_user_from_team_members
AFTER UPDATE OF deleted_at ON users
FOR EACH ROW
EXECUTE FUNCTION remove_user_from_team_members();
