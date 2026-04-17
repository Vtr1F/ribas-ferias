-- Add all users to team with id 1 (Sem Equipa), set user 1 as leader
UPDATE teams SET leader_id = 1 WHERE id = 1;

INSERT INTO team_members (team_id, user_id, leader)
SELECT 1, id, (id = 1)
FROM users
WHERE id NOT IN (SELECT user_id FROM team_members WHERE team_id = 1)
ON CONFLICT DO NOTHING;

UPDATE users SET team_id = 1 WHERE team_id IS NULL;
