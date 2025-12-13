# MovieLabs Creator - Documentation Index

**Purpose:** Quick reference to all available documentation

-----

## 📚 **DOCUMENTATION FILES**

### In `.claude/` Folder

| File | Purpose | When to Use |
|------|---------|-------------|
| `quick-navigation-guide.md` | Find any code in 30 seconds | Daily development |
| `refactoring-opportunities.md` | Code improvement ideas | Sprint planning |
| `future-claude-instructions.md` | Context for new Claude sessions | Starting new chats |
| `documentation-index.md` | This file - overview of all docs | Finding right doc |

### In Project Root

| File | Purpose | When to Use |
|------|---------|-------------|
| `replit.md` | Project overview, architecture, developer onboarding | Understanding the project |

-----

## 🎯 **QUICK ACCESS**

### "I need to..."

| Task | Go To |
|------|-------|
| Find a specific file | `quick-navigation-guide.md` → "I NEED TO..." |
| Understand the architecture | `replit.md` → System Architecture |
| Add a new feature | `quick-navigation-guide.md` → "COMMON PATTERNS" |
| Fix a bug | `quick-navigation-guide.md` → "DEBUGGING CHECKLIST" |
| Plan improvements | `refactoring-opportunities.md` |
| Onboard as developer | `replit.md` → Developer Onboarding |

-----

## 🔗 **CONNECTING TO CLAUDE**

When starting a new Claude session:

1. Reference the `.claude/` folder
2. Ask Claude to read `future-claude-instructions.md` first
3. Point to specific docs as needed

**Example prompt:**
```
Please read .claude/future-claude-instructions.md for context about this project.
Then help me with [your task].
```

-----

## 📁 **FILE LOCATIONS SUMMARY**

```
.claude/
├── quick-navigation-guide.md    # Find code fast
├── refactoring-opportunities.md # Improvement ideas  
├── future-claude-instructions.md # Claude context
└── documentation-index.md       # This file

replit.md                        # Project overview & onboarding
```

-----

## ✅ **DOCUMENTATION COVERAGE**

All codebase files now have JSDoc headers with:
- `@fileoverview` - Purpose and description
- `@features` - Key capabilities (where applicable)
- `@exports` - Main exports from the module

**Total Files Documented:** 100+ files
**Documentation Added:** December 13, 2025
