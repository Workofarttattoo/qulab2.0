# The GAVL Suite Unified Launcher Guide

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.

## Overview

The GAVL Suite Unified Launcher (`gavl.py`) provides an interactive boot menu for launching and managing all components of The GAVL Suite:

- **Core Services**: Boardroom of Light, Jiminy Cricket, Chrono Walker
- **Meta-Agent Modules**: OSINT, HELLFIRE Recon, Corporate Legal Team, Chief Enhancements Office, Bayesian Sophiarch
- **Command Hub**: Command orchestration interface

## Quick Start

### Interactive Mode (Recommended)

```bash
cd TheGAVLSuite
./gavl.py
```

This launches the interactive boot menu with the following options:

```
═══ BOOT MENU ═══

Core Services:
  1. Boardroom of Light     - Executive simulation GUI
  2. Jiminy Cricket        - Conscience companion
  3. Chrono Walker         - Timeline analysis

Meta-Agent Modules:
  4. OSINT                 - Intelligence gathering
  5. HELLFIRE Recon        - Security assessments
  6. Corporate Legal Team  - Legal research & drafting
  7. Chief Enhancements    - Software optimization
  8. Bayesian Sophiarch    - Probabilistic forecasting

Quick Actions:
  A. Launch ALL core services
  M. Launch ALL meta-agents
  F. Launch FULL suite (all modules)

Management:
  S. Status of all modules
  C. Configuration settings
  H. Health check all modules
  K. Kill all running processes

  Q. Quit
```

### Command Line Mode

Launch specific modules directly:

```bash
# Launch Boardroom of Light
./gavl.py --module boardroom

# Launch OSINT meta-agent
./gavl.py --module osint

# Launch all modules
./gavl.py --all

# Show status
./gavl.py --status

# Configuration menu
./gavl.py --config
```

## Module Reference

### Core Services

#### 1. Boardroom of Light
- **Type**: Node.js application
- **Port**: 5050
- **URL**: http://localhost:5050
- **Description**: Executive simulation GUI with quantum jury capabilities
- **Command**: `npm run gui`
- **Directory**: `boardroom_of_light/`

#### 2. Jiminy Cricket
- **Type**: Node.js application
- **Port**: 3030
- **URL**: http://localhost:3030
- **Description**: Conscience companion with REST + WebSocket APIs
- **Command**: `npm run conscience`
- **Directory**: `boardroom_of_light/`

#### 3. Chrono Walker
- **Type**: Python FastAPI
- **Port**: 8000
- **URL**: http://localhost:8000
- **Description**: Timeline analysis and evidence ledger system
- **Command**: `python -m backend.server`
- **Directory**: `chrono_walker/`

### Meta-Agent Modules

#### 4. OSINT Meta-Agent
- **Type**: Python meta-agent
- **Description**: Open-source intelligence gathering and analysis
- **Command**: `python runner.py --demo`
- **Directory**: `modules/osint/`
- **Features**:
  - Email breach checks
  - Social profile discovery
  - Corporate information lookup
  - Compliance and licensing framework
  - Evidence storage and export

#### 5. HELLFIRE Recon
- **Type**: Python meta-agent
- **Description**: Red-team security assessments and penetration testing
- **Command**: `python runner.py --demo`
- **Directory**: `modules/hellfire_recon/`
- **Features**:
  - Network reconnaissance (nmap, masscan)
  - Street View imagery capture
  - Entry vector analysis
  - Training pack generation
  - Engagement management

#### 6. Corporate Legal Team
- **Type**: Python meta-agent
- **Description**: Legal research and document drafting
- **Command**: `python runner.py --demo`
- **Directory**: `modules/corporate_legal_team/`
- **Features**:
  - LLM-powered legal drafting
  - LexisNexis integration
  - Court filing management
  - Matter tracking
  - Conflict checking

#### 7. Chief Enhancements Office
- **Type**: Python meta-agent
- **Description**: Software auditing and optimization
- **Command**: `python runner.py --demo`
- **Directory**: `modules/chief_enhancements_office/`
- **Features**:
  - Code metrics analysis
  - Security scanning
  - Dependency auditing
  - Performance optimization
  - Intelligent helpdesk
  - Smart escalation

#### 8. Bayesian Sophiarch
- **Type**: Python meta-agent
- **Description**: Probabilistic forecasting (Oracle of Light)
- **Command**: `python runner.py --demo`
- **Directory**: `modules/bayesian_sophiarch/`
- **Features**:
  - Real Bayesian inference
  - 4 ML algorithms (Particle Filter, GP, NUTS, Ensemble)
  - Multi-horizon forecasting
  - Uncertainty quantification
  - Executive reporting

## Features

### Interactive Boot Menu

The launcher provides a colorful, user-friendly terminal interface with:

