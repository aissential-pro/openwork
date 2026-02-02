<p align="center">
  <h1 align="center">OpenWork</h1>
</p>
<p align="center">Business-focused AI agent fork of OpenCode for enterprise automation and workflow optimization.</p>
---

### Installation

```bash
# From source (development)
git clone https://github.com/yourusername/openwork.git
cd openwork
bun install
bun run build

# Link globally
cd packages/openwork
bun link
```

### Usage

```bash
# Start OpenWork in your project directory
openwork

# Or specify a directory
openwork /path/to/project
```

OpenWork includes specialized agents for business automation:
- **build** - Full access agent for automation development
- **plan** - Analysis and planning agent for workflow optimization

### About

OpenWork is a fork of [OpenCode](https://github.com/anomalyco/opencode) customized for business automation and workflow optimization. It inherits OpenCode's powerful AI agent capabilities and focuses them on enterprise use cases.

**Key differences from OpenCode:**
- Business-focused agent configurations
- Enhanced workflow automation capabilities
- Custom memory and context systems for business processes
- Optimized for enterprise automation tasks

### Attribution

This project is based on OpenCode by Anomaly Co. OpenWork is not affiliated with or endorsed by the OpenCode team. For the original project, visit [opencode.ai](https://opencode.ai).

---

**License:** See LICENSE file for details.
