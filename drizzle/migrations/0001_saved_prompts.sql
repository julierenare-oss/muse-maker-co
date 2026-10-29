CREATE TABLE public.saved_prompts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 account_id text NOT NULL,
 owner_id text NOT NULL,
 title text NOT NULL,
 prompt text NOT NULL,
 modality text NOT NULL DEFAULT 'text',
 tags text[] NOT NULL DEFAULT '{}',
 is_favorite boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT saved_prompt_length CHECK (char_length(prompt) BETWEEN 1 AND 2000),
 CONSTRAINT saved_prompt_modality CHECK (modality IN ('text', 'image', 'video'))
);
GRANT ALL ON public.saved_prompts TO service_role;
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;
CREATE INDEX saved_prompts_owner_idx ON public.saved_prompts (account_id, owner_id, updated_at DESC);
COMMENT ON TABLE public.saved_prompts IS 'Private participant prompt library. Access only through the externally authenticated skills function; owner and account are derived server-side.';