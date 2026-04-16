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

