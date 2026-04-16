-- Populate members JSONB from team_members table
UPDATE teams t
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
    WHERE tm.team_id = t.id
);

-- Populate Sem Equipa team
INSERT INTO team_members (team_id, user_id, leader)
SELECT t.id, u.id, FALSE
FROM teams t
CROSS JOIN users u
WHERE t.team_name = 'Sem Equipa'
AND u.team_id = t.id
ON CONFLICT DO NOTHING;
