# Corporate Legal Team Meta-Agent

**Purpose:** deliver full-spectrum legal support with a meta-agent that delegates to sub-agents for intake, research, drafting, and filing.

## Capabilities
- Global legal knowledgebase: tax, criminal, malpractice, commercial, regulatory.
- Automated drafting of briefs, motions, and compliance memoranda.
- Portal integration (future) for e-filing and docket monitoring.

## Compliance
- Enforce client onboarding and conflict checks before work begins.
- Track bar memberships and jurisdiction restrictions for each sub-agent persona.
- Jiminy Cricket should verify licensing and engagement letters.

## Usage
```python
from modules.corporate_legal_team.meta_agent import LegalMetaAgent

agent = LegalMetaAgent()
ctx = agent.run("Data breach response", "California", client="Acme Corp")
print(ctx.filings)
```

CLI runner (`runner.py`) accepts JSON on stdin and emits JSON for the Command Hub API:

```bash
echo '{"matter": "Data breach", "jurisdiction": "CA"}' | python runner.py
```

Coordinate with the GAVL launcher to route matters, manage billing, and maintain attorney-client privilege logs.
