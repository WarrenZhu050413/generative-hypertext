# Nabokov Web Clipper Documentation

This directory contains all project documentation, organized by category.

## Directory Structure

### 📐 Architecture (`architecture/`)
System design, technical architecture, and implementation details.

- **DESIGN.md** - Core design philosophy and technical decisions
- **architecture-diagram.html** - Visual system architecture
- **claude_*.html** - Deep-dive technical implementation guides:
  - API integration strategies
  - BeautificationService design (two modes)
  - DOMPurify safe HTML handling
  - Image drag-and-drop feature
  - IndexedDB and CORS considerations
  - Screenshot storage APIs

### 🔨 Implementation (`implementation/`)
Practical guides for development and feature implementation.

- **IMPLEMENTATION_QUICKSTART.md** - Quick start guide for developers
- **IMPLEMENTATION_SUMMARY.md** - Summary of key implementation decisions
- **features/** - Detailed feature documentation:
  - **features.md** - Comprehensive feature catalog
  - **memory.md** - State management and memory architecture

### 🔬 Research (`research/`)
User research, competitive analysis, and design explorations.

- **RESEARCH_SUMMARY.md** - Overview of all research activities
- **FINAL_RESEARCH_SYNTHESIS.md** - Final synthesis of findings
- **ROUND[4-9]_*.md** - Research round reports:
  - Competitive analysis
  - Executive summaries
  - User study designs
  - Feature synthesis
- **planning/** - Early planning documents (HTML format)

### 🧪 Testing (`testing/`)
Test guides, reports, and testing strategy.

- **MANUAL_TEST_GUIDE.md** - Step-by-step manual testing procedures
- **LLM_HYPERLINKS_TEST_REPORT.md** - LLM hyperlinks feature test report
- **test-report-phase-1.1.md** - Phase 1.1 testing results

### 📋 Project Management (`project/`)
Project status, roadmaps, and task tracking.

- **PROJECT_STATUS.md** - Current project status and milestones
- **FEATURES_IMPLEMENTED.md** - Completed features checklist
- **TODO.md** - General project tasks
- **TODO_Warren.md** - Personal task list
- **roadmap.html** - Visual project roadmap

### 📚 Developer Docs (root `docs/`)
Developer-focused documentation (existing structure preserved).

- BUILD_README.md
- CONFIGURATION_SUMMARY.md
- ELEMENT_SELECTOR_IMPLEMENTATION.md
- EXTENSION_BUILD.md
- file-artifacts-implementation.md
- KEYBOARD_SHORTCUTS.md
- QUICK_DEBUG_GUIDE.md
- QUICK_START.md
- TESTING_GUIDE.html

## Quick Links

**Getting Started:**
1. [QUICK_START.md](./QUICK_START.md)
2. [IMPLEMENTATION_QUICKSTART.md](./implementation/IMPLEMENTATION_QUICKSTART.md)
3. [BUILD_README.md](./BUILD_README.md)

**Understanding the System:**
1. [DESIGN.md](./architecture/DESIGN.md)
2. [architecture-diagram.html](./architecture/architecture-diagram.html)
3. [features.md](./implementation/features/features.md)

**Testing:**
1. [MANUAL_TEST_GUIDE.md](./testing/MANUAL_TEST_GUIDE.md)
2. [TESTING_GUIDE.html](./TESTING_GUIDE.html)
3. [QUICK_DEBUG_GUIDE.md](./QUICK_DEBUG_GUIDE.md)

**Project Status:**
1. [PROJECT_STATUS.md](./project/PROJECT_STATUS.md)
2. [FEATURES_IMPLEMENTED.md](./project/FEATURES_IMPLEMENTED.md)
3. [roadmap.html](./project/roadmap.html)

## For Developers

If you're a developer working on Nabokov Web Clipper, start here:

1. **First time setup**: [QUICK_START.md](./QUICK_START.md)
2. **Understanding architecture**: [DESIGN.md](./architecture/DESIGN.md)
3. **Implementation guide**: [IMPLEMENTATION_QUICKSTART.md](./implementation/IMPLEMENTATION_QUICKSTART.md)
4. **Testing your changes**: [MANUAL_TEST_GUIDE.md](./testing/MANUAL_TEST_GUIDE.md)
5. **Debugging**: [QUICK_DEBUG_GUIDE.md](./QUICK_DEBUG_GUIDE.md)

## For Researchers

If you're interested in the research behind Nabokov:

1. **Research overview**: [RESEARCH_SUMMARY.md](./research/RESEARCH_SUMMARY.md)
2. **Final synthesis**: [FINAL_RESEARCH_SYNTHESIS.md](./research/FINAL_RESEARCH_SYNTHESIS.md)
3. **Study designs**: [ROUND9_STUDY_DESIGN.md](./research/ROUND9_STUDY_DESIGN.md)

## Document Conventions

- **`.md` files**: Markdown documentation (GitHub-flavored)
- **`.html` files**: Rich HTML documentation with diagrams/styling
- **`ROUND[N]_*.md`**: Numbered research rounds (chronological)
- **`claude_*.html`**: Technical deep-dives (Claude Code generated)
