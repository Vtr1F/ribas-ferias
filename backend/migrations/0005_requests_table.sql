CREATE TYPE request_status AS ENUM ('Pending', 'Accepted', 'Rejected');


CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL REFERENCES users(id),

    request_type_id INTEGER NOT NULL REFERENCES request_types(id),

    reason TEXT,

    days INTEGER[] DEFAULT '{}',

    status request_status NOT NULL DEFAULT 'Pending',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() 
);