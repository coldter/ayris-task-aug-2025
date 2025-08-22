-- Create a generic sequence tracking table
CREATE TABLE IF NOT EXISTS __internal_entity_sequences
(
    entity_type text                NOT NULL,
    year        text                NOT NULL,
    last_value  integer   DEFAULT 0 NOT NULL,
    updated_at  timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT entity_sequences_pkey PRIMARY KEY (entity_type, year)
);

-- Generic function for generating IDs with prefix + year + sequence
CREATE OR REPLACE FUNCTION generate_entity_id(
    prefix text,
    pad_length integer DEFAULT 5
)
    RETURNS text AS
$$
DECLARE
    current_year text;
    next_value   integer;
    new_id       text;
BEGIN
    -- Get last 2 digits of current year
    current_year := RIGHT(EXTRACT(YEAR FROM CURRENT_DATE)::text, 2);

    -- Get or create sequence for this entity type and year, then increment
    INSERT INTO __internal_entity_sequences (entity_type, year, last_value)
    VALUES (prefix, current_year, 1)
    ON CONFLICT (entity_type, year)
        DO UPDATE SET last_value = __internal_entity_sequences.last_value + 1,
                      updated_at = CURRENT_TIMESTAMP
    RETURNING last_value INTO next_value;

    -- Combine parts: prefix + year + padded sequence number
    new_id := prefix || current_year || LPAD(next_value::text, pad_length, '0');

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;