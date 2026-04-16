-- Update team members JSONB when team_members table changes
-- This trigger updates the JSONB after the team_members insert/update/delete

CREATE OR REPLACE FUNCTION update_team_jsonb()
RETURNS TRIGGER AS $$
DECLARE
    target_id INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_id := OLD.team_id;
    ELSE
        target_id := NEW.team_id;
    END IF;

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
        WHERE tm.team_id = target_id
    )
    WHERE id = target_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_team_jsonb ON team_members;
CREATE TRIGGER trg_update_team_jsonb
AFTER INSERT OR DELETE ON team_members
FOR EACH ROW
EXECUTE FUNCTION update_team_jsonb();
