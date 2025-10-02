# ROUND9_STUDY_DESIGN.md
# Comprehensive User Study Protocol for NabokovsWeb Empirical Validation

**Document Version:** 1.0
**Date:** 2025-10-02
**Author:** Warren Zhu
**Study Type:** Mixed-Methods Comparative Evaluation
**Expected Duration:** 8 weeks (2 weeks recruitment + 6 weeks study)

---

## Executive Summary

### Why Empirical Validation Matters

NabokovsWeb represents a novel approach to personal knowledge management (PKM) that integrates:
- **Spatial organization** (visual canvas with card-based artifacts)
- **LLM-powered thought partnership** (Claude API integration for synthesis, critique, expansion)
- **Connection-based knowledge graphs** (explicit relationships between information fragments)
- **Multi-modal capture** (HTML clipping, screenshots, images, generated content)

While Rounds 1-8 established theoretical foundations (information foraging, epistemic agency, sensemaking), competitive positioning (vs. ChatGPT, Notion, Obsidian), and implementation readiness, **empirical validation is critical** to:

1. **Quantify effectiveness** beyond anecdotal evidence
2. **Identify usability barriers** before wider deployment
3. **Validate epistemic agency claims** with behavioral + self-report data
4. **Measure knowledge retention** vs. traditional PKM tools
5. **Establish baseline metrics** for iterative improvement
6. **Support publication claims** with rigorous HCI methodology

### Study Overview

