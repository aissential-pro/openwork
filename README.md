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

### Model Configuration

OpenWork supports multiple AI models. We recommend the following configuration for optimal cost-effectiveness:

**Default Model: Claude Sonnet 4**
- Best balance of performance and cost for most business tasks
- Excellent for document creation, analysis, and routine automation
- Handles complex reasoning while keeping costs manageable

**For Complex Tasks: Claude Opus 4**
- Use for high-stakes business decisions and complex multi-step analysis
- Superior reasoning for strategic planning and critical document review
- Switch to Opus when you need the highest quality output

**Switching Models:**
You can configure the model in your OpenWork settings or environment variables:
```bash
export OPENWORK_MODEL=claude-opus-4-5
# or
export OPENWORK_MODEL=claude-sonnet-4-5
```

**Cost Optimization Tips:**
- Use Sonnet 4 for routine tasks (80-90% of work)
- Reserve Opus 4 for strategic decisions and complex analysis
- Sub-agents spawned by the main agent typically use Sonnet 4 by default

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
