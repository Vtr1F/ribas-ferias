-- Add migration script here
CREATE TABLE team_members (
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, user_id)
);

ALTER TABLE team_members
ADD COLUMN leader BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE teams DROP COLUMN IF EXISTS members;

ALTER TABLE teams ADD COLUMN members JSONB DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION update_team_members_json()
RETURNS TRIGGER AS $$
DECLARE
    target_team_id INTEGER;
BEGIN
    target_team_id := COALESCE(NEW.team_id, OLD.team_id);
    
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_team_members_json
AFTER INSERT OR DELETE OR UPDATE OF team_id ON team_members
FOR EACH ROW
EXECUTE FUNCTION update_team_members_json();

INSERT INTO teams (team_name, description, leader_id)
VALUES ('Sem Equipa', 'Colaboradores Sem Equipa', NULL)
ON CONFLICT (team_name) DO NOTHING;

CREATE OR REPLACE FUNCTION assign_users_without_team()
RETURNS TRIGGER AS $$
DECLARE
    sem_equipa_id INTEGER;
BEGIN
    SELECT id INTO sem_equipa_id FROM teams WHERE team_name = 'Sem Equipa';
    
    IF sem_equipa_id IS NOT NULL THEN
        UPDATE users 
        SET team_id = sem_equipa_id 
        WHERE team_id IS NULL;
        
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
            WHERE u.team_id = sem_equipa_id
        )
        WHERE id = sem_equipa_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_users_without_team
AFTER INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION assign_users_without_team();




CREATE OR REPLACE FUNCTION sync_team_members()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        DELETE FROM team_members WHERE team_id = NEW.id;
    END IF;

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

