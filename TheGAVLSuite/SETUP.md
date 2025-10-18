# GAVL Suite Setup Guide

Copyright (c) 2025 Joshua Hendricks Cole (Corporation of Light). PATENT PENDING.

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **Git** (for cloning repositories)

## Quick Setup (5 Minutes)

```bash
cd /Users/noone/TheGAVLSuite

# Install Node.js dependencies for core services
cd boardroom_of_light && npm install && cd ..

# Install Python dependencies for Chrono Walker
cd chrono_walker && pip install -r requirements.txt && cd ..

# Install Python dependencies for Jiminy Cricket
cd jiminy_cricket && pip install -e . && cd ..

# Launch!
./gavl.py
```

## Detailed Setup

### 1. Core Services

#### Boardroom of Light + Jiminy Cricket (Node.js)
```bash
cd boardroom_of_light
npm install
cd ..
```

**Dependencies**: express, ws, socket.io (auto-installed)

#### Chrono Walker (Python)
```bash
cd chrono_walker
pip install -r requirements.txt
cd ..
```

**Dependencies**: fastapi, uvicorn, pandas

#### Jiminy Cricket Library (Python)
```bash
cd jiminy_cricket
pip install -e .
cd ..
```

**Dependencies**: None (stdlib only)

### 2. Meta-Agent Modules

#### OSINT Meta-Agent
```bash
cd modules/osint
pip install -r requirements.txt   # If exists
# Or manually:
pip install aiohttp pydantic
cd ../..
```

**Dependencies**: aiohttp, pydantic (for async API calls)

#### HELLFIRE Recon
```bash
cd modules/hellfire_recon
# No external dependencies required for basic functionality
# Optional: Google Maps API key for Street View
export GOOGLE_MAPS_API_KEY="your_key_here"
cd ../..
```

**Dependencies**: None (stdlib only)
**Optional**: Google Maps API key

#### Corporate Legal Team
```bash
cd modules/corporate_legal_team
# Optional: OpenAI API key for LLM drafting
export OPENAI_API_KEY="your_key_here"
cd ../..
```

**Dependencies**: None (stdlib only)
**Optional**: OpenAI API, openai package for LLM features

#### Chief Enhancements Office
```bash
cd modules/chief_enhancements_office
# No external dependencies required
cd ../..
```

**Dependencies**: None (stdlib only)

#### Bayesian Sophiarch
```bash
cd modules/bayesian_sophiarch
pip install numpy scipy
# Optional: Copy aios/ml_algorithms.py for advanced ML
cd ../..
```

**Dependencies**: numpy, scipy (for probability distributions)
**Optional**: aios ML algorithms for advanced features

### 3. Environment Variables (Optional)

Create a `.env` file in TheGAVLSuite root:

```bash
# Google Maps API (for HELLFIRE Street View)
GOOGLE_MAPS_API_KEY=your_google_maps_key

# OpenAI API (for Legal LLM drafting)
OPENAI_API_KEY=your_openai_key

# HaveIBeenPwned API (for OSINT breach checks)
HAVEIBEENPWNED_API_KEY=your_hibp_key
```

Then source it before launching:
```bash
source .env  # or: export $(cat .env | xargs)
./gavl.py
```

## Minimal Setup (No External Dependencies)

If you want to run without installing any dependencies:

**Core Services**:
- Chrono Walker only (requires fastapi/uvicorn)

**Meta-Agents** (work without dependencies):
- HELLFIRE Recon (basic functionality)
- Chief Enhancements Office (basic analysis)
- Corporate Legal Team (without LLM features)

```bash
# Install only Chrono Walker dependencies
cd chrono_walker
pip install fastapi uvicorn
cd ..

# Launch with minimal modules
./gavl.py
# Select option 3 (Chrono Walker)
# Select options 5, 7 (HELLFIRE, CEIO)
```

## Verification

### Test Each Module

```bash
# Test Python modules directly
cd modules/bayesian_sophiarch
python runner.py --demo
cd ../..

# Test Node services
cd boardroom_of_light
npm run gui &  # Should start on port 5050
sleep 5
curl http://localhost:5050
pkill -f "node web/server"
cd ..

# Test with launcher
./gavl.py --status
```

### Health Check All Modules

```bash
./gavl.py
# Press 'H' for health check
# Shows which modules are ready to run
```

## Troubleshooting

### "Module not found" errors

**Python modules**:
```bash
# Check Python path
python -c "import sys; print('\n'.join(sys.path))"

# Install missing packages
pip install <package_name>
```

**Node modules**:
```bash
cd boardroom_of_light
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

```bash
# Find what's using the port
lsof -i :5050  # Boardroom
lsof -i :3030  # Jiminy
lsof -i :8000  # Chrono

# Kill the process
kill -9 <PID>

# Or use launcher
./gavl.py
# Press 'K' to kill all GAVL processes
```

### Import errors in meta-agents

The meta-agents use relative imports. Make sure you're running them from their own directory or via the launcher:

```bash
# Good:
cd modules/osint
python runner.py --demo

# Good:
./gavl.py --module osint

# Bad (won't work):
python modules/osint/runner.py --demo
```

## Dependency Matrix

| Module | Python Deps | Node Deps | API Keys |
|--------|-------------|-----------|----------|
| Boardroom of Light | - | express, ws | - |
| Jiminy Cricket | - | express, ws | - |
| Chrono Walker | fastapi, uvicorn | - | - |
| OSINT | aiohttp, pydantic | - | Optional: HIBP |
| HELLFIRE Recon | - | - | Optional: Google Maps |
| Legal Team | Optional: openai | - | Optional: OpenAI |
| CEIO | - | - | - |
| Bayesian Sophiarch | numpy, scipy | - | - |

## Complete Installation Script

Save as `setup.sh` and run:

```bash
#!/bin/bash
set -e

echo "Installing GAVL Suite dependencies..."

# Core services
echo "→ Boardroom of Light..."
cd boardroom_of_light && npm install && cd ..

echo "→ Chrono Walker..."
cd chrono_walker && pip install -r requirements.txt && cd ..

echo "→ Jiminy Cricket..."
cd jiminy_cricket && pip install -e . && cd ..

# Meta-agents (optional dependencies)
echo "→ Bayesian Sophiarch..."
cd modules/bayesian_sophiarch
pip install numpy scipy 2>/dev/null || echo "  (optional deps skipped)"
cd ../..

echo "→ OSINT..."
cd modules/osint
pip install aiohttp pydantic 2>/dev/null || echo "  (optional deps skipped)"
cd ../..

echo ""
echo "✓ Setup complete!"
echo ""
echo "Launch with: ./gavl.py"
```

Make executable and run:
```bash
chmod +x setup.sh
./setup.sh
```

## Next Steps

After setup:
1. **Test the launcher**: `./gavl.py`
2. **Check status**: `./gavl.py --status`
3. **Run health checks**: `./gavl.py` → Press 'H'
4. **Launch a module**: `./gavl.py --module chrono`
5. **Read the docs**: `LAUNCHER_GUIDE.md`, `QUICKSTART.md`

## Support

- **Launcher issues**: See `LAUNCHER_GUIDE.md`
- **Module issues**: Check individual module `README.md` files
- **Dependency issues**: See this file (SETUP.md)

---

**Version**: 1.0.0
**Last Updated**: October 15, 2025
