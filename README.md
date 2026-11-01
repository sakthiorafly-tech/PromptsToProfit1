# SkillArena: Play. Prove. Get Hired.

Hackathon prototype (IIT Gandhinagar). A frontend-only React + Vite app with no backend: everything runs in the browser and progress is stored in LocalStorage.

```bash
npm install
npm run dev      # http://localhost:5173
```

## 5-minute demo script
**Before you start:** click **Reset demo** in the sidebar and turn the laptop volume up. The app has sound effects; the speaker icon in the header mutes them.

1. **Landing** → *Enter the Arena (Demo)*.
2. **Dashboard** (30s): Riteesh has 375 XP (Beginner), a 6-day streak and rank #10. Point at the **Skill Coach pick** and **Career readiness** card (Frontend Developer 19%, *Needs support*).
3. **Switch the header to College** (20s): Riteesh is ranked **#39 of 48** in the IIT Gandhinagar batch. "This is what the placement cell sees."
4. **Switch back to Student → Mission Arena** → filter *React JS* → *Fix a Component Rendering Issue* → *Start Mission*.
5. Answers: Q1 → B · Q2 → `setItems(prev => [...prev, { id: crypto.randomUUID(), text }]);` · Q3 → C.
   **Presenter shortcut:** click on an empty part of the page and press **Shift + A**. That fills the correct answers on any mission. It is ignored while you're typing in a box.
6. **Submit** → reward: +220 XP (perfect bonus), level-up to Explorer, *5 Missions* and *7-Day Streak* badges, rank #10 → #9. Click **Continue** and three **achievement pop-ups** slide in: *Rank up*, *Batch rank up* (#39 → #22) and *Career milestone* (Frontend Developer: Developing).
7. **Skill Coach panel** (45s): what was demonstrated, *Frontend Developer readiness +25*, and the recommended next mission with its reason.
8. **College view** (45s): Riteesh jumped **#39 → #22** live. Show readiness distribution, top skill gaps (*Assign* a mission), *Needs intervention* filter, *Export placement report*.
9. **Recruiter view** (45s): hiring for *Java Backend Developer* → *See who passed* on the sponsored banking challenge → open a **Passport** → **Shortlist** → export.
10. **Business Overview** (60s): who pays (colleges ₹30k/yr, employers ₹10k/campaign, students ₹149/mo), all illustrative.
11. **Reset demo** restores the starting state.

**Optional: show the coach on a failure.** Open *Optimize a Slow Database Query* and answer wrongly. The coach names the exact gaps (sargability, date ranges, composite index) and recommends a retry.

All student, college and recruiter data is simulated except the live demo student. NeoBank is a fictional employer. The pricing is illustrative. The Skill Passport is not an accredited certification.
See `CLAUDE.md` for architecture and rules.
