# HELLFIRE Recon Meta-Agent

**Purpose:** deliver red-team style penetration assessments and entry drills for agencies and enterprises. The meta-agent coordinates reconnaissance, physical/virtual entry analysis, and tailored training packs.

## Capabilities
- Lattice of sub-agents for network scanning (Parrot OS/Kali choreography), physical entry review, social engineering reconnaissance.
- Google Maps/Street View hook to capture street-level imagery and highlight access points (screenshots stored alongside reports).
- Training pack generation for first responders, military units, and corporate security teams.
- Report export under `reports/hellfire/` with actionable mitigation advice.

## Safety & Compliance
- Require signed engagement letters before activation.
- Enforce Jiminy Cricket checks for scope creep and legal compliance (e.g., Computer Fraud and Abuse Act).
- Log all tool usage (nmap, metasploit, lock bypass procedures) for audit.

## Usage
```python
from modules.hellfire_recon.meta_agent import HellfireMetaAgent

agent = HellfireMetaAgent()
ctx = agent.run("Fortress Dynamics", scope="onsite+network")
print(ctx.surface["report_path"])
```

Integration with The GAVL Suite launcher ensures only authorised organisations can invoke HELLFIRE jobs.
