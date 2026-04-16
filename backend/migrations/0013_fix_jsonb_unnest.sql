-- Fix unnest for JSONB - drop and recreate the trigger function
DROP TRIGGER IF EXISTS trg_sync_team_members ON teams;
DROP FUNCTION IF EXISTS sync_team_members();

CREATE OR REPLACE FUNCTION sync_team_members()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM team_members WHERE team_id = NEW.id;

    INSERT INTO team_members (team_id, user_id, leader)
    SELECT NEW.id, (elem->>'id')::integer, FALSE
    FROM jsonb_array_elements(NEW.members) AS elem
    ON CONFLICT DO NOTHING;

    IF NEW.leader_id IS NOT NULL THEN
        INSERT INTO team_members (team_id, user_id, leader)
        VALUES (NEW.id, NEW.leader_id, TRUE)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_team_members
AFTER INSERT OR UPDATE OF members, leader_id ON teams
FOR EACH ROW
EXECUTE FUNCTION sync_team_members();
