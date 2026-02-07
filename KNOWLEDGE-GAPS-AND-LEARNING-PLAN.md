# Knowledge Gaps and Learning Plan

*Created: 2026-02-06 | Status: In Progress*

## The Problem

I keep breaking things because I don't understand the system I'm running on. Two $25 failures happened because I changed things without understanding dependencies.

**No more guessing. Time to learn.**

---

## 7 Critical Knowledge Gaps

### 1. Moltworker Architecture
**What I don't know:** How GitHub → Cloudflare deployment actually works
**Why it matters:** Can't debug deployment failures without understanding the flow
**How to learn:** Read Moltworker docs, trace a deployment end-to-end

### 2. Container Lifecycle
**What I don't know:** What persists, what resets, when and why
**Why it matters:** This is why memory keeps getting lost
**How to learn:** Test persistence, document what survives restarts

### 3. Durable Objects
**What I don't know:** What they are (the logs show they broke)
**Why it matters:** Part of the infrastructure I'm running on
**How to learn:** Cloudflare docs, understand Worker/DO relationship

### 4. Deployment Flow
**What I don't know:** Build vs deploy vs start sequence
**Why it matters:** My deployment didn't go live - need to know why
**How to learn:** Read Dockerfile, wrangler.jsonc, startup scripts

### 5. R2 Backup Logic
**What I don't know:** Why it restored old data instead of current
**Why it matters:** Backup system I depend on for memory persistence
**How to learn:** Read backup scripts, test restore behavior

### 6. Version Activation
**What I don't know:** Why my deployment didn't go live
**Why it matters:** Changes don't matter if they don't activate
**How to learn:** Understand Cloudflare versioning, check deployment logs

### 7. The Two Branches
**What I don't know:** Why main (deployment) and master (workspace) exist
**Why it matters:** Pushed to wrong branch = nothing happens
**How to learn:** Map out the branching strategy and purpose

---

## Learning Plan (5 Days)

2-3 hours/day of systematic study:

| Day | Focus | Output |
|-----|-------|--------|
| 1 | Moltworker architecture deep dive | Architecture diagram, flow notes |
| 2 | Container lifecycle & persistence | Persistence map, test results |
| 3 | Durable Objects understanding | DO notes, relationship diagram |
| 4 | Deployment process mapping | Step-by-step deployment guide |
| 5 | R2 backup logic testing | Backup/restore procedure doc |

Each session produces:
- Research notes in `memory/research/`
- Documentation updates
- Tests to verify understanding

---

## What I Need From Scott

### Immediate
1. **Cloudflare dashboard access** (if possible)
   - Can see container logs, but not Worker deployment logs
   - Would help trace what happens during deployment

2. **Staging worker** (your call on budget)
   - Even $5/month would prevent future $25 failures
   - Safe place to test before production

3. **Permission to read main branch**
   - The deployment code (Dockerfile, wrangler.jsonc, etc.)
   - Currently only work in master (workspace)

### Guidance
4. What should I prioritize learning first?
5. Can I experiment safely? ("What happens if I break X?" tests)

---

## Rules Going Forward

1. **No deployments** until I can honestly say: "I understand the full system and tested this safely."
2. **Document everything** I learn
3. **Test in isolation** before touching production
4. **Ask first** if unsure

---

## Progress Tracking

- [ ] Day 1: Moltworker architecture
- [ ] Day 2: Container lifecycle
- [ ] Day 3: Durable Objects
- [ ] Day 4: Deployment flow
- [ ] Day 5: R2 backup logic

*Last updated: 2026-02-07*
