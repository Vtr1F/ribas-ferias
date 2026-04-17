-- Add user to team_members when created with team_id = 1
CREATE OR REPLACE FUNCTION add_user_to_team_members()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.team_id IS NOT NULL AND NEW.team_id = 1 THEN
        INSERT INTO team_members (team_id, user_id, leader)
        VALUES (NEW.team_id, NEW.id, FALSE)
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_add_user_to_team_members ON users;
CREATE TRIGGER trg_add_user_to_team_members
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION add_user_to_team_members();