- **Color-coded status indicators**:
  - Green (●) = Running
  - Red (○) = Stopped
  - Green text = Enabled
  - Yellow text = Disabled

- **Real-time process management**:
  - Start/stop individual modules
  - Launch multiple modules at once
  - Monitor running processes
  - Graceful shutdown with Ctrl+C

### Configuration Management

Access the configuration menu with option `C` or `./gavl.py --config`:

- **Enable/disable modules**: Toggle which modules are available in the launcher
- **Persistent settings**: Configuration saved to `gavl_config.json`
- **Reset to defaults**: Restore original settings

Configuration file format:
```json
{
  "modules": {
    "boardroom": {
      "enabled": true
    },
    "osint": {
      "enabled": true
    }
  },
  "last_updated": "2025-10-14T19:30:00"
}
```

### Status Monitoring

View the status of all modules with option `S` or `./gavl.py --status`:

- Shows running/stopped state for each module
- Displays enabled/disabled configuration
- Counts total running processes

### Health Checks

Run health checks on all meta-agent modules with option `H`:

- Executes `runner.py --health` for each meta-agent
- Reports pass/fail status
- Shows error messages for failures
- 10-second timeout per check

### Process Management

The launcher handles process lifecycle:

- **Graceful startup**: Validates directories and dependencies before launch
- **Process monitoring**: Tracks PIDs and status of all launched processes
- **Clean shutdown**: Terminates processes gracefully, force-kills if needed
- **Ctrl+C handling**: Stops all processes on interrupt

## Quick Actions

### Launch ALL Core Services (Option A)

Starts Boardroom of Light, Jiminy Cricket, and Chrono Walker in sequence.

```bash
# Via menu: Press 'A'
# Via CLI: Not available (launch individually instead)
```

### Launch ALL Meta-Agents (Option M)

Starts all 5 meta-agent modules (OSINT, HELLFIRE, Legal, CEIO, Sophiarch).

```bash
# Via menu: Press 'M'
# Via CLI: Not available (launch individually instead)
```

### Launch FULL Suite (Option F)

Starts all 8 modules (core services + meta-agents).

```bash
# Via menu: Press 'F'
# Via CLI: ./gavl.py --all
```

**Warning**: Launching all modules simultaneously is resource-intensive. Ensure you have:
- At least 8GB RAM available
- Node.js and Python properly installed
- All dependencies installed for each module

## Usage Examples

### Example 1: Launch Boardroom for Executive Simulation

```bash
./gavl.py --module boardroom

# Then visit http://localhost:5050 in your browser
```

### Example 2: Run OSINT Investigation

```bash
./gavl.py --module osint

# Or from interactive menu, press '4'
```

### Example 3: Full Suite for Production

```bash
# Launch everything
./gavl.py --all

# Check status in another terminal
./gavl.py --status

# Stop all when done
# (Return to launcher terminal and press Ctrl+C)
```

### Example 4: Run Health Checks Before Deployment

```bash
./gavl.py

# Press 'H' for health checks
# Verify all modules pass before launching
```

## Troubleshooting

### Module Won't Start

**Problem**: Module shows as stopped immediately after launch.

**Solutions**:
1. Check if the working directory exists:
   ```bash
   ls -la TheGAVLSuite/modules/osint
   ```

2. Verify dependencies are installed:
   ```bash
   cd TheGAVLSuite/modules/osint
   pip install -r requirements.txt  # For Python modules
   npm install                       # For Node modules
   ```

3. Run the module directly to see error messages:
   ```bash
   cd TheGAVLSuite/modules/osint
   python runner.py --demo
   ```

### Port Already in Use

**Problem**: "Address already in use" error.

**Solutions**:
1. Check what's using the port:
   ```bash
   lsof -i :5050  # For Boardroom
   lsof -i :3030  # For Jiminy
   lsof -i :8000  # For Chrono Walker
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   ```

3. Or use the launcher's kill option (`K`) to stop all GAVL processes.

### Configuration Not Saving

**Problem**: Settings reset after quitting.

**Solutions**:
1. Check file permissions:
   ```bash
   ls -la TheGAVLSuite/gavl_config.json
   ```

2. Ensure you pressed `S` to save in the config menu.

3. Verify you have write permissions in the TheGAVLSuite directory.

### Process Won't Stop

**Problem**: Module still running after selecting "Kill all".

**Solutions**:
1. The launcher sends SIGTERM first, then SIGKILL after 5 seconds.

2. Manually find and kill:
   ```bash
   ps aux | grep "npm run gui"
   kill -9 <PID>
   ```

3. Use system tools:
   ```bash
   # macOS/Linux
   pkill -f "npm run gui"
   pkill -f "python runner.py"
   ```

## Architecture

### Process Management