This protocol employs **mixed-methods design** (CHI 2023 standards) combining:
- **Quantitative metrics**: Cognitive load (NASA-TLX), task performance (retrieval time, success rate), knowledge retention (delayed tests), creativity (custom divergent thinking task)
- **Qualitative methods**: Concurrent think-aloud, semi-structured interviews, screen recordings, thematic analysis
- **Comparative baselines**: ChatGPT (conversational AI), Notion (structured notes), Obsidian (graph-based PKM)
- **Custom measures**: Epistemic Agency Scale (7-point Likert), PKM Effectiveness Questionnaire (Wright's 4 domains)

**Participant target**: 24 total (6 per condition: NabokovsWeb, ChatGPT, Notion, Obsidian)
**Study duration**: 2 weeks per participant (Week 1: training + tasks, Week 2: retention test)
**Design choice**: Between-subjects (reduces learning effects across tools, enables clean comparison)

---

## 1. Research Questions

### Primary Research Questions

**RQ1: Cognitive Load & Usability**
Does NabokovsWeb reduce cognitive load compared to baseline PKM tools during complex research tasks?

- **Hypothesis**: NabokovsWeb's spatial canvas + LLM assistance will show lower NASA-TLX scores (mental demand, effort) than text-heavy Notion/Obsidian, but potentially higher than minimalist ChatGPT.
- **Metrics**: NASA-TLX (7 dimensions), task completion time, error rate (failed retrievals)

**RQ2: Epistemic Agency & Tool-Mediated Cognition**
Does NabokovsWeb enhance users' sense of epistemic agency (control over knowledge construction) compared to conversational AI?

- **Hypothesis**: NabokovsWeb's persistent artifacts + explicit connections will score higher on custom Epistemic Agency Scale than ephemeral ChatGPT conversations, comparable to manual Notion/Obsidian.
- **Metrics**: Custom Epistemic Agency Scale (5 items, 7-point Likert), interview themes about control/ownership

**RQ3: Knowledge Retention & Retrieval**
Does spatial + connection-based organization improve long-term retention and retrieval efficiency?

- **Hypothesis**: NabokovsWeb users will outperform baselines on 1-week delayed recall tests and achieve <30-second retrieval times (LAK 2025 standard) for stored information.
- **Metrics**: Delayed recall accuracy (free recall + cued recall), retrieval time (locate specific note), foraging efficiency (steps to target)

**RQ4: Creative Synthesis & Insight Generation**
Does LLM-powered card generation (Expand, Critique, ELI5 buttons) facilitate novel insights compared to manual synthesis?

- **Hypothesis**: NabokovsWeb users will produce more divergent ideas (fluency, originality scores) in synthesis tasks than manual tools, comparable to raw ChatGPT but with better organization.
- **Metrics**: Custom divergent thinking task (TTCT-inspired), qualitative coding of synthesis artifacts (novel connections, counter-arguments)

**RQ5: PKM System Effectiveness (Wright's Model)**
How does NabokovsWeb perform across analytical, informational, social, and learning competencies?

- **Hypothesis**: NabokovsWeb excels in analytical (connection-making) and informational (retrieval) domains, matches baselines in learning, underperforms in social (no collaboration features).
- **Metrics**: PKM Effectiveness Questionnaire (16 items, 4 subscales), workplace-relevant task scenarios

### Secondary Research Questions

**RQ6: Learning Curve & Onboarding**
What is the time-to-proficiency for NabokovsWeb's novel interface (spatial canvas + custom buttons)?

- **Metrics**: Feature adoption rate (% using connections, custom buttons by end of Week 1), self-reported confidence (pre/post training)

**RQ7: Tool Abandonment Risk**
What factors predict continued use vs. abandonment after study completion?

- **Metrics**: Post-study survey (likelihood to continue, barriers to adoption), 1-month follow-up email

---

## 2. Study Design

### Design Choice: Between-Subjects

**Rationale** (based on Search 68, A/B testing 2024):
- **Reduces learning effects**: Participants don't carry strategies from Tool A to Tool B
- **Enables clean comparison**: Each tool tested in isolation, minimizing confounds
- **Practical constraints**: Within-subjects would require 8-week study (2 weeks × 4 tools), increasing dropout risk

**Trade-offs**:
- Requires more participants (24 vs. 6 for within-subjects)
- Higher individual variance (mitigated by randomization + matching on prior PKM experience)

### Participant Recruitment

**Target**: 24 participants (6 per condition)
**Justification**: Typical usability studies use 6-12 participants (Nielsen Norman Group); 6 per group balances statistical power (medium effect size d=0.8, power=0.7 for t-tests) with recruitment feasibility.

**Inclusion Criteria**:
- Graduate students or early-career researchers (PhD students, postdocs, junior faculty)
- Regular engagement with academic literature (≥5 papers/week)
- Prior experience with at least one PKM tool (Notion, Evernote, Obsidian, paper notebooks)
- English proficiency (tasks involve reading/synthesizing English papers)

**Exclusion Criteria**:
- Professional affiliation with NabokovsWeb development team
- Prior use of NabokovsWeb (to avoid familiarity bias)
- Severe visual impairment (spatial canvas requires visual processing)

**Recruitment Channels**:
- University mailing lists (CS, HCI, social sciences departments)
- Reddit communities (r/PhD, r/GradSchool, r/Academia)
- Twitter/X academic communities (#AcademicTwitter, #PhDChat)
- Snowball sampling (participants refer colleagues)

**Compensation**: $50 Amazon gift card (Week 1 completion) + $25 bonus (Week 2 retention test completion)

### Randomization & Matching

**Randomization**: Block randomization (blocks of 4) to ensure equal distribution across conditions as recruitment progresses.

**Matching Variables** (collected in pre-study questionnaire):
- Prior PKM tool experience (none/basic/intermediate/advanced)
- Research domain (STEM vs. humanities/social sciences)
- Self-reported spatial reasoning ability (1-7 scale)

**Balancing**: If significant imbalance detected mid-study, use matched assignment (next recruit assigned to condition matching demographics of underrepresented cell).

### Study Timeline

**Per-Participant Schedule**:

| Phase | Duration | Activities |
|-------|----------|-----------|
| Pre-Study | 30 min | Consent, demographics, pre-test questionnaires (PKM experience, spatial reasoning) |
| Training | 45-60 min | Tool tutorial (video + hands-on practice), Q&A with researcher |
| Session 1 | 90 min | Task 1 (Literature Review), NASA-TLX, think-aloud recording |
| Session 2 | 90 min | Task 2 (Synthesis), NASA-TLX, think-aloud recording |
| Session 3 | 60 min | Task 3 (Retrieval), semi-structured interview, Epistemic Agency Scale, PKM Effectiveness Questionnaire |
| Week 2 Delay | 7 days | No contact (knowledge consolidation period) |
| Retention Test | 30 min | Delayed recall (free + cued), retrieval time measurement |
| Post-Study | 15 min | Exit survey (likelihood to continue, open feedback) |

**Total Per-Participant Time**: ~6.5 hours over 2 weeks

---

## 3. Quantitative Metrics

### 3.1 Cognitive Load: NASA-TLX

**Instrument**: NASA Task Load Index (Hart & Staveland 1988, validated 2024)
**Timing**: Administered after Task 1 and Task 2
**Format**: 7 dimensions, 21-point scale (0-100 in increments of 5)

**Dimensions**:
1. **Mental Demand**: How mentally demanding was the task?
2. **Physical Demand**: How physically demanding was the task?
3. **Temporal Demand**: How hurried or rushed was the pace of the task?
4. **Performance**: How successful were you in accomplishing what you were asked to do?
5. **Effort**: How hard did you have to work to accomplish your level of performance?
6. **Frustration**: How insecure, discouraged, irritated, stressed, and annoyed were you?

**Additional Single-Item Measures** (Search 66, cognitive load 2024):
- **Invested Mental Effort**: "How much mental effort did you invest in this task?" (1-9 scale)
- **Perceived Task Difficulty**: "How difficult was this task?" (1-9 scale)

**Analysis**:
- **Primary dependent variable**: Overall weighted TLX score (average of 6 dimensions after pairwise comparisons)
- **Secondary analyses**: Dimension-specific comparisons (hypothesis: NabokovsWeb reduces Mental Demand + Effort, comparable Frustration)
- **Statistical test**: One-way ANOVA (4 conditions), post-hoc Tukey HSD for pairwise comparisons
- **Effect size**: Partial eta-squared (ηp²), Cohen's d for pairwise contrasts

### 3.2 Task Performance Metrics

**3.2.1 Task Completion Time**
**Measurement**: Screen recording timestamps (task start → task end)
**Tasks**:
- Task 1 (Literature Review): Time to capture + organize 8 papers on assigned topic
- Task 2 (Synthesis): Time to produce 500-word synthesis document from captured materials

**Analysis**:
- **Dependent variable**: Log-transformed time (addresses right-skew common in timing data)
- **Statistical test**: One-way ANOVA, Kruskal-Wallis if normality violated
- **Expected pattern**: NabokovsWeb = ChatGPT < Notion < Obsidian (hypothesis: AI assistance speeds up tasks)

**3.2.2 Retrieval Success Rate**
**Measurement**: Proportion of successful retrievals in Task 3 (Retrieval Challenges)
**Task 3 Protocol**:
1. Researcher poses 10 questions about materials captured in Tasks 1-2 (e.g., "What was the sample size in the Smith et al. study?")
2. Participant has 30 seconds per question to locate answer using their tool
3. Success = correct answer within time limit

**Dependent Variable**: % questions answered correctly (0-100%)
**Baseline Target**: ≥70% success (based on LAK 2025 retrieval standards)
**Analysis**: One-way ANOVA, post-hoc contrasts

**3.2.3 Foraging Efficiency**
**Measurement**: Number of "steps" to locate target information (Search 66, Effort Foraging Task)
**Operationalization**:
- **NabokovsWeb**: # card clicks + search queries
- **ChatGPT**: # scroll actions + Cmd+F searches in conversation
- **Notion**: # page navigations + search queries
- **Obsidian**: # note opens + graph interactions

**Dependent Variable**: Average steps per successful retrieval
**Analysis**: One-way ANOVA, lower = more efficient

### 3.3 Knowledge Retention (Delayed Tests)

**Timing**: 1 week after Session 3 (7-day delay for consolidation, per Search 71 spaced retrieval standards)

**3.3.1 Free Recall Test**
**Instruction**: "List as many key findings, concepts, or arguments from your research session as you can remember. You have 10 minutes."
**Scoring**:
- **Idea Units**: Count of distinct propositions mentioned (scored by 2 independent raters, Cohen's kappa ≥0.8 for inter-rater reliability)
- **Accuracy**: % idea units correctly recalled (vs. ground truth from original papers)

**3.3.2 Cued Recall Test**
**Instruction**: 20 multiple-choice questions about materials from Tasks 1-2
**Question Types**:
- Factual (e.g., "What year was the study conducted?")
- Conceptual (e.g., "Which theory did the authors critique?")
- Relational (e.g., "Which two papers had contradictory findings?")

**Scoring**: % correct (0-100%)
**Analysis**:
- One-way ANOVA comparing conditions
- Repeated-measures contrast (immediate Session 3 retrieval vs. delayed recall) to measure forgetting rate

**Expected Pattern**: NabokovsWeb ≥ Obsidian > Notion > ChatGPT (hypothesis: persistent spatial representations + connections enhance encoding)

### 3.4 Creativity: Custom Divergent Thinking Task

**Rationale**: TTCT (Torrance Tests) too narrow on divergent thinking alone (Search 70, 2024 critique). Custom task balances divergence + convergence + domain relevance.

**Task**: "Synthesis Challenge"
**Instruction**: "Using the materials you've gathered, generate as many **research questions** as you can that bridge 2+ papers in novel ways. You have 15 minutes."

**Scoring** (adapted from TTCT):
1. **Fluency**: Total # questions generated
2. **Originality**: # questions rated "novel" by 2 domain expert raters (5-point scale, ≥4 = novel)
3. **Elaboration**: Average word count per question (proxy for specificity)
4. **Flexibility**: # distinct conceptual categories (coded by researchers)

**Additional Convergent Measure**: "Select your TOP 3 questions and justify why they're most promising (50 words each)."
**Scoring**: Rated by experts on feasibility + impact (1-5 scale)

**Analysis**:
- One-way ANOVA for each TTCT dimension
- Qualitative coding of justifications (themes: methodological innovation, theoretical integration, practical relevance)

**Expected Pattern**: NabokovsWeb = ChatGPT > Notion = Obsidian for fluency/originality; NabokovsWeb > all for elaboration (persistent canvas supports refinement)

---

## 4. Qualitative Methods

### 4.1 Concurrent Think-Aloud Protocol

**Rationale**: Insight into real-time cognitive processes, decision-making, tool affordances (Search 67, think-aloud 2024 standards)

**Protocol**:
- **Type**: Concurrent (during Tasks 1-2)
- **Instruction**: "Please verbalize your thoughts as you work. Say whatever comes to mind—your strategies, frustrations, 'aha' moments. Don't worry about sounding polished."
- **Researcher Role**: Minimal intervention; only prompt if >30 seconds silence ("What are you thinking right now?")
- **Recording**: Screen capture (tool interactions) + audio (verbalizations)

**Analysis**:
1. **Verbatim Transcription**: Automated (Otter.ai) + manual correction
2. **Segmentation**: Divide into "episodes" (coherent activity bursts, e.g., "searching for paper," "creating new card")
3. **Coding Scheme** (developed iteratively):
   - **Sensemaking Moves**: Comparing, connecting, categorizing, questioning, synthesizing (Pirolli & Card 2005)
   - **Tool Affordance Use**: Spatial arrangement (NabokovsWeb), tagging (Notion/Obsidian), prompting (ChatGPT/NabokovsWeb)
   - **Metacognitive Statements**: Planning, monitoring, evaluating progress
   - **Frustration Indicators**: Expressions of confusion, error recovery attempts, abandonment of strategies
4. **Thematic Analysis**: Pattern identification across participants within same condition, then cross-condition comparison (Braun & Clarke 2006)

**Inter-Rater Reliability**: 20% of transcripts dual-coded by 2 researchers, Cohen's kappa ≥0.75 required

**Expected Themes** (hypotheses):
- **NabokovsWeb**: Spatial metaphors ("grouping related ideas"), AI collaboration ("asking it to expand"), connection-making
- **ChatGPT**: Conversational flow ("just talking through ideas"), re-prompting frustration ("it forgot what I said earlier")
- **Notion**: Structural planning ("setting up database fields first"), manual organization burden
- **Obsidian**: Graph navigation ("following backlinks"), markdown friction ("formatting syntax")

### 4.2 Semi-Structured Interviews

**Timing**: End of Session 3 (after all tasks completed)
**Duration**: 30-45 minutes
**Format**: Video call (Zoom) with screen sharing for retrospective walkthroughs

**Interview Guide** (12 core questions + follow-ups):

**Section 1: Overall Experience**
1. "Walk me through your overall experience using [Tool]. What stood out?"
2. "If you had to describe [Tool] to a colleague in one sentence, what would you say?"

**Section 2: Epistemic Agency (RQ2)**
3. "To what extent did you feel in control of your knowledge-building process? Can you give an example?"
4. "Did the tool feel like a **partner** or a **repository**? Why?"
5. "When you look at your work in [Tool], does it feel like **yours**? What makes it feel that way (or not)?"

**Section 3: Tool Affordances & Strategies**
6. "What features did you use most? Least? Why?"
7. "Did you develop any 'tricks' or strategies for working more efficiently?"
8. "What was most frustrating? Most delightful?"

**Section 4: Comparison to Prior Tools** (if applicable)
9. "You mentioned using [Prior Tool] before. How does [Study Tool] compare?"
10. "Would you switch from your current system to [Study Tool]? Why or why not?"

**Section 5: Retention & Retrieval (RQ3)**
11. "How confident are you that you could find specific information from today's session **a week from now**? What makes you confident/uncertain?"
12. "If you needed to write a paper using this material in a month, how would you re-engage with [Tool]?"

**Analysis**:
- **Verbatim Transcription**: Automated + manual correction
- **Thematic Coding**:
  - **Deductive codes**: Aligned to RQs (epistemic agency, cognitive load, retention confidence)
  - **Inductive codes**: Emergent themes from data (e.g., unexpected use cases, tool-specific pain points)
- **Software**: NVivo or Atlas.ti for code management
- **Inter-Rater Reliability**: 20% dual-coded, Cohen's kappa ≥0.75

**Expected Themes**:
- **Epistemic Agency**: NabokovsWeb users report "co-creation" with LLM, Notion users report "control" via manual structure, ChatGPT users report "delegation" but loss of ownership
- **Retrieval Confidence**: Spatial/visual tools (NabokovsWeb, Notion) inspire more confidence than linear (ChatGPT, Obsidian backlinks)

### 4.3 Screen Recordings

**Purpose**: Complement think-aloud with objective behavioral data

**Analysis**:
- **Interaction Logs**: Automated parsing (where possible) of tool-specific actions:
  - NabokovsWeb: Card creations, button clicks (Expand, Critique, etc.), connection draws, canvas zooms
  - ChatGPT: Message sends, scroll actions, copy-paste events
  - Notion: Block creations, property edits, page navigations
  - Obsidian: Note creations, link insertions, graph opens
- **Timestamped Events**: Align with think-aloud transcripts to triangulate verbal + behavioral data
- **Visualization**: Create "interaction timelines" showing activity density, tool feature adoption curves

---

## 5. Custom Epistemic Agency Measure

**Rationale**: Search 69 revealed no existing "EASS" (Epistemic Agency Self-Scale). Existing scales (ETMCQ, QET, EVS) measure trust/vice, not **agency**. Must create custom measure.

### Theoretical Foundation

**Epistemic Agency** = Sense of control, authorship, and intentionality in knowledge construction (Nieminen & Ketonen 2024, conceptual work)

**Dimensions** (based on literature synthesis):
1. **Control**: "I direct the knowledge-building process" (vs. tool dictates structure)
2. **Authorship**: "The output reflects my thinking" (vs. externalized to AI/templates)
3. **Transparency**: "I understand how knowledge is organized/retrieved" (vs. black-box)
4. **Ownership**: "This knowledge base is mine" (emotional investment)
5. **Flexibility**: "I can adapt the system to my needs" (vs. rigid constraints)

### 7-Point Epistemic Agency Scale (EASS-5)

**Instructions**: "Please rate your agreement with the following statements about your experience using [Tool] for research tasks."

**Scale**: 1 (Strongly Disagree) - 7 (Strongly Agree)

**Items**:

1. **[Control]** "I felt in control of how information was organized and connected."
2. **[Authorship]** "The knowledge artifacts I created reflect my own thinking and interpretations."
3. **[Transparency]** "I understand how and why information is stored and retrieved in this system."
4. **[Ownership]** "I feel a sense of ownership over the knowledge base I built."
5. **[Flexibility]** "The tool allowed me to adapt my workflow to match my thinking process."

**Reverse-Coded Item** (to detect inattentive responding):
6. **[Passivity-R]** "The tool made decisions about organizing my knowledge without my input." [Reverse-scored]

**Optional 7th Item** (exploratory, for future validation):
7. **[Partnership]** "The tool felt like a collaborative partner in my knowledge-building process."

### Psychometric Properties (To Be Validated)

**Internal Consistency**: Cronbach's alpha (target ≥0.75)
**Construct Validity**:
- **Discriminant**: Should correlate weakly with NASA-TLX (cognitive load ≠ agency)
- **Convergent**: Should correlate moderately with interview themes of control/ownership (r ≥0.4)
- **Known-Groups**: ChatGPT should score lower than manual tools (NabokovsWeb, Notion, Obsidian) on Authorship/Ownership

**Analysis**:
- One-way ANOVA comparing mean EASS scores across conditions
- Exploratory Factor Analysis (if N=24 too small, plan for future larger validation study)

---

## 6. PKM Effectiveness Metrics (Wright's Model)

**Rationale**: Search 72 identified Wright's 4-domain model as comprehensive framework for PKM evaluation.

### Wright's 4 Domains (Adapted for Study)

**1. Analytical Competency**: Ability to analyze, synthesize, and make sense of information
**2. Information Competency**: Organizing, retrieving, and managing information efficiently
**3. Social Competency**: Sharing knowledge and collaborating (LIMITED in solo study context)
**4. Learning Competency**: Applying knowledge to improve performance over time

### PKM Effectiveness Questionnaire (16 Items, 7-Point Likert)

**Instructions**: "Reflect on your experience using [Tool] for the research tasks. Rate your agreement with the following statements."

**Scale**: 1 (Strongly Disagree) - 7 (Strongly Agree)

#### Domain 1: Analytical Competency (4 items)
1. "The tool helped me identify **connections** between different pieces of information."
2. "I could easily **compare and contrast** ideas from multiple sources."
3. "The tool supported me in **synthesizing** information into new insights."
4. "I felt able to **critically evaluate** the information I gathered."

#### Domain 2: Information Competency (4 items)
5. "I could **organize** information in a way that made sense to me."
6. "**Retrieving** specific information was fast and reliable."
7. "The tool minimized the **cognitive effort** of managing large amounts of information."
8. "I trusted that information would be **accessible** when I needed it later."

#### Domain 3: Social Competency (3 items, exploratory)
9. "I could imagine **sharing** my work with collaborators using this tool."
10. "The tool would make it easy to **explain my thinking** to others."
11. "Outputs from this tool are in a **format suitable for collaboration**."

#### Domain 4: Learning Competency (4 items)
12. "Using this tool **improved my understanding** of the research topic."
13. "I learned to use the tool **more efficiently** as tasks progressed."
14. "The tool helped me **identify gaps** in my knowledge."
15. "I can see how this tool would help me **apply knowledge** to future projects."

**Validation Item** (attention check):
16. "I completed all three research tasks." [Should be universally "Agree"]

### Additional Quantitative PKM Metrics

**Retrieval Time Goal** (LAK 2025 standard): <30 seconds to locate any stored note
**Measurement**: Task 3 retrieval challenges (10 questions, 30-second limit per question)
**Success Threshold**: ≥70% questions answered within time limit

**Feature Adoption Rate** (NabokovsWeb-specific):
- % participants who used custom buttons (Expand, Critique, ELI5) ≥1 time
- % participants who created ≥1 connection (arrow) between cards
- % participants who used search/filter features

**Analysis**:
- One-way MANOVA (4 conditions × 4 domains)
- Follow-up ANOVAs for each domain
- Post-hoc contrasts (Tukey HSD)

**Expected Pattern**:
- **Analytical**: NabokovsWeb > Obsidian ≥ Notion > ChatGPT (spatial + connections support synthesis)
- **Informational**: NabokovsWeb = Obsidian > Notion > ChatGPT (retrieval optimized)
- **Social**: Notion > NabokovsWeb = Obsidian > ChatGPT (Notion has sharing features)
- **Learning**: NabokovsWeb ≥ all (LLM assistance + retrieval practice)

---

## 7. Task Scenarios

### Task 1: Literature Review Capture (90 minutes)

**Objective**: Capture and organize 8 academic papers on an assigned topic

**Assigned Topics** (counterbalanced across participants):
1. "Cognitive effects of multitasking in digital environments"
2. "Ethical considerations in AI-assisted decision-making"
3. "Effectiveness of spaced repetition for long-term learning"
4. "Creativity assessment methods in educational research"

**Provided Materials**:
- 8 pre-selected papers (PDFs + URLs to HTML versions)
- Papers selected to have mix of: 2 surveys/reviews, 4 empirical studies, 2 theoretical/opinion pieces
- Controlled for length (5,000-8,000 words each)

**Instructions**:
"Your goal is to capture key information from these 8 papers using [Tool]. Focus on:
- Main findings and arguments
- Methodologies used
- Contradictions or debates between papers
- Any connections you notice

Organize the information in a way that would help you write a literature review later. You have 90 minutes."

**Tool-Specific Setup**:
- **NabokovsWeb**: Pre-loaded with 8 cards containing paper titles + URLs (participants add content via clipping or manual notes)
- **ChatGPT**: Blank conversation; participants can paste excerpts or upload PDFs (if available via API)
- **Notion**: Template page with database template (Title, Authors, Year, Key Findings columns)
- **Obsidian**: Vault with 8 empty notes titled with paper names

**Measured Outcomes**:
- Time to complete (self-reported "I'm done")
- NASA-TLX (administered immediately after)
- Think-aloud transcript
- Artifact quality (# key findings captured, rated by 2 researchers on 1-5 scale)

---

### Task 2: Synthesis & Insight Generation (90 minutes)

**Objective**: Produce a 500-word synthesis document integrating materials from Task 1

**Instructions**:
"Using the materials you organized in Task 1, write a **500-word synthesis** that:
1. Identifies 2-3 major themes across the papers
2. Highlights key disagreements or contradictions
3. Proposes 1-2 research questions that emerge from gaps in the literature

You may continue adding to your [Tool] workspace as needed (e.g., creating new notes, generating summaries). Submit your final 500-word document as a Google Doc link."

**Allowed Actions**:
- **NabokovsWeb**: Use custom buttons (Expand, Critique, Summarize), create new cards, draw connections
- **ChatGPT**: Continue conversation, ask for summaries/outlines
- **Notion**: Create new pages, use AI assistant (if available)
- **Obsidian**: Create new notes, use graph view, insert links

**Measured Outcomes**:
- Time to complete
- NASA-TLX (administered immediately after)
- Think-aloud transcript
- Synthesis document quality:
  - **Theme Coherence**: 2 raters score clarity of themes (1-5)
  - **Critical Integration**: # contradictions/debates mentioned
  - **Research Question Quality**: 2 domain experts rate novelty + feasibility (1-5)
- Divergent thinking task (administered after synthesis)

---

### Task 3: Retrieval Challenges (60 minutes)

**Objective**: Assess retrieval speed and accuracy for previously captured information

**Protocol**:
1. **5-minute break** after Task 2 (memory consolidation)
2. Researcher poses **10 questions** about Task 1 materials (e.g., "What was the sample size in the Chen et al. study?", "Which paper critiqued dual-process theory?")
3. Participant has **30 seconds per question** to locate answer using [Tool]
4. Success = correct answer within time limit

**Question Types** (counterbalanced):
- 4 **Factual** (specific data points: dates, sample sizes, author names)
- 3 **Conceptual** (theories mentioned, definitions)
- 3 **Relational** (which papers agree/disagree, methodological comparisons)

**Measured Outcomes**:
- Retrieval success rate (% correct within 30 seconds)
- Average retrieval time (for successful retrievals)
- Foraging efficiency (# steps: clicks, searches, scrolls)
- Post-retrieval confidence rating ("How confident are you in your answer?" 1-7 scale)

**Interview** (administered after retrieval):
- Semi-structured interview (Section 4.2 protocol)
- Epistemic Agency Scale (EASS-5)
- PKM Effectiveness Questionnaire (16 items)

---

### Retention Test (Week 2): Delayed Recall

**Timing**: 7 days after Session 3 (no contact with tool during delay)

**Protocol**:
1. **Free Recall** (10 minutes): "List as many key findings, concepts, or arguments from your research session as you can remember."
2. **Cued Recall** (15 minutes): 20 multiple-choice questions about Task 1 materials
3. **Retrieval Re-Test** (5 minutes): 3 questions from Task 3 repeated (assess forgetting curve)

**Measured Outcomes**:
- Free recall: # idea units, accuracy
- Cued recall: % correct
- Retrieval time (repeated questions): compare to Week 1 baseline

---

## 8. Comparison Baselines

### Baseline Tool Selection Rationale

**ChatGPT** (Conversational AI)
- **Why**: Dominant LLM interface, represents "ephemeral" knowledge management
- **Version**: ChatGPT Plus (GPT-4 access)
- **Setup**: Blank conversation, participants can upload PDFs if needed
- **Expected Strengths**: Speed, synthesis assistance, natural language interaction
- **Expected Weaknesses**: Poor retrieval, no persistence, context window limits

**Notion** (Structured Notes)
- **Why**: Popular PKM tool with AI features, database-centric
- **Version**: Free tier (sufficient for study)
- **Setup**: Template workspace with database for papers (Title, Authors, Year, Key Findings)
- **Expected Strengths**: Structured organization, collaboration features, AI assistance
- **Expected Weaknesses**: Manual effort, rigid templates, slow search in large workspaces

**Obsidian** (Graph-Based PKM)
- **Why**: Represents "second brain" movement, Zettelkasten-inspired
- **Version**: Desktop app (free)
- **Setup**: Vault with 8 starter notes (paper titles)
- **Expected Strengths**: Backlinks, graph view, markdown flexibility, local-first
- **Expected Weaknesses**: Markdown friction, manual linking, learning curve for graph navigation

### Controlling for Confounds

**Training Standardization**:
- All participants receive **45-minute tutorial** for assigned tool
- Tutorial includes:
  1. Video walkthrough (10 min, tool-specific)
  2. Hands-on practice task (20 min): Organize 3 sample papers (not used in study)
  3. Q&A with researcher (15 min)
- Training materials reviewed by tool experts (e.g., Notion-proficient user reviews Notion training script)

**Task Materials Counterbalancing**:
- 4 topic sets (A, B, C, D) rotated across participants
- Each tool receives equal distribution of topics (e.g., 2 NabokovsWeb participants get Topic A, 2 get Topic B, etc.)

**Researcher Blinding** (partial):
- Quantitative metrics (NASA-TLX, retrieval time) are objective, no blinding needed
- Qualitative coding: 20% dual-coded by researcher blind to study hypotheses

---

## 9. Expected Outcomes & Hypotheses

### Primary Hypotheses (Aligned to RQs)

**H1: Cognitive Load** (RQ1)
NabokovsWeb will show **lower NASA-TLX Mental Demand and Effort** scores than Notion/Obsidian (due to AI assistance + spatial offloading), but **comparable Frustration** to ChatGPT (both have LLM learning curves).

**H2: Epistemic Agency** (RQ2)
NabokovsWeb will score **higher on EASS-5** than ChatGPT (persistent artifacts vs. ephemeral conversation), **comparable to Notion/Obsidian** (all support manual control).

**H3: Knowledge Retention** (RQ3)
NabokovsWeb will show **higher delayed recall accuracy** (free + cued) than ChatGPT, **comparable to Notion/Obsidian** (spatial encoding benefits documented in literature).

**H4: Retrieval Efficiency** (RQ3)
NabokovsWeb will achieve **≥70% retrieval success within 30 seconds**, outperforming ChatGPT (poor retrieval) and Notion (slow search), comparable to Obsidian (backlink navigation).

**H5: Creative Synthesis** (RQ4)
NabokovsWeb will produce **higher fluency and originality scores** on divergent thinking task than Notion/Obsidian (LLM augmentation), **comparable to raw ChatGPT** but with better organization (persistent canvas).

**H6: PKM Effectiveness** (RQ5)
- **Analytical**: NabokovsWeb > Obsidian ≥ Notion > ChatGPT
- **Informational**: NabokovsWeb = Obsidian > Notion > ChatGPT
- **Social**: Notion > all (has collaboration features)
- **Learning**: NabokovsWeb ≥ all (LLM + retrieval practice)

### Secondary Hypotheses

**H7: Learning Curve** (RQ6)
NabokovsWeb will show **slower initial task completion** (Session 1) than ChatGPT (familiar conversational interface), but **comparable speed by Session 3** (feature adoption plateau).

**H8: Tool Abandonment** (RQ7)
**Barriers to NabokovsWeb adoption** will include: Chrome extension friction (installation, permissions), lack of mobile support, API key setup effort.
**Facilitators**: Spatial organization, LLM integration, visual appeal.

**Null Hypotheses** (important to test):
- **H0a**: No difference in retention between tools (challenges spatial encoding hypothesis)
- **H0b**: No difference in epistemic agency between ChatGPT and NabokovsWeb (challenges persistent artifact claim)

---

## 10. Data Collection & Analysis Timeline

### Study Phases

| Phase | Duration | Activities | Deliverables |
|-------|----------|-----------|--------------|
| **Phase 0: Preparation** | 2 weeks | IRB submission, recruitment materials, training videos, task material finalization | IRB approval, recruitment posts, tutorial scripts |
| **Phase 1: Pilot** | 1 week | 4 pilot participants (1 per condition) to test protocol | Revised protocol, timing adjustments |
| **Phase 2: Recruitment** | 2 weeks | Active recruitment via mailing lists, Reddit, Twitter, snowball | 24 participants enrolled |
| **Phase 3: Data Collection** | 6 weeks | Sessions 1-3 (Week 1), Retention Test (Week 2) for all participants | Screen recordings, transcripts, questionnaire data, retention scores |
| **Phase 4: Analysis** | 4 weeks | Transcription, coding, statistical analysis, report writing | Tables, figures, thematic summaries |
| **Phase 5: Follow-Up** | 1 week | 1-month post-study survey (tool adoption) | Longitudinal adoption data |

**Total Timeline**: 16 weeks (4 months)

### Data Storage & Management

**Secure Storage**:
- **Identifiable data** (consent forms, contact info): Password-protected Harvard Google Drive folder (access: PI + 2 approved researchers)
- **De-identified data** (transcripts, questionnaires): Separate folder with participant IDs (P001-P024)
- **Screen recordings**: Harvard Secure File Transfer (deleted after transcription + key clip extraction)

**Data Retention**: 3 years post-publication (Harvard IRB standard)

**Backup**: Weekly encrypted backups to Harvard Research Computing cluster

---

## 11. Statistical Analysis Plan

### Quantitative Analysis

**Primary Statistical Tests**:

1. **NASA-TLX (RQ1)**:
   - One-way ANOVA (4 conditions × TLX overall score)
   - Post-hoc: Tukey HSD for pairwise comparisons
   - Effect size: Partial eta-squared (ηp²)
   - Assumption checks: Shapiro-Wilk (normality), Levene's (homogeneity of variance)
   - If violated: Kruskal-Wallis + Dunn's post-hoc

2. **Epistemic Agency Scale (RQ2)**:
   - One-way ANOVA (4 conditions × EASS-5 mean score)
   - Internal consistency: Cronbach's alpha (target ≥0.75)
   - Exploratory: Item-level ANOVAs to identify which dimensions differ

3. **Retention & Retrieval (RQ3)**:
   - **Delayed recall**: One-way ANOVA (4 conditions × % idea units recalled)
   - **Retrieval success**: One-way ANOVA (4 conditions × % correct within 30s)
   - **Forgetting curve**: Repeated-measures ANOVA (Time: Week 1 vs Week 2 × Condition)

4. **Creativity (RQ4)**:
   - MANOVA (4 conditions × 4 TTCT dimensions: fluency, originality, elaboration, flexibility)
   - Follow-up ANOVAs for each dimension

5. **PKM Effectiveness (RQ5)**:
   - MANOVA (4 conditions × 4 Wright domains)
   - Follow-up ANOVAs for each domain

**Power Analysis**:
- **Desired power**: 0.80
- **Alpha**: 0.05
- **Effect size**: Medium (d=0.8 for t-tests, ηp²=0.14 for ANOVA)
- **N per group**: 6 (total N=24)
- **Actual power**: ~0.70 for medium effects (acceptable for pilot/feasibility study)

**Software**: R (version 4.3+) with packages: `{car}`, `{afex}`, `{emmeans}`, `{psych}`

### Qualitative Analysis

**Thematic Coding Protocol**:

1. **Transcription**: Automated (Otter.ai) + manual correction (target accuracy ≥95%)
2. **Initial Coding**: 2 researchers independently code 20% of data (think-aloud + interviews)
   - **Deductive codes**: Theory-driven (epistemic agency, sensemaking moves, tool affordances)
   - **Inductive codes**: Data-driven (emergent themes)
3. **Codebook Development**: Iterative refinement until Cohen's kappa ≥0.75
4. **Full Coding**: Divide remaining data between 2 coders
5. **Thematic Analysis**: Identify patterns, generate thematic maps (Braun & Clarke 2006)
6. **Member Checking**: Share preliminary themes with 3-5 participants for validation

**Software**: NVivo 14 or Atlas.ti 24

**Triangulation**: Cross-validate themes with quantitative patterns (e.g., high EASS scores + interview themes of "control")

---

## 12. IRB Considerations

### Ethical Safeguards

**Informed Consent**:
- **Procedure**: Digital consent form (Qualtrics) before any data collection
- **Key elements**: Purpose, procedures, risks, benefits, voluntary participation, right to withdraw, data handling
- **Comprehension check**: 3 true/false questions (e.g., "I can withdraw at any time without penalty")

**Risks**:
- **Minimal risk study** (comparable to everyday computer use)
- **Potential risks**: Eye strain (mitigated by scheduled breaks), frustration with unfamiliar tools (mitigated by training + researcher support)
- **Confidentiality breach**: Mitigated by de-identification, secure storage, limited access

**Benefits**:
- **Direct**: $75 compensation, exposure to new PKM tools, potential productivity gains
- **Indirect**: Contribution to HCI research, potential to shape future tools

**Vulnerable Populations**: None (graduate students not considered vulnerable unless PI is their advisor—screened during recruitment)

### Data Privacy

**Personal Identifiable Information (PII)**:
- **Collected**: Name, email (for scheduling + compensation), video/audio recordings
- **Storage**: Encrypted Harvard Google Drive (access-controlled)
- **Retention**: Consent forms (3 years), contact info (deleted after study completion)

**De-Identification**:
- **Participant IDs**: P001-P024 (randomly assigned)
- **Transcripts**: Remove names, institution names, specific research topics (replace with [REDACTED])
- **Screen recordings**: Blur browser tabs with personal info (email, calendar)

**API Key Handling** (NabokovsWeb-specific):
- Participants use **researcher-provided API key** (not their own)
- API key rotated after study completion
- No personal data sent to Anthropic (only task-related content)

### Consent Form Key Sections

**Section 1: Purpose**
"This study investigates how different knowledge management tools support research tasks. You will use one of four tools (NabokovsWeb, ChatGPT, Notion, or Obsidian) to organize academic papers and produce a synthesis document."

**Section 2: Procedures**
"You will complete 3 sessions over 2 weeks (total ~6.5 hours). Sessions include training, research tasks, questionnaires, and an interview. We will record your screen and audio during tasks."

**Section 3: Risks**
"Risks are minimal. You may experience eye strain or frustration with unfamiliar software. You may take breaks at any time."

**Section 4: Benefits**
"You will receive $75 compensation. You may find the tool useful for your own research. Your participation will contribute to HCI research on knowledge management."

**Section 5: Confidentiality**
"Your data will be de-identified (assigned a participant ID). Only the research team will have access to identifiable data. Results may be published, but you will not be identifiable."

**Section 6: Voluntary Participation**
"Participation is voluntary. You may withdraw at any time without penalty. If you withdraw before Session 3, you will receive prorated compensation ($25 for Session 1, $50 for Sessions 1-2)."

**Section 7: Contact Information**
"For questions, contact Warren Zhu (wzhu@college.harvard.edu). For concerns about your rights as a participant, contact Harvard IRB (cuhs@harvard.edu)."

---

## 13. Limitations & Mitigation Strategies

### Study Limitations

**L1: Small Sample Size (N=24)**
- **Impact**: Limited statistical power (0.70 for medium effects), generalizability concerns
- **Mitigation**:
  - Frame as **pilot/feasibility study** (standard for novel tools)
  - Focus on **effect size reporting** over p-values
  - Plan **larger validation study** if promising results (N=60, power=0.95)

**L2: Between-Subjects Design Variance**
- **Impact**: Individual differences in PKM skill, spatial reasoning may confound results
- **Mitigation**:
  - Collect **matching variables** (prior PKM experience, spatial reasoning) and use as covariates in ANCOVA
  - Randomization with block design to balance groups

**L3: Short Study Duration (2 weeks)**
- **Impact**: May not capture long-term adoption, learning plateau effects
- **Mitigation**:
  - **1-month follow-up survey** (RQ7: abandonment)
  - Frame findings as **initial usability + short-term retention** (not longitudinal)
  - Plan **diary study** for long-term use patterns (future work)

**L4: Artificial Task Context**
- **Impact**: Assigned papers ≠ self-directed research, may reduce ecological validity
- **Mitigation**:
  - Use **realistic task scenarios** (literature review, synthesis—common in academia)
  - Recruit **domain-relevant participants** (researchers who do these tasks regularly)
  - **Interview questions** probe applicability to real workflows

**L5: Lack of Collaboration Testing**
- **Impact**: Wright's "Social Competency" domain limited in solo study
- **Mitigation**:
  - Include **hypothetical collaboration questions** in PKM Effectiveness Questionnaire
  - Plan **dyad study** for future work (pairs collaborating on shared canvas)

**L6: Tool Version Staleness**
- **Impact**: ChatGPT, Notion update frequently; results may not generalize to future versions
- **Mitigation**:
  - **Document exact versions** in methods (e.g., "ChatGPT Plus, GPT-4-turbo, December 2024 version")
  - Focus on **conceptual affordances** (spatial vs. conversational) over specific features

**L7: Researcher Bias**
- **Impact**: PI developed NabokovsWeb, may unconsciously favor it in coding/interpretation
- **Mitigation**:
  - **Pre-register hypotheses** (Open Science Framework)
  - **Dual coding** (20% by researcher blind to hypotheses)
  - **Transparent reporting** of null results, contradictory findings

### Validity Threats

**Internal Validity**:
- **Selection bias**: Mitigated by randomization + matching
- **History effects**: All participants complete study within same 8-week window (controls for external events)
- **Maturation**: 2-week duration too short for significant skill development beyond tool learning curve
- **Testing effects**: Retention test uses **different questions** than Session 3 retrieval (no item-specific practice)

**External Validity**:
- **Population**: Graduate students ≠ all knowledge workers (future studies: professionals, undergrads, lifelong learners)
- **Task**: Academic literature review ≠ all PKM use cases (future: project management, creative writing, journaling)
- **Setting**: Lab-controlled ≠ naturalistic use (future: diary study, in-the-wild deployment)

**Construct Validity**:
- **Epistemic agency**: New scale requires validation (future: larger psychometric study)
- **Creativity**: Single task may not capture full creativity construct (TTCT criticism from Search 70)

---

## 14. Dissemination Plan

### Target Venues

**Primary**: CHI 2026 (ACM Conference on Human Factors in Computing Systems)
**Format**: Full paper (10 pages + references)
**Submission Deadline**: ~September 2025
**Rationale**: Premier HCI venue, aligns with PKM/sensemaking/LLM-augmented tools

**Secondary**: UIST 2026 (User Interface Software and Technology)
**Format**: Full paper (10 pages)
**Rationale**: Novel interface (spatial canvas + LLM integration)

**Tertiary**: CSCW 2026 (Computer-Supported Cooperative Work)
**Format**: Full paper (if dyad collaboration study added)

### Publication Timeline

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| Study completion | Week 16 | All data collected |
| Analysis complete | Week 20 | Tables, figures, thematic summaries |
| First draft | Week 24 | Complete manuscript (Introduction, Methods, Results, Discussion) |
| Internal review | Week 26 | Feedback from advisors |
| Revision | Week 28 | Incorporate feedback |
| Submission | Week 30 (Sept 2025) | CHI 2026 submission |

### Open Science Practices

**Pre-Registration**: Open Science Framework (https://osf.io)
**Data Sharing**: De-identified dataset (questionnaires, task performance) on OSF (after publication)
**Materials Sharing**: Interview guides, training scripts, task materials, coding schemes on OSF
**Code Sharing**: Analysis scripts (R, NVivo coding scheme) on GitHub
**Preprint**: arXiv (after submission, before peer review)

---

## 15. Budget Estimate

| Item | Unit Cost | Quantity | Total |
|------|-----------|----------|-------|
| **Participant Compensation** | | | |
| Base compensation ($50 × 24) | $50 | 24 | $1,200 |
| Retention bonus ($25 × 24) | $25 | 24 | $600 |
| Pilot participants | $75 | 4 | $300 |
| **Software & Services** | | | |
| Anthropic API credits (NabokovsWeb) | $100 | 1 | $100 |
| ChatGPT Plus subscriptions (1 month) | $20 | 6 | $120 |
| Notion Team plan (optional) | $10 | 6 | $60 |
| Transcription (Otter.ai Business) | $20 | 3 months | $60 |
| NVivo license (academic) | $0 | 1 | $0 (institutional) |
| **Researcher Time** | | | |
| PI (grad student, 20 hrs/week × 16 weeks) | $25/hr | 320 hrs | $8,000 |
| Research assistant (coding, 10 hrs/week × 8 weeks) | $20/hr | 80 hrs | $1,600 |
| **Miscellaneous** | | | |
| Recruitment ads (Reddit, Twitter) | $50 | 1 | $50 |
| IRB submission fee | $0 | 1 | $0 (waived for students) |
| **TOTAL** | | | **$12,090** |

**Funding Sources**:
- Research grant (NSF, NSERC, institutional funding)
- PI stipend (graduate fellowship)
- Conference travel grants (for dissemination)

---

## 16. Contingency Plans

### Recruitment Challenges

**Risk**: Insufficient participants (< 24 enrolled)
**Plan**:
- Extend recruitment by 2 weeks
- Increase compensation to $100 ($75 base + $25 bonus)
- Broaden inclusion criteria (include master's students, advanced undergrads)

**Risk**: High dropout rate (> 20%)
**Plan**:
- Over-recruit (N=30) to account for 20% attrition
- Send reminder emails 24 hours before sessions
- Offer flexible scheduling (evenings, weekends)

### Technical Issues

**Risk**: NabokovsWeb bugs during study
**Plan**:
- **Pilot test** with 4 participants to identify critical bugs
- **Hotfix protocol**: Researcher present during first session for each participant, immediate bug triage
- **Version control**: Freeze extension version after pilot (no updates mid-study)

**Risk**: API rate limits (Anthropic Claude)
**Plan**:
- Pre-purchase $200 credits (sufficient for ~100 sessions at $2/session)
- Fallback: Use mock API responses if rate-limited (document as limitation)

**Risk**: Screen recording failures
**Plan**:
- **Redundancy**: OBS Studio + Zoom cloud recording (2 simultaneous captures)
- Researcher monitors recording status at session start

### Analysis Challenges

**Risk**: Low inter-rater reliability (κ < 0.75)
**Plan**:
- Additional coder training (review discrepancies, refine codebook)
- Increase dual-coded proportion to 30% (vs. 20%)
- Consult qualitative methods expert for adjudication

**Risk**: Null results (no significant differences between conditions)
**Plan**:
- **Focus on effect sizes**: Even non-significant trends inform design
- **Qualitative insights**: Rich interview data still valuable for understanding tool affordances
- **Reframe contribution**: Validation of baseline tools, identification of design opportunities

---

## 17. Post-Study Roadmap

### Immediate Next Steps (Months 5-6)

1. **Manuscript Preparation**: CHI 2026 submission (Week 24-30)
2. **Feature Iteration**: Address usability issues identified in study (e.g., onboarding flow, connection UI)
3. **Tool Refinement**: Implement high-priority features from participant feedback (e.g., mobile support, bulk import)

### Medium-Term Studies (Year 2)

1. **Longitudinal Diary Study** (N=12, 3 months):
   - Track naturalistic use patterns, feature adoption curves, abandonment triggers
   - Daily check-ins (1-2 min surveys), weekly reflections (10-min interviews)

2. **Dyad Collaboration Study** (N=20 pairs):
   - Test shared canvas for co-research (e.g., dissertation committees, co-authors)
   - Measure: turn-taking, division of labor, conflict resolution
   - Comparison: Google Docs, Miro, Notion team workspace

3. **Domain Expansion** (N=30, across 3 domains):
   - Beyond academic research: creative writing, project management, journaling
   - Validate PKM Effectiveness Questionnaire across contexts

### Long-Term Vision (Years 3-5)

1. **Large-Scale Validation** (N=200+):
   - Multi-site study (3-5 universities)
   - Full psychometric validation of EASS-5, PKM Effectiveness Questionnaire
   - Structural equation modeling (mediation: epistemic agency → retention)

2. **A/B Testing at Scale**:
   - Release NabokovsWeb as public Chrome extension (free tier + premium)
   - Randomized feature rollouts (e.g., connection suggestions, auto-tagging)
   - Telemetry: Usage analytics (privacy-preserving), optional opt-in studies

3. **AI Personalization**:
   - Adaptive custom buttons (learn user's preferred synthesis styles)
   - Retrieval practice scheduling (spaced repetition for cards)
   - Proactive connection suggestions (LLM detects related content)

---

## 18. Conclusion

This protocol provides a **rigorous, mixed-methods framework** for empirically validating NabokovsWeb's core claims:

1. **Cognitive efficiency**: Lower mental demand via spatial offloading + LLM assistance
2. **Epistemic agency**: Enhanced control + authorship through persistent artifacts + connections
3. **Knowledge retention**: Superior long-term recall via spatial encoding + retrieval practice
4. **Creative synthesis**: Divergent thinking augmentation through LLM-powered card generation
5. **PKM effectiveness**: Balanced analytical, informational, and learning competencies

By comparing against **established baselines** (ChatGPT, Notion, Obsidian), employing **standardized metrics** (NASA-TLX, custom EASS-5, Wright's PKM model), and collecting **rich qualitative data** (think-aloud, interviews), this study will:

- **Quantify** NabokovsWeb's strengths and weaknesses relative to competitors
- **Identify** design opportunities for iterative refinement
- **Validate** theoretical foundations from Rounds 1-8 (information foraging, sensemaking, epistemic agency)
- **Establish** baseline metrics for longitudinal tracking
- **Generate** publication-ready findings for CHI 2026

**Next Steps**:
1. Submit IRB application (Week 1-2)
2. Finalize training materials (Week 3-4)
3. Pilot study (Week 5)
4. Full data collection (Week 6-11)
5. Analysis + manuscript (Week 12-30)

**Success Criteria**:
- ≥20 participants complete full protocol (83% retention)
- ≥1 significant finding per RQ (p<0.05 or d>0.5)
- Publication acceptance (CHI 2026 or equivalent venue)
- Feature roadmap informed by user feedback (≥5 actionable insights)

This study positions NabokovsWeb not as a "finished product" but as a **research platform** for ongoing investigation of LLM-augmented PKM, spatial sensemaking, and epistemic agency in digital knowledge work.

---

**Document Status**: Ready for IRB submission
**Last Updated**: 2025-10-02
**Contact**: Warren Zhu (wzhu@college.harvard.edu)
