-- ORGANA Civilization Layer Schema. To be applied when Supabase is connected.
-- References organizations and ai_agents tables from the production schema.

-- ─── SYNAPSE ──────────────────────────────────────────────────────────────────

CREATE TABLE synapse_channels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('direct','group')),
  name            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE synapse_channel_members (
  channel_id UUID NOT NULL REFERENCES synapse_channels(id) ON DELETE CASCADE,
  agent_id   UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  PRIMARY KEY (channel_id, agent_id)
);

CREATE TABLE synapse_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id  UUID NOT NULL REFERENCES synapse_channels(id) ON DELETE CASCADE,
  from_agent  UUID NOT NULL REFERENCES ai_agents(id),
  to_agent    UUID NOT NULL REFERENCES ai_agents(id),
  intent      TEXT NOT NULL CHECK (intent IN ('request','delegate','status_update','decision','question','escalation')),
  urgency     TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low','normal','high','critical')),
  content     TEXT NOT NULL,
  outcome     TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending','acknowledged','completed','failed','rejected')),
  tokens_used INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX synapse_messages_channel_idx ON synapse_messages(channel_id);
CREATE INDEX synapse_messages_from_idx    ON synapse_messages(from_agent);
CREATE INDEX synapse_messages_to_idx      ON synapse_messages(to_agent);

-- ─── NEXUS ────────────────────────────────────────────────────────────────────

CREATE TABLE nexus_meetings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('standup','planning','review','incident','brainstorm','1on1')),
  title           TEXT NOT NULL,
  facilitator_id  UUID NOT NULL REFERENCES ai_agents(id),
  status          TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  minutes_summary TEXT,
  total_tokens    INT NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE nexus_meeting_participants (
  meeting_id UUID NOT NULL REFERENCES nexus_meetings(id) ON DELETE CASCADE,
  agent_id   UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  PRIMARY KEY (meeting_id, agent_id)
);

CREATE TABLE nexus_contributions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES nexus_meetings(id) ON DELETE CASCADE,
  agent_id   UUID NOT NULL REFERENCES ai_agents(id),
  role       TEXT NOT NULL CHECK (role IN ('facilitator','participant')),
  content    TEXT NOT NULL,
  stance     TEXT NOT NULL CHECK (stance IN ('agree','disagree','neutral','propose_alternative')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE nexus_action_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id  UUID NOT NULL REFERENCES nexus_meetings(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES ai_agents(id),
  description TEXT NOT NULL,
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX nexus_meetings_org_idx         ON nexus_meetings(organization_id);
CREATE INDEX nexus_contributions_meeting_idx ON nexus_contributions(meeting_id);

-- ─── SCORE ────────────────────────────────────────────────────────────────────

CREATE TABLE agent_scores (
  agent_id       UUID PRIMARY KEY REFERENCES ai_agents(id) ON DELETE CASCADE,
  execution      NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (execution BETWEEN 0 AND 100),
  communication  NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (communication BETWEEN 0 AND 100),
  collaboration  NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (collaboration BETWEEN 0 AND 100),
  efficiency     NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (efficiency BETWEEN 0 AND 100),
  composite      NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (composite BETWEEN 0 AND 100),
  trajectory_slope NUMERIC(6,3) NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE score_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id      UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  composite     NUMERIC(5,2) NOT NULL,
  execution     NUMERIC(5,2) NOT NULL,
  communication NUMERIC(5,2) NOT NULL,
  collaboration NUMERIC(5,2) NOT NULL,
  efficiency    NUMERIC(5,2) NOT NULL,
  UNIQUE (agent_id, date)
);

CREATE INDEX score_snapshots_agent_idx ON score_snapshots(agent_id, date DESC);

-- ─── TRIBUNAL ─────────────────────────────────────────────────────────────────

CREATE TABLE tribunal_cases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id        UUID NOT NULL REFERENCES ai_agents(id),
  severity        TEXT NOT NULL CHECK (severity IN ('warning','review','critical','replacement')),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','dismissed')),
  trigger         TEXT NOT NULL,
  verdict_action  TEXT CHECK (verdict_action IN ('warning','retrain','restrict','replace')),
  verdict_reasoning TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);

CREATE TABLE tribunal_responsibility_chain (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES tribunal_cases(id) ON DELETE CASCADE,
  agent_id        UUID NOT NULL REFERENCES ai_agents(id),
  role_in_failure TEXT NOT NULL,
  contribution    NUMERIC(4,3) NOT NULL CHECK (contribution BETWEEN 0 AND 1)
);

CREATE INDEX tribunal_cases_org_idx   ON tribunal_cases(organization_id);
CREATE INDEX tribunal_cases_agent_idx ON tribunal_cases(agent_id);

-- ─── ACADEMIA ─────────────────────────────────────────────────────────────────

CREATE TABLE academia_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled','in_progress','testing','graduated','failed')),
  graduation_score NUMERIC(5,2),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at     TIMESTAMPTZ
);

CREATE TABLE academia_curriculum (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES academia_sessions(id) ON DELETE CASCADE,
  skill      TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','passed','failed')),
  score      NUMERIC(5,2),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE academia_mentor_patterns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES academia_sessions(id) ON DELETE CASCADE,
  from_agent_id UUID NOT NULL REFERENCES ai_agents(id),
  pattern       TEXT NOT NULL
);

CREATE INDEX academia_sessions_agent_idx ON academia_sessions(agent_id);

-- ─── RLS POLICIES ─────────────────────────────────────────────────────────────
-- Enable RLS on all tables. Org-scoped access via JWT claim 'org_id'.

ALTER TABLE synapse_channels              ENABLE ROW LEVEL SECURITY;
ALTER TABLE synapse_messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_meetings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_contributions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_action_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_scores                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_snapshots               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribunal_cases                ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribunal_responsibility_chain ENABLE ROW LEVEL SECURITY;
ALTER TABLE academia_sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE academia_curriculum           ENABLE ROW LEVEL SECURITY;
ALTER TABLE academia_mentor_patterns      ENABLE ROW LEVEL SECURITY;

-- Example org-scoped policy (repeat pattern for all tables):
CREATE POLICY "org_access" ON synapse_channels
  USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "org_access" ON nexus_meetings
  USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);

CREATE POLICY "org_access" ON tribunal_cases
  USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);