The launcher uses Python's `subprocess` module to spawn and manage child processes:

```python
process = subprocess.Popen(
    command,
    cwd=working_dir,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)
```

Processes are tracked in a dictionary:
```python
self.processes = {
    'boardroom': <Popen object>,
    'osint': <Popen object>,
    ...
}
```

### Configuration System

Configuration is stored as a JSON file with module settings:

```python
@dataclass
class ModuleConfig:
    name: str
    display_name: str
    description: str
    module_type: str  # python, node, meta_agent
    command: List[str]
    working_dir: str
    requires: List[str]
    port: Optional[int]
    url: Optional[str]
    enabled: bool
```

### Signal Handling

The launcher registers a signal handler for graceful shutdown:

```python
signal.signal(signal.SIGINT, self._signal_handler)

def _signal_handler(self, sig, frame):
    self.shutdown_all()
    sys.exit(0)
```

## Best Practices

### Development Workflow

1. **Test modules individually first**:
   ```bash
   ./gavl.py --module osint
   ```

2. **Use health checks before deployment**:
   ```bash
   ./gavl.py
   # Press 'H'
   ```

3. **Check status regularly**:
   ```bash
   ./gavl.py --status
   ```

### Production Deployment

1. **Launch only needed modules**:
   - Don't use "Launch FULL suite" unless necessary
   - Select specific modules for your use case

2. **Monitor resource usage**:
   ```bash
   # In another terminal
   htop  # or top
   ```

3. **Use screen/tmux for persistent sessions**:
   ```bash
   screen -S gavl
   ./gavl.py --module boardroom
   # Ctrl+A, D to detach

   # Later:
   screen -r gavl
   ```

### Security Considerations

- **HELLFIRE Recon**: Only run with proper authorization
- **OSINT**: Ensure compliance with privacy laws
- **API Keys**: Set environment variables before launching:
  ```bash
  export GOOGLE_MAPS_API_KEY="your_key"
  export OPENAI_API_KEY="your_key"
  ./gavl.py
  ```

## Integration with Other Systems

### LegionApp Mobile Companion

Future integration planned:
- Fetch personas from Jiminy Cricket API
- Receive conscience cues via WebSocket
- Access Boardroom simulation results

### Quantum Jury Bridge

Available through Boardroom of Light:
```bash
./gavl.py --module boardroom

# Then in Boardroom:
npm run jury -- --mode local   # Local simulation
npm run jury -- --mode ibm     # IBM Runtime
```

### External APIs

Meta-agents integrate with:
- Google Maps API (HELLFIRE Street View)
- OpenAI API (Legal drafting)
- LexisNexis (Legal research)
- HaveIBeenPwned (OSINT breaches)

## Command Reference

### Main Launcher

```bash
./gavl.py                    # Interactive boot menu
./gavl.py --module <name>    # Launch specific module
./gavl.py --all              # Launch all modules
./gavl.py --status           # Show module status
./gavl.py --config           # Configuration menu
```

### Module Names

- `boardroom` - Boardroom of Light
- `jiminy` - Jiminy Cricket
- `chrono` - Chrono Walker
- `osint` - OSINT Meta-Agent
- `hellfire` - HELLFIRE Recon
- `legal` - Corporate Legal Team
- `ceio` - Chief Enhancements Office
- `sophiarch` - Bayesian Sophiarch

## Environment Variables

### Required for Specific Modules

```bash
# HELLFIRE Recon (Street View)
export GOOGLE_MAPS_API_KEY="your_key"

# Legal Team (LLM drafting)
export OPENAI_API_KEY="your_key"

# OSINT (Optional API keys)
export HAVEIBEENPWNED_API_KEY="your_key"
```

### Optional Configuration

```bash
# Change default ports
export BOARDROOM_PORT=5050
export JIMINY_PORT=3030
export CHRONO_PORT=8000
```

## File Structure

```
TheGAVLSuite/
├── gavl.py                    # Unified launcher (THIS FILE)
├── gavl_config.json           # Configuration (auto-generated)
├── LAUNCHER_GUIDE.md          # This documentation
│
├── boardroom_of_light/        # Core service
├── jiminy_cricket/            # Core library
├── chrono_walker/             # Core service
│
└── modules/                   # Meta-agents
    ├── osint/
    ├── hellfire_recon/
    ├── corporate_legal_team/
    ├── chief_enhancements_office/
    └── bayesian_sophiarch/
```

## Support & Contribution

For issues, questions, or contributions:

1. Check this documentation first
2. Run health checks: `./gavl.py` → Press `H`
3. Check individual module README files
4. Review module logs in their respective directories

## License

Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light).
All Rights Reserved. PATENT PENDING.

---

**Version**: 1.0.0
**Last Updated**: October 14, 2025
**Platform**: macOS, Linux (Windows support planned)
