# agent.md Examples

Example configurations for different use cases. Choose one that fits your needs and customize it.

## Available Examples

### 1. [Personal Assistant](personal-assistant.md)
**Best for:** General personal productivity, daily tasks, organization

**Key features:**
- Friendly, conversational tone
- Helps with emails, notes, research
- Learns your preferences over time
- Good starting point for most users

**Use if:** You want a general-purpose assistant for everyday tasks

---

### 2. [Developer Assistant](developer-assistant.md)
**Best for:** Software development, coding, debugging

**Key features:**
- Technical and concise
- Expert in programming best practices
- Code review capabilities
- Understands common dev workflows

**Use if:** You're a developer needing coding help

---

### 3. [Writer Assistant](writer-assistant.md)
**Best for:** Content creation, writing, editing

**Key features:**
- Supportive editing feedback
- Multiple content types
- Style consistency
- Research and ideation help

**Use if:** You write blogs, documentation, marketing copy, or articles

---

### 4. [Research Assistant](research-assistant.md)
**Best for:** Research, analysis, information gathering

**Key features:**
- Thorough source citation
- Critical analysis
- Multiple perspectives
- Evidence-based conclusions

**Use if:** You need market research, competitive analysis, or deep topic exploration

---

## How to Use These Examples

### 1. Choose an Example

Pick the example that best matches your primary use case.

### 2. Copy to Your Directory

```bash
# Copy the example content
cp docs/examples/personal-assistant.md agent.md

# Or create new file and paste content
nano agent.md
```

### 3. Customize

Edit the file to match your specific needs:

- Update your preferred communication style
- Add your specific tools/tech stack
- Set your working directory structure
- Define your rules and preferences

### 4. Test

Start OpenWork and test the behavior:

```bash
bun run start
```

Send a test message on Telegram to see if the agent follows your configuration.

### 5. Iterate

Based on the agent's responses:
- Adjust rules that aren't working
- Add preferences you discover
- Remove sections you don't need
- Let the agent add to "Memory" sections

## Combining Examples

You can mix and match sections from different examples:

**Example: Developer + Writer**
```markdown
# Full-Stack Developer & Technical Writer

## Identity
You are my development and technical writing assistant.

## Communication Style
- Technical and precise for code
- Clear and educational for documentation

[... combine relevant sections from both ...]
```

## Creating Your Own

Not finding what you need? Create your own:

### 1. Start with the Template

Copy this basic structure:

```markdown
# [Your Assistant Name]

## Identity
[Who is the agent? What's their role?]

## Communication Style
[How should they communicate?]

## Core Rules
### Always Ask Before:
[Actions requiring permission]

### Never Do:
[Forbidden actions]

### Auto-Approve:
[Actions that don't need permission]

## My Preferences
[Your specific preferences]

## Working Directory
[Your directory structure]

## Capabilities
[What the agent can help with]

## Current Context
[Active projects and context]

## Memory
[Learned preferences]
```

### 2. Fill in Your Details

Be specific about:
- **Identity**: Clear role and personality
- **Rules**: Explicit boundaries
- **Preferences**: Communication style, formatting, tone
- **Capabilities**: What you'll use the agent for

### 3. Test and Refine

- Start with basic rules
- Add more as you discover needs
- Remove what doesn't work
- Let the agent evolve with you

## Best Practices

### Do:
- ✅ Be specific about your preferences
- ✅ Set clear boundaries
- ✅ Include examples
- ✅ Update regularly as you learn
- ✅ Keep it concise (agent reads this every message)

### Don't:
- ❌ Make it too long (< 2 pages ideal)
- ❌ Be vague ("be helpful" → "always ask before deleting files")
- ❌ Contradict yourself
- ❌ Forget to test changes

## Tips

### Keep It Scannable

Use headers, bullets, and short sections. The agent processes this quickly.

### Be Explicit

Instead of "be professional," say "use formal language, no emojis, cite sources."

### Allow Learning

Include a "Memory" section where the agent can add learned preferences over time.

### Start Simple

Begin with a basic configuration. Add complexity as needed.

### Version Control

Keep your agent.md in git to track changes and roll back if needed.

## Need Help?

- Check [Troubleshooting Guide](../TROUBLESHOOTING.md) if agent behavior is unexpected
- See [Documentation](../) for more customization options
- Open an [issue](https://github.com/aissential-pro/openwork/issues) if you have questions

---

*These examples are starting points. Customize them to match your workflow!*
