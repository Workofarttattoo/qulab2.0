# GAVL MCP Server - Quick Start Guide
**Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.**

---

## 🚀 Quick Start (3 Steps)

### Step 1: Set Your API Key

**Option A: Use the helper script (easiest)**
```bash
cd /Users/noone/TheGAVLSuite/thegavl_mcp_server
./set_api_key.sh your-api-key-here
```

**Option B: Use DEMO mode (testing)**
```bash
./set_api_key.sh
# Press Enter when prompted (uses demo mode)
```

**Option C: Edit config manually**
```bash
nano ~/Library/Application\ Support/Claude/mcp_config.json
# Change GAVL_API_KEY value
```

---

### Step 2: Restart Claude Desktop

**macOS:**
1. Quit Claude Desktop completely (Cmd+Q)
2. Reopen Claude Desktop
3. Wait 5-10 seconds for MCP server to initialize

**You'll know it's working when you see** "gavl" in the MCP tools menu (bottom of chat window).

---

### Step 3: Test It!

Try these example prompts in Claude Desktop:

**Example 1: Analyze a Contract**
```
Analyze this contract dispute:

Case: Smith v. Jones
Jurisdiction: US-CA
Type: Contract dispute

Evidence: Smith signed a consulting agreement with Jones for $50,000.
Work was completed but payment was not made. Jones claims work was
defective. Smith has email evidence showing Jones approved all deliverables.

Question: Is Smith entitled to payment?
```

**Example 2: Find Precedents**
```
Find legal precedents for breach of software license warranty in the UK.
```

**Example 3: Evaluate Evidence**
```
Evaluate this witness statement:

Type: Witness testimony
Context: Civil fraud case
Statement: "I saw the defendant signing the fraudulent documents on March 15, 2024
at approximately 2:30 PM in the downtown office."

What is the credibility score?
```

**Example 4: Check Compliance**
```
Check if this action complies with Singapore employment law:

Action: Terminating an employee for violating a non-compete clause
Context: Employee left to join a direct competitor within 6 months
Relevant laws: Employment Act 1968
```

---

## 🔧 Configuration Options

Your config file is at:
```
~/Library/Application Support/Claude/mcp_config.json
```

### Available Environment Variables

```json
{
  "env": {
    "GAVL_API_KEY": "your-api-key",           // Required for production
    "GAVL_API_URL": "https://api.thegavl.com/v1",  // API endpoint
    "GAVL_ANONYMIZE": "true",                  // Auto-anonymize PII
    "GAVL_LOG_LEVEL": "INFO",                  // DEBUG, INFO, WARN, ERROR
    "GAVL_CONSENT_TIMEOUT": "300",             // Consent timeout (seconds)
    "GAVL_CACHE_TTL": "3600"                   // Cache precedents (seconds)
  }
}
```

---

## 🐛 Troubleshooting

### Issue: "gavl" tool not appearing in Claude Desktop

**Solution:**
1. Check if config file exists: `cat ~/Library/Application\ Support/Claude/mcp_config.json`
2. Verify Python path: `which python` (should be Python 3.9+)
3. Test server manually: `cd /Users/noone/TheGAVLSuite/thegavl_mcp_server && python server.py`
4. Check Claude Desktop logs: `~/Library/Logs/Claude/mcp.log`

### Issue: "GAVL_API_KEY not set" warning

**Solution:**
- This is normal in DEMO mode
- Server will return simulated verdicts for testing
- To use production API, run: `./set_api_key.sh your-real-api-key`

### Issue: "MCP SDK not installed" error

**Solution:**
```bash
cd /Users/noone/TheGAVLSuite/thegavl_mcp_server
pip install -r requirements.txt
```

### Issue: Python version too old

**Solution:**
```bash
# Check version
python --version  # Should be 3.9+

# Upgrade if needed (macOS)
brew install python@3.11
# Update config to use: /opt/homebrew/bin/python3.11
```

---

## 📋 Available Tools

Your GAVL MCP server provides 4 tools:

### 1. `gavl_analyze_case`
Analyze legal cases with quantum ML algorithms.

**Required fields:**
- `case_title`: Case name
- `jurisdiction`: e.g., "US-CA", "UK", "SG"
- `case_type`: e.g., "contract_dispute", "criminal", "tort"
- `evidence_summary`: Brief summary
- `legal_question`: Specific question to answer

**Returns:**
- Verdict with confidence score (0-100%)
- Reasoning (bullet points)
- Relevant precedents
- Unique verification token

---

### 2. `gavl_match_precedents`
Find relevant legal precedents.

**Required fields:**
- `jurisdiction`: Jurisdiction code
- `fact_pattern`: Description of facts
- `legal_area`: e.g., "contract_law", "criminal_law"

**Optional:**
- `limit`: Max results (default: 5)

**Returns:**
- Matching precedents with relevance scores
- Case summaries and holdings

---

### 3. `gavl_evaluate_evidence`
Bayesian evidence evaluation.

**Required fields:**
- `evidence_type`: e.g., "witness_statement", "document"
- `evidence_content`: Content to evaluate
- `context`: Legal context

**Optional:**
- `prior_probability`: Starting probability (default: 0.5)

**Returns:**
- Posterior probability
- Credibility score
- Supporting factors and contradictions

---

### 4. `gavl_check_compliance`
Check legal compliance.

**Required fields:**
- `jurisdiction`: Jurisdiction code
- `action`: Proposed action
- `context`: Context for action

**Optional:**
- `relevant_laws`: Array of applicable statutes

**Returns:**
- Compliance status (true/false)
- Risk level (low/medium/high)
- Requirements to meet
- Legal references

---

## 🔐 Security & Privacy

Your GAVL MCP server implements:

- ✅ **Explicit user consent** for all data operations
- ✅ **PII anonymization** before API calls
- ✅ **Evidence hashing** (only hash sent, not content)
- ✅ **AES-256 encryption** for stored data
- ✅ **OAuth 2.0 + Resource Indicators** (MCP 2025-06-18 spec)
- ✅ **Audit logging** (all operations logged)

**Privacy protections:**
- Case metadata anonymized by default
- No personal info collected unless explicitly provided
- Evidence content never transmitted without consent
- Attorney-client privilege respected

---

## 📊 Demo Mode vs Production Mode

### Demo Mode (No API Key)
- ✅ Returns realistic simulated verdicts
- ✅ Safe for testing and development
- ✅ No billing or API limits
- ❌ Not real legal analysis

### Production Mode (API Key Set)
- ✅ Real quantum ML analysis
- ✅ Access to full precedent database (100,000+ cases)
- ✅ Blockchain verification tokens
- ✅ Compliance-ready audit trails
- 💰 Requires paid API key

**To switch from Demo to Production:**
```bash
./set_api_key.sh your-production-api-key
# Restart Claude Desktop
```

---

## 📞 Support

**Issues?** Check:
1. This guide's Troubleshooting section
2. Main README: `/Users/noone/TheGAVLSuite/thegavl_mcp_server/README.md`
3. Logs: `~/Library/Logs/Claude/mcp.log`

**Need help?**
- Email: support@thegavl.com
- Docs: https://docs.thegavl.com/mcp

---

## ✅ Current Status

You now have:
- ✅ MCP server installed at `/Users/noone/TheGAVLSuite/thegavl_mcp_server/`
- ✅ Claude Desktop config created
- ✅ Helper script for easy API key updates
- ✅ Demo mode enabled (ready to test)

**Next step**: Restart Claude Desktop and try the example prompts above!
