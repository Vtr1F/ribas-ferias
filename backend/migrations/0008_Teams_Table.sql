-- Add migration script here
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    team_name TEXT NOT NULL UNIQUE,
    description TEXT,
    leader_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    members INTEGER[] DEFAULT '{}', -- vector of user IDs
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

INSERT INTO teams (team_name, description, leader_id, members)
VALUES (
    'Design',
    'Handles UI/UX and branding',
    2,                 -- leader user_id
    ARRAY[3, 4, 5]     -- members user_ids
);

INSERT INTO teams (team_name, description, leader_id, members)
VALUES (
    'Development',
    'Backend and frontend engineering team',
    1,                 -- leader user_id
    ARRAY[6, 7, 8, 9]
);

INSERT INTO teams (team_name, description, leader_id, members)
VALUES (
    'HR',
    'Human resources and employee support',
    4,                 -- leader user_id
    ARRAY[10, 11]
);