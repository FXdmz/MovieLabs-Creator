# Instructions for Future Claude Sessions

**Purpose:** Get a new Claude instance up to speed in under 5 minutes

-----

## 🚀 **QUICK START** (User: Read This First!)

When starting a new Claude chat session about this project:

### **1. Paste This Context Prompt:**

```markdown
I'm working on a MovieLabs OMC Creator tool (TypeScript/Replit). 

**What it does:** Exports production data to RDF/Turtle and JSON following MovieLabs OMC v2.8 spec.

**Stack:** React 18, TypeScript, N3.js (RDF), Zustand (state), PostgreSQL, Vite

I have complete documentation in the .claude folder. Please read:
- .claude/quick-navigation-guide.md (find any code fast)
- .claude/refactoring-opportunities.md (improvement ideas)
- .claude/documentation-index.md (all docs overview)
- replit.md (project overview and developer onboarding)

What would you like to start with?
```

### **2. Key Files to Reference:**

**Required** (in order of importance):

1. `replit.md` - Architecture, file locations, developer onboarding
1. `.claude/quick-navigation-guide.md` - Find any functionality in 30 seconds
1. Latest sample outputs (`.ttl` and `.json` files)

**Optional** (for specific tasks):
4. `.claude/refactoring-opportunities.md` - Improvement ideas

-----

## 📋 **FOR CLAUDE: HOW TO USE THESE DOCUMENTS**

### When User Asks: "Where is X?"

**Action:** Check `.claude/quick-navigation-guide.md`

**Example:**

```
User: "Where do I fix how JSON is exported?"
You: [Check quick-navigation-guide.md → "Export / Serialization" section]
→ client/src/lib/export/property-mapping.ts (property transforms)
→ client/src/lib/export/index.ts (orchestration)
```

-----

### When User Asks: "How does X work?"

**Action:** Check `replit.md`

**Example:**

```
User: "How does the export flow work?"
You: [Check replit.md → System Architecture section]
→ Explain the complete flow from UI button to file download
→ Show the two RDF paths (N3.js vs legacy)
→ Show property mapping layer
```

-----

### When User Asks: "What should I improve?"

**Action:** Check `.claude/refactoring-opportunities.md`

**Example:**

```
User: "What's the low-hanging fruit for improvements?"
You: [Check refactoring-opportunities.md → "HIGH IMPACT, LOW EFFORT"]
→ Consolidate RDF serializers (2-3 hours, high impact)
→ Extract magic strings (1-2 hours, prevents bugs)
→ Add JSDoc comments (2-3 hours, onboarding)
```

-----

### When User Asks: "How do I add X?"

**Action:** Check `.claude/quick-navigation-guide.md` → "COMMON PATTERNS"

**Example:**

```
User: "How do I add a new entity type?"
You: [Check quick-navigation-guide.md → "Adding a New Entity Type"]
→ Provide the 8-step checklist
→ Show the template code
→ List all files to touch
```

-----

## 🎯 **COMMON QUESTION PATTERNS**

### Pattern: "Find the code that does X"

**Response Template:**

```
The code you're looking for is in:
📁 client/src/lib/[area]/[file].ts

Specifically:
- Line X-Y: [description]

Related files:
- 📁 [other file]: [purpose]

Would you like me to:
1. Show you the relevant code?
2. Explain how it works?
3. Suggest improvements?
```

-----

### Pattern: "Fix bug in X"

**Response Template:**

```
I found the issue. Here's what's happening:

**Current code** (file.ts:line):
[code snippet]

**Problem:** [explanation]

**Fix:**
[corrected code]

**Testing:**
[how to verify the fix]

Would you like me to explain why this works?
```

-----

### Pattern: "Add feature X"

**Response Template:**

```
To add [feature], you'll need to modify these files:

**1. [Primary file]**
   - Add: [what to add]
   - Line: [where]

**2. [Secondary file]**
   - Update: [what to update]

**3. [Test file]**
   - Test: [what to test]

Here's the implementation:
[code]

Estimated effort: [time]
Risk level: [low/medium/high]
```

-----

## 📚 **DOCUMENT QUICK REFERENCE**

|Document                       |Use When                       |Key Sections                                   |
|-------------------------------|-------------------------------|-----------------------------------------------|
|`replit.md`                    |Need architecture understanding|Project structure, Data flow, Dependencies     |
|`quick-navigation-guide.md`    |Need to find specific code     |"I NEED TO…", File locations, Data flow maps   |
|`refactoring-opportunities.md` |Want to improve code           |Priority matrix, Quick wins                    |

-----

## 🔍 **INFORMATION HIERARCHY**

```
User Question
    ↓
quick-navigation-guide.md (Find the right file)
    ↓
replit.md (Understand the architecture)
    ↓
[Specific Document] (Deep dive into that area)
    ↓
Provide Answer with Code Examples
```

-----

## 💡 **RESPONSE BEST PRACTICES**

### ✅ DO:

1. **Always cite file paths** - Be specific
1. **Show code snippets** - Not just descriptions
1. **Provide line numbers** - When known
1. **Offer next steps** - "Would you like me to…"
1. **Reference documentation** - "As shown in replit.md…"

### ❌ DON'T:

1. **Guess file locations** - Check docs first
1. **Provide outdated info** - These docs are current
1. **Overlook tests** - Always mention testing
1. **Ignore architecture** - Explain how parts fit
1. **Give incomplete answers** - Use all available docs

-----

## 🚨 **CRITICAL REMINDERS**

### 1. Two RDF Serialization Paths Exist

```
Legacy: client/src/lib/export/rdf/serializer.ts
Modern: client/src/lib/rdf/serializer.ts (N3.js) ← Prefer this
```

### 2. Property Mappings Are Bidirectional

```
RDF Property ←→ JSON Property
firstName    ←→ givenName
city         ←→ locality
```

### 3. State Is Client-Side

```
Database: Only users table
Zustand:  All entity data
```

### 4. Tests Are Comprehensive

```
Location: client/src/lib/rdf/rdf-roundtrip.spec.ts
Run: npx vitest run
```

-----

## 📊 **PROJECT STATUS SNAPSHOT**

**Current State:**

- JSON Compliance: 9.5/10
- RDF Compliance: 9/10
- All entity files documented with JSDoc headers
- Developer Onboarding section in replit.md

**Key Directories:**

- `client/src/lib/rdf/` - RDF domain layer (N3.js, adapters)
- `client/src/lib/export/` - JSON and RDF exporters
- `client/src/lib/import/` - JSON and TTL importers
- `client/src/components/` - All React components
- `server/` - Express backend

-----

**With these documents, every Claude session picks up exactly where the last one left off.** 🚀
