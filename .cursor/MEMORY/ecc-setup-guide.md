# ECC Setup Guide for Portfolio Project

This guide explains how to use Everything Claude Code (ECC) with your Next.js portfolio.

## Your Project Stack

| Component | Tech |
|-----------|------|
| Framework | Next.js 16.1.1 (App Router) |
| UI | React 19.2.3 + Tailwind CSS v4 |
| 3D Graphics | Three.js + React Three Fiber |
| CMS | Sanity v4.22.0 |
| Auth | Clerk |

## Key ECC Resources for Your Project

| ECC Component | Count | Purpose |
|---------------|-------|---------|
| Agents | 36 | Specialized subagents |
| Skills | 150+ | Workflow patterns |
| Commands | 68 | Legacy slash commands |

## Agents Most Useful for You

| Agent | Use Case |
|-------|----------|
| `planner` | Plan new portfolio features |
| `typescript-reviewer` | Review Next.js/React code |
| `build-error-resolver` | Fix Next.js build failures |
| `security-reviewer` | Security audit before commits |
| `tdd-guide` | Test-driven development |
| `code-reviewer` | Review component code |
| `harness-optimizer` | Optimize token costs |

## Installation Commands

```bash
# 1. Install plugin
/plugin marketplace add affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code

# 2. Install rules (required - manual)
cd ~
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code
./install.sh typescript
```

## Common Workflows

### Add New Section
```
/everything-claude-code:plan "Add projects section"
/tdd
[implement]
/code-review
```

### Fix Build Error
```
/build-fix
```

### Security Check
```
/security-scan
```

### Documentation Update
```
/update-docs
```

## Token Optimization

Add to `~/.claude/settings.json`:

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

---

*Source: Everything Claude Code by @affaan-m (128K+ stars)*
