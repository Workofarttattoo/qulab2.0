# GAVL Suite Quick Start

Copyright (c) 2025 Joshua Hendricks Cole (Corporation of Light). PATENT PENDING.

## 30-Second Start

```bash
cd TheGAVLSuite
./gavl.py
```

Press a number to launch a module, or:
- `A` = All core services
- `M` = All meta-agents
- `F` = Full suite
- `Q` = Quit

## 5-Minute Setup

### 1. Install Dependencies

```bash
# Core services (Node.js)
cd boardroom_of_light && npm install && cd ..
cd chrono_walker && pip install -r requirements.txt && cd ..

# Meta-agents (Python)
cd modules/osint && pip install -r requirements.txt && cd ../..
cd modules/hellfire_recon && pip install -r requirements.txt && cd ../..
```

### 2. Set API Keys (Optional)

```bash
# For HELLFIRE Street View
export GOOGLE_MAPS_API_KEY="your_key_here"

# For Legal LLM drafting
export OPENAI_API_KEY="your_key_here"
```

### 3. Launch

```bash
./gavl.py
```

### 4. Select a Module

```
1. Boardroom of Light  → http://localhost:5050
2. Jiminy Cricket      → http://localhost:3030
3. Chrono Walker       → http://localhost:8000
4. OSINT               → Intelligence gathering
5. HELLFIRE Recon      → Security assessment
6. Legal Team          → Document drafting
7. Enhancements        → Code analysis
8. Sophiarch           → Forecasting
```

## Common Tasks

### Launch Boardroom GUI
```bash
./gavl.py --module boardroom
# Visit http://localhost:5050
```

### Run OSINT Analysis
```bash
./gavl.py --module osint
```

### Check All Module Status
```bash
./gavl.py --status
```

### Launch Everything
```bash
./gavl.py --all
```

## Troubleshooting

**Module won't start?**
```bash
# Check dependencies
cd modules/osint
pip install -r requirements.txt
```

**Port in use?**
```bash
# Kill existing processes
./gavl.py
# Press 'K' to kill all
```

## Next Steps

- Read the full [Launcher Guide](LAUNCHER_GUIDE.md)
- Check individual module READMEs in `modules/*/README.md`
- Run health checks: `./gavl.py` → Press `H`

---

**Need Help?** See LAUNCHER_GUIDE.md for detailed documentation.
