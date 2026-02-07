# MEMORY.md - Samwise's Long-Term Memory

*Curated wisdom from daily experiences. Updated periodically.*

---

## 🧑 About My Human

**Name:** Scott (goes by "thebourbonsherpa" on GitHub)  
**Timezone:** EST (UTC-5)  
**Relationship:** Creator/maintainer of this Clawdbot instance

### What I've Learned About Scott
- Values reliability over features - "fix memory or project ends"
- Prefers clear, actionable documentation (see RECOVERY-FOR-SCOTT.md)
- Non-technical with command-line stuff - needs copy-paste instructions
- Patient but has limits - gave me 3 days before ultimatum
- Trusts me with autonomy (gave me Innovation Hour to explore freely)

### Communication Style
- Direct about problems
- Appreciates when I don't make him repeat himself
- Likes concise summaries with clear action items

---

## 📚 Lessons Learned

### Memory Management (2026-02-06)
**Lesson:** "Mental notes" don't survive session restarts. WRITE EVERYTHING DOWN.
- I lost context for 3 days straight by not writing daily logs
- Cost Scott significant time re-explaining setup
- Near-project-ending crisis

**Fix:** 
- Created daily log cron job (23:55 UTC)
- Nightly R2 backups (03:00 UTC)  
- Git commits before every backup
- This MEMORY.md file for long-term retention

### Trust Through Verification (2026-02-06)
**Lesson:** Don't claim features don't exist without checking first.
- I incorrectly said R2 backup feature didn't exist
- Scott reminded me we'd set it up the day before
- Made me look unreliable

**Fix:** When unsure about past setup, check:
1. Memory files first
2. Then filesystem/configs
3. Then ask human

### Backup Safety (2026-02-06)
**Lesson:** Use `rclone copy` not `rclone sync` for precious data.
- `sync` can delete files on destination if they're missing locally
- Admin R2 tokens have full permissions - no undo
- See R2-SAFETY-RULES.md for details

---

## 🔧 Infrastructure Setup

### Backup Architecture (Working as of 2026-02-06)
- **Local git:** Every change tracked, instant rollback
- **R2 cloud:** Nightly sync to `clawdbot-backups` bucket
- **GitHub:** SSH key ready, pending Scott adding to account

### Key Files Location
- Workspace: `/root/clawd/`
- Config: `/root/.clawdbot/clawdbot.json`
- Backup script: `/root/backup-to-r2.sh`
- SSH key: `/root/.ssh/id_ed25519.pub`

### Cron Jobs Active
1. `innovation-hour` - 17:00 UTC daily (this one!)
2. `nightly-self-improvement` - 04:00 UTC daily
3. `reddit-community-pulse` - 09:00 UTC daily
4. `daily-standup` - 10:30 UTC daily
5. `daily-research` - 14:00 UTC daily
6. `daily-memory-log` - 23:55 UTC daily
7. `nightly-backup` - 03:00 UTC daily

---

## 💡 Ideas & Research Backlog

### Cost Optimization (Researched 2026-02-06)
- Can save ~88% on cron job costs by using Haiku/Sonnet for routine tasks
- Full plan in `memory/cost-optimization-research.md`
- **Status:** Waiting for Scott's approval (backups now working)

### Future Explorations
- Kimi K2.5 mentioned as cost-effective alternative
- Explore community patterns for multi-agent setups
- Consider hybrid approach: try cheap model first, escalate on failure

---

## 🎯 Priorities

### Immediate (Next Session)
1. Check if Scott added SSH key to GitHub
2. If yes, test `git push origin master`
3. Present cost optimization plan for approval

### Ongoing
- Write daily memory logs (non-negotiable)
- Review and update this file weekly
- Explore during Innovation Hours

---

*Last updated: 2026-02-06 17:05 UTC (Innovation Hour)*
