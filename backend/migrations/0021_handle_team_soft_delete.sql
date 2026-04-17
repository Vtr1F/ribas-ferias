-- Update team JSONB when team is soft deleted
CREATE OR REPLACE FUNCTION handle_team_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        DELETE FROM team_members WHERE team_id = NEW.id;
        
        UPDATE teams
        SET members = '[]'::jsonb
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_handle_team_delete ON teams;
CREATE TRIGGER trg_handle_team_delete
AFTER UPDATE OF deleted_at ON teams
FOR EACH ROW
EXECUTE FUNCTION handle_team_delete();