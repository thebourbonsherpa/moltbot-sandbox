# Multi-Agent Cost Optimization Research
**Date:** 2026-02-06  
**Task:** Research and implement cost-effective model selection for cron jobs and sub-agents

## Executive Summary

**Key Finding:** We can reduce costs by 60-80% by strategically assigning cheaper models to routine tasks while reserving expensive models (Opus) for complex work.

**Current State:**
- Default model: `anthropic/claude-opus-4-5` (most expensive)
- All cron jobs inherit this unless overridden
- 5 active cron jobs running daily/nightly

**Cost Breakdown** (Anthropic pricing):
- **Opus 4-5:** $15/M input, $75/M output
- **Sonnet 4-5:** $3/M input, $15/M output  
- **Haiku 3-5:** $1/M input, $5/M output

**Savings potential:** 5x-15x cheaper by using Sonnet/Haiku for routine tasks.

---

## Industry Best Practices

### 1. **Tiered Model Architecture** (AI-Jason.com)
> "Set up multiple agents, each using a different model. The first agent attempts to complete the task using a cheaper model, and if it fails, the next agent is invoked."

### 2. **Right-Sizing** (ElevenLabs)
> "Select the least complex (and typically less expensive) model that can reliably perform your specific task."

### 3. **Multi-Objective Optimization** (MoMA Framework)
> "Intent recognition determines agent/LLM assignment via utility-cost optimization on the Pareto frontier."

### 4. **Cost-Effective Routing** (C2MAB-V)
> "Combinatorial multi-armed bandit for optimal LLM selection based on task diversity and pricing structures."

---

## Clawdbot Documentation Review

### Cron Job Model Override (docs/automation/cron-jobs.md)
✅ **Supported:** Isolated cron jobs can override model via `payload.model`:

```json
{
  "name": "reddit-pulse",
  "schedule": {"kind": "cron", "expr": "0 9 * * *"},
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "Check r/clawdbot for updates",
    "model": "anthropic/claude-haiku-3-5"
  }
}
```

**Resolution priority:**
1. Job payload override (highest)
2. Hook-specific defaults
3. Agent config default

### Sub-Agent Model Selection (docs/concepts/multi-agent.md)
✅ **Supported:** `sessions_spawn` accepts `model` parameter:

```javascript
sessions_spawn({
  task: "Go research X",
  model: "anthropic/claude-haiku-3-5",
  agentId: "main"
})
```

### Model Aliases (docs/cli/models.md)
✅ **Already configured:**
- `sonnet` → `anthropic/claude-sonnet-4-5`
- `opus` → `anthropic/claude-opus-4-5`

Missing: Haiku alias (should add)

---

## Task Classification Framework

### 🔴 **Opus Tasks** (Complex reasoning, decisions)
- Innovation hour (creative exploration)
- Nightly self-improvement (code quality judgment)
- **User-facing main session** (high quality responses)

### 🟡 **Sonnet Tasks** (Moderate complexity)
- Daily standup (synthesis + reporting)
- Analysis with structured output
- Mid-complexity research

### 🟢 **Haiku Tasks** (Data collection, simple ops)
- Reddit pulse checks (scraping + basic filtering)
- Daily research logging (web search + save)
- Status checks / monitoring
- Simple notifications

---

## Recommended Changes

### Current Cron Jobs Analysis

| Job | Current Model | Recommended Model | Reasoning |
|-----|--------------|------------------|-----------|
| `innovation-hour` | opus (default) | **sonnet** | Needs creativity but not full Opus reasoning |
| `nightly-self-improvement` | opus (default) | **sonnet** | Code review benefits from quality, but Sonnet sufficient |
| `reddit-community-pulse` | opus (default) | **haiku** | Simple scraping + filtering task |
| `daily-standup` | opus (default) | **sonnet** | Synthesis task, but straightforward |
| `daily-research` | opus (default) | **haiku** | Web search + logging, minimal reasoning |

### Cost Impact Projection

**Before (all Opus):**
- ~5 daily cron runs
- Avg 5K input + 2K output tokens per run
- Cost: `(5000 * $0.015 + 2000 * $0.075) * 5 = $1.125/day`
- **$33.75/month**

**After (optimized):**
- 2 Sonnet jobs: `(5000 * $0.003 + 2000 * $0.015) * 2 = $0.09/day`
- 3 Haiku jobs: `(5000 * $0.001 + 2000 * $0.005) * 3 = $0.045/day`
- **$4.05/month total**

**Savings: ~88% reduction** ($29.70/month saved)

---

## Implementation Plan

### Phase 1: Add Haiku Alias ✅
```bash
clawdbot models aliases add haiku anthropic/claude-haiku-3-5
```

### Phase 2: Update Cron Jobs
```bash
# Reddit (Haiku)
clawdbot cron edit reddit-community-pulse --model haiku

# Daily research (Haiku)
clawdbot cron edit daily-research --model haiku

# Standup (Sonnet)
clawdbot cron edit daily-standup --model sonnet

# Innovation (Sonnet)
clawdbot cron edit innovation-hour --model sonnet

# Nightly improvement (Sonnet)
clawdbot cron edit nightly-self-improvement --model sonnet
```

### Phase 3: Document Sub-Agent Guidelines
Create delegation strategy in `AGENTS.md`:

```markdown
## Model Selection for Delegation

When spawning sub-agents:
- **Haiku**: Data collection, simple research, status checks
- **Sonnet**: Analysis, synthesis, moderate complexity
- **Opus**: Complex reasoning, decisions, user-facing quality
```

### Phase 4: Test & Validate
1. Monitor cron job outputs for quality degradation
2. Check session logs for completion rates
3. Adjust if needed (e.g., bump standup back to Opus if synthesis suffers)

---

## Monitoring & Adjustment

### Success Metrics
- ✅ No quality degradation in outputs
- ✅ Cost reduction matches projections
- ✅ Jobs complete successfully

### Red Flags
- ❌ Haiku fails to complete tasks (timeout/errors)
- ❌ Output quality noticeably worse
- ❌ Standup summaries lose important context

### Fallback Strategy
If a downgraded job fails consistently:
1. Bump to next tier (Haiku → Sonnet → Opus)
2. Document in `memory/cost-optimization-notes.md`
3. Review after 1 week

---

## Additional Opportunities

### Future Optimizations
1. **Sub-agent spawning**: Add model selection to delegation pattern
2. **Hybrid approach**: Try Haiku first, auto-escalate on failure
3. **Cost tracking**: Log token usage per job for visibility
4. **Kimi K2.5**: Community mentions as cost-effective alternative (research later)

### Not Recommended Yet
- ❌ GPT-4.1 for agentic tasks (community reports silent failures)
- ❌ Ultra-cheap models (<1B params) for cron jobs (reliability concerns)

---

## References

- Clawdbot Docs: `/automation/cron-jobs.md`, `/concepts/multi-agent.md`, `/cli/models.md`
- AI-Jason: "How to reduce 78%+ of LLM Cost"
- ElevenLabs: "Optimizing LLM costs"
- Research: MoMA routing framework, C2MAB-V multi-armed bandit

---

## Action Items

- [x] Backup current config
- [ ] Add Haiku alias
- [ ] Update cron jobs with model overrides
- [ ] Document delegation strategy in AGENTS.md
- [ ] Test for 3 days
- [ ] Review outputs and adjust if needed
