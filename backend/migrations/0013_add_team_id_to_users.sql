-- Add team_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL;

-- Update each user to reference their team based on their role and superior_id
-- Admin (id=1) - no specific team, could be assigned to admin team
UPDATE users SET team_id = (SELECT id FROM teams WHERE leader_id IS NULL LIMIT 1) WHERE id = 1;

-- Leaders get assigned to their own team
UPDATE users SET team_id = (SELECT id FROM teams WHERE leader_id = users.id) WHERE role_id = 2;

-- Workers get assigned to the team of their leader
UPDATE users SET team_id = (SELECT id FROM teams WHERE leader_id = users.superior_id) WHERE role_id = 3;
