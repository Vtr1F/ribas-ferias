-- Add migration script here
CREATE TABLE team_members (
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, user_id)
);

ALTER TABLE team_members
ADD COLUMN leader BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION sync_team_members()
RETURNS TRIGGER AS $$
BEGIN
    -- On UPDATE, clear old members first
    IF TG_OP = 'UPDATE' THEN
        DELETE FROM team_members WHERE team_id = NEW.id;
    END IF;

    -- Insert members from the array (all non-leaders)
    INSERT INTO team_members (team_id, user_id, leader)
    SELECT NEW.id, unnest(NEW.members), FALSE
    ON CONFLICT DO NOTHING;

    -- Insert leader (if not null)
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

