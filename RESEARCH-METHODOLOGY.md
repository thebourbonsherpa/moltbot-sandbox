# Research Methodology - Cost-Conscious Learning

*Follow this approach for all learning/research tasks*

## Core Principles

1. **Search for known issues FIRST** - Before building workarounds, search: "openclaw [problem] cloudflare moltworker"
2. **Sonnet for reading, Opus for synthesis**
3. **Subagents for parallel work**
4. **Document as you go, not at the end**
5. **Commit frequently to GitHub**
6. **Backup to persistent storage**

---

## Model Selection Guide

### Use Sonnet (5x cheaper) for:
- Reading documentation
- Mining conversations for information
- Following structured learning plans
- Writing notes and summaries
- Routine research tasks

### Use Opus for:
- Complex synthesis (combining multiple sources)
- Strategic analysis
- Critical decision-making
- When stuck on something difficult
- Final presentation/deliverables

### Quick switch command:
```
/session status model=sonnet
```

---

## Subagent Strategy

### When to spawn subagents:
- Parallel research tracks (one per topic)
- Long-running tasks that don't need interaction
- Isolated experiments/tests
- Background monitoring

### When NOT to use subagents:
- Quick tasks (overhead not worth it)
- When you need interactive back-and-forth
- When context from main session is critical

---

## Documentation Protocol

### Real-time documentation:
1. Create file BEFORE starting work
2. Write findings as you discover them (not later)
3. Commit after each meaningful section
4. Sync to persistent storage at milestones

### File structure:
```
memory/research/
├── [topic]-notes.md          # Raw findings
├── [topic]-summary.md        # Synthesis
└── [topic]-todo.md           # Open questions
```

### Never trust memory:
- If it's not written down, it doesn't exist
- "I'll document it later" = it will be lost
- Mental notes don't survive restarts

---

## Backup Strategy

### After each research session:
```bash
# Commit to GitHub
cd /root/clawd
git add memory/research/
git commit -m "Research: [topic] - [what you learned]"
git push origin master

# Sync to persistent storage
cp memory/research/*.md /data/moltbot/workspace/memory/research/
```

### Frequency:
- Minimum: every 30 minutes during active research
- After completing each learning goal
- Before switching contexts

---

## Cost Tracking

### Keep notes on:
- Which model used for what
- Approximate token usage
- Whether subagents were efficient
- Lessons for next time

### Monthly review:
Look back at research costs and optimize approach.

---

## Daily Research Template

```markdown
# [Topic] Research - YYYY-MM-DD

**Goal:** [What I'm trying to learn]
**Model:** Sonnet (switch to Opus for: [specific tasks])
**Duration:** [planned time]

## Sources
- [ ] Source 1
- [ ] Source 2

## Findings
[Write as you learn]

## Questions Raised
[New things you don't understand]

## Next Steps
[What to research next]

## Commits Made
- [commit hash]: [what was committed]
```

---

*Remember: If it's not written down, it doesn't exist. Document as you go.*
