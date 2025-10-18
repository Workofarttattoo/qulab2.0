# GAVL MCP Server
## Model Context Protocol Integration for The GAVL Platform

**Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.**

---

## Overview

This MCP (Model Context Protocol) server provides Claude Desktop and other MCP clients with secure access to The GAVL's algorithmic justice platform capabilities.

**What it does:** Enables AI assistants to access GAVL verdict analysis, evidence evaluation, and legal precedent matching while maintaining strict privacy controls and user consent requirements.

**Key Features:**
- 🔒 **Privacy-First**: All user data requires explicit consent before sharing
- 🔐 **OAuth 2.0 + Resource Indicators**: Follows MCP 2025-06-18 security spec
- ⚖️ **Verdict Tools**: Analyze cases, match precedents, generate confidence scores
- 📊 **Transparent**: All operations logged and auditable
- 🌍 **Multi-Jurisdictional**: Supports legal frameworks from multiple countries

---

## Installation

### Prerequisites
- Python 3.9+
- Claude Desktop or compatible MCP client
- GAVL API access (register at https://thegavl.com)

### Quick Start

```bash
# Clone repository
git clone https://github.com/CorporationOfLight/gavl-mcp-server
cd gavl-mcp-server

# Install dependencies
pip install -r requirements.txt

# Set up configuration
cp config.example.json config.json
# Edit config.json with your GAVL API credentials

# Run server
python server.py
```

### Claude Desktop Integration

Add to your Claude Desktop MCP configuration (`~/Library/Application Support/Claude/mcp_config.json` on macOS):

```json
{
  "mcpServers": {
    "gavl": {
      "command": "python",
      "args": ["/path/to/gavl-mcp-server/server.py"],
      "env": {
        "GAVL_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

---

## Security & Privacy

### MCP 2025-06-18 Compliance

This server implements the latest MCP security specifications:

1. **OAuth Resource Server Pattern**
   - Server acts as OAuth Resource Server
   - Clients use Resource Indicators (RFC 8707) in token requests
   - Tokens scoped specifically to this MCP server instance

2. **Explicit User Consent**
   - Every verdict analysis requires user approval
   - Users see evidence summary before AI processes it
   - Clear consent dialogs for all data sharing

3. **Data Privacy Controls**
   - Evidence data never transmitted without permission
   - User can revoke access at any time
   - All case data encrypted at rest (AES-256)
   - Logs anonymized by default

4. **Tool Safety**
   - Tool descriptions clearly explain capabilities
   - No destructive operations (read-only by default)
   - Audit trail for all tool invocations

### Privacy Protections

**What we collect:**
- Case metadata (anonymized by default)
- Verdict outcomes (for accuracy improvement)
- Usage analytics (aggregate only)

**What we DON'T collect:**
- Personal identifying information (unless explicitly provided)
- Evidence content (unless user explicitly shares)
- Attorney-client privileged communications

**Data retention:**
- Anonymized analytics: 90 days
- Verdict tokens: Indefinite (for blockchain verification)
- User account data: Until account deletion

---

## Available Tools

### 1. `gavl_analyze_case`

Analyzes a legal case using GAVL's quantum ML algorithms.

**Input:**
```json
{
  "case_title": "Smith v. Jones",
  "jurisdiction": "US-CA",
  "case_type": "contract_dispute",
  "evidence_summary": "Brief summary of evidence",
  "legal_question": "Is the contract enforceable?"
}
```

**Output:**
```json
{
  "verdict": "Contract is enforceable",
  "confidence": 0.94,
  "reasoning": ["Point 1", "Point 2", "Point 3"],
  "precedents": ["Case A", "Case B"],
  "token": "US3C-V7CR-8K2P-4QT9"
}
```

**Privacy:** Requires user consent before processing evidence summary.

---

### 2. `gavl_match_precedents`

Finds relevant legal precedents for a given fact pattern.

**Input:**
```json
{
  "jurisdiction": "UK",
  "fact_pattern": "Breach of warranty claim on software license",
  "legal_area": "contract_law",
  "limit": 5
}
```

**Output:**
```json
{
  "precedents": [
    {
      "case_name": "Beta Computers v. Adobe UK",
      "year": 1996,
      "relevance_score": 0.91,
      "summary": "...",
      "key_holding": "..."
    }
  ]
}
```

**Privacy:** Fact patterns are anonymized before database search.

---

### 3. `gavl_evaluate_evidence`

Evaluates strength of evidence using Bayesian inference.

**Input:**
```json
{
  "evidence_type": "witness_statement",
  "evidence_content": "Witness claims to have seen...",
  "prior_probability": 0.5,
  "context": "civil_fraud"
}
```

**Output:**
```json
{
  "posterior_probability": 0.73,
  "credibility_score": 0.82,
  "contradictions": [],
  "supporting_factors": ["Factor 1", "Factor 2"]
}
```

**Privacy:** Evidence content hashed; only hash sent to GAVL API.

---

### 4. `gavl_check_compliance`

Checks if a proposed action complies with legal requirements.

**Input:**
```json
{
  "jurisdiction": "Singapore",
  "action": "Terminating employee for cause",
  "context": "Employee violated non-compete clause",
  "relevant_laws": ["Employment Act 1968"]
}
```

**Output:**
```json
{
  "compliant": true,
  "risk_level": "low",
  "requirements": ["Provide 30 days notice", "Document violation"],
  "references": ["Section 14(1) Employment Act"]
}
```

**Privacy:** No personal data sent; uses abstract action descriptions.

---

## Resources

MCP servers can expose resources (data) for AI consumption. GAVL provides:

### `gavl://jurisdictions/list`

List of supported jurisdictions with legal framework summaries.

**Format:** JSON
**Privacy:** Public data, no user consent required.

---

### `gavl://precedents/{jurisdiction}/{area}`

Database of legal precedents for a given jurisdiction and legal area.

**Example:** `gavl://precedents/US-CA/contract_law`
**Format:** JSON array
**Privacy:** Public case law, no PII.

---

### `gavl://user/verdict_history`

User's past verdict requests (requires authentication).

**Format:** JSON array
**Privacy:** Requires OAuth token and explicit user consent.

---

## Prompts

Templated workflows for common legal tasks:

### `gavl_analyze_contract`

Interactive wizard for contract dispute analysis.

**Steps:**
1. User uploads contract (or pastes text)
2. Describes dispute in natural language
3. GAVL analyzes breach/enforceability
4. Provides verdict with confidence score

**Privacy:** User approves each step before proceeding.

---

### `gavl_forecast_outcome`

Predicts case outcome using Schrödinger dynamics and historical data.

**Steps:**
1. User describes case facts
2. Selects jurisdiction and case type
3. GAVL runs quantum forecast
4. Shows probability distribution of outcomes

**Privacy:** Case facts anonymized before analysis.

---

## Configuration

### Environment Variables

```bash
# Required
GAVL_API_KEY="your-api-key"
GAVL_API_URL="https://api.thegavl.com/v1"

# Optional
GAVL_LOG_LEVEL="INFO"  # DEBUG, INFO, WARN, ERROR
GAVL_ANONYMIZE="true"  # Auto-anonymize case data
GAVL_CONSENT_TIMEOUT="300"  # Seconds to wait for user consent
GAVL_CACHE_TTL="3600"  # Cache precedent data for N seconds
```

### OAuth Configuration

```json
{
  "oauth": {
    "authorization_server": "https://auth.thegavl.com",
    "resource_indicator": "https://api.thegavl.com",
    "scopes": ["verdicts:read", "precedents:search", "evidence:analyze"],
    "token_endpoint": "https://auth.thegavl.com/oauth/token"
  }
}
```

---

## Development

### Running Tests

```bash
pytest tests/
```

### Linting

```bash
flake8 server.py
mypy server.py
```

### Protocol Compliance

```bash
# Validate MCP spec compliance
python -m mcp.validate server.py
```

---

## Deployment

### Production Checklist

- [ ] Use HSM for API key storage (not env vars)
- [ ] Enable request signing (HMAC-SHA256)
- [ ] Configure rate limiting (10 req/min per user)
- [ ] Set up monitoring (Datadog, Prometheus)
- [ ] Enable audit logging (immutable append-only)
- [ ] Obtain SOC 2 Type II certification
- [ ] Configure CORS allowlist for web clients
- [ ] Set up disaster recovery (RPO < 1 hour)

### Docker Deployment

```bash
docker build -t gavl-mcp-server .
docker run -e GAVL_API_KEY=$GAVL_API_KEY -p 3000:3000 gavl-mcp-server
```

---

## License

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light).
All Rights Reserved. PATENT PENDING.

This MCP server is provided under a proprietary license for use with The GAVL Platform.
Redistribution requires written permission.

---

## Support

**Email:** support@thegavl.com
**Documentation:** https://docs.thegavl.com/mcp
**GitHub Issues:** https://github.com/CorporationOfLight/gavl-mcp-server/issues

---

## Description for Anthropic (50 words max)

MCP server exposing GAVL's quantum-enhanced legal AI: analyze cases, match precedents, evaluate evidence. Full MCP 2025-06-18 compliance with OAuth + Resource Indicators. Privacy-first: explicit consent for all data, AES-256 encryption, audit logs. Supports 20+ jurisdictions. Helps AI democratize access to unbiased justice globally.
