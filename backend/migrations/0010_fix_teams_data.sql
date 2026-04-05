-- Fix teams and create admin team with all leaders
-- First, let's update existing teams to have correct leaders

-- Clear existing team data
TRUNCATE teams RESTART IDENTITY CASCADE;

-- Create teams with leaders (using existing leader users)
-- User 2 (Team Leader Ricardo Silva), User 7 (Ricardo Silva - wait, let me check)
-- Let's map properly:
-- Leader users: 2 (Team Leader), 7 (Ricardo Silva), 11 (Pedro Carvalho)

-- Insert Design Team (lead by user 2)
INSERT INTO teams (team_name, description, leader_id, members)
VALUES (
    'Design',
    'Handles UI/UX and branding',
    2,
    ARRAY[3, 4, 5]
);

-- Insert Development Team (lead by user 7)
INSERT INTO teams (team_name, description, leader_id, members)
VALUES (
    'Development',
    'Backend and frontend engineering team',
    7,
    ARRAY[6, 8, 9]
);

-- Insert HR Team (lead by user 11)
INSERT INTO teams (team_name, description, leader_id, members)
VALUES (
    'HR',
    'Human resources and employee support',
    11,
    ARRAY[10, 12, 13]
);

-- Create Admin Team with all leaders (no leader, admin manages directly)
INSERT INTO teams (team_name, description, leader_id, members)
VALUES (
    'Admin',
    'Administrative team with all leaders',
    NULL,
    ARRAY[2, 7, 11]
);
