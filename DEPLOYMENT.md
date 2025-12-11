# MUSE Music - Deployment Guide

Complete deployment guide for MUSE Music project including CI/CD pipeline, infrastructure requirements, and N8N integration.

---

## 📋 Table of Contents

1. [CI/CD Pipeline Overview](#-cicd-pipeline-overview)
2. [Infrastructure Requirements](#-infrastructure-requirements)
3. [Deployment Flow](#-deployment-flow)
4. [N8N Workflow Architecture](#-n8n-workflow-architecture)
5. [Step-by-Step Deployment](#-step-by-step-deployment)
6. [Monitoring & Troubleshooting](#-monitoring--troubleshooting)

---

## 🔄 CI/CD Pipeline Overview

### Pipeline Architecture

```mermaid
graph LR
    A[Developer Push] --> B[GitHub Repository]
    B --> C[GitHub Actions<br/>Quick CI]
    B --> D[Jenkins<br/>Full CI/CD]
    D --> E[Coolify<br/>Deploy]
```

### Why This Architecture?

**GitHub Actions** → Quick CI checks (linting, tests) on every push/PR  
**Jenkins** → Comprehensive build/test before deployment (prevents bad builds from reaching Coolify)  
**Coolify** → Final deployment and hosting

**Benefits**:
- ✅ Coolify doesn't waste resources building/testing failed code
- ✅ Jenkins acts as a quality gate before production
- ✅ GitHub Actions provides fast feedback on PRs
- ✅ Webhook-based deployment is fast and reliable

---

## 🏗️ Infrastructure Requirements

### Infrastructure Architecture

```mermaid
graph TB
    subgraph External["External Services"]
        PG[(PostgreSQL)]
        MINIO[MinIO Storage]
        N8N[N8N Workflows]
        OLLAMA[Ollama AI]
    end
    
    subgraph CICD["CI/CD"]
        GITHUB[GitHub]
        JENKINS[Jenkins]
    end
    
    subgraph App["Application"]
        FRONTEND[Frontend<br/>Next.js]
        BACKEND[Backend<br/>Node.js]
    end
    
    USERS[Users] --> FRONTEND
    GITHUB --> JENKINS
    JENKINS --> COOLIFY[Coolify]
    COOLIFY --> FRONTEND
    COOLIFY --> BACKEND
    
    FRONTEND --> BACKEND
    BACKEND --> PG
    BACKEND --> MINIO
    BACKEND --> N8N
    N8N --> OLLAMA
```

### Required Services (External to Docker Compose)

These services should be deployed separately for production:

#### 1. **PostgreSQL Database**
```yaml
Service: PostgreSQL 14+
Purpose: Main application database
Resources:
  - RAM: 2-4 GB minimum
  - CPU: 2 cores minimum
  - Storage: 20-50 GB SSD
  - Backup: Daily automated backups

Connection:
  Host: your-postgres-host
  Port: 5432
  Database: muse_music
  User: muse_user
  Password: secure-password

Recommended Setup:
  - Use managed database service (AWS RDS, DigitalOcean DB, etc.)
  - Enable automatic backups
  - Set up read replicas for scaling
  - Configure connection pooling
```

#### 2. **MinIO (Object Storage)**
```yaml
Service: MinIO
Purpose: Image and file storage
Resources:
  - RAM: 2 GB minimum
  - Storage: 50-500 GB (depends on usage)
  - Network: High bandwidth recommended

Buckets Required:
  - muse-music (main bucket for images)

Access:
  Endpoint: https://minio.your-domain.com
  Access Key: <generate-secure-key>
  Secret Key: <generate-secure-key>
  Region: us-east-1 (or your region)

Recommended Setup:
  - Use S3-compatible storage (AWS S3, DigitalOcean Spaces, MinIO)
  - Enable versioning for backup
  - Set up lifecycle policies for old files
  - Configure CDN for faster delivery
```

#### 3. **N8N Workflow Automation**
```yaml
Service: N8N
Purpose: AI translation, email notifications
Resources:
  - RAM: 1-2 GB
  - CPU: 1-2 cores
  - Storage: 10 GB

Required Workflows:
  1. Translator Workflow (see N8N section below)
  2. Email Notification Workflow

Access:
  Endpoint: https://n8n.your-domain.com
  API Key: <generate-secure-key>

Webhooks:
  - /webhook/{id}/translator - Translation webhook

Recommended Setup:
  - Use managed N8N service or self-host
  - Enable API access
  - Set up proper authentication
  - Configure webhook URLs in backend env
```

#### 4. **Ollama (AI Model Server)** [Optional but Recommended]
```yaml
Service: Ollama
Purpose: Local AI models for translation
Resources:
  - RAM: 8-16 GB (depends on model size)
  - CPU: 4-8 cores
  - GPU: NVIDIA GPU recommended for better performance
  - Storage: 50-100 GB for models

Models Required:
  - gpt-oss:120b (primary translation model)
  - gpt-oss:20b (secondary/fallback model)
  - qwen3-embedding:latest (embeddings)

Alternative:
  - Use OpenRouter API instead (requires API key)
  - Configure in N8N workflow
```

#### 5. **Jenkins Server**
```yaml
Service: Jenkins
Purpose: CI/CD pipeline automation
Resources:
  - RAM: 4 GB minimum
  - CPU: 2 cores minimum
  - Storage: 50 GB

Required Plugins:
  - NodeJS Plugin (for Node.js 24)
  - Pipeline Plugin
  - Git Plugin
  - Shared Library Plugin

Access:
  URL: https://jenkins.your-domain.com
  Credentials: GitHub token, Coolify webhook URL

Configuration:
  - Configure NodeJS 24 installation
  - Set up shared library (optional)
  - Configure webhooks to Coolify
  - Set up environment variables
```

### Service Dependencies Diagram

```mermaid
graph LR
    User --> Frontend
    Frontend --> Backend
    Backend --> PostgreSQL
    Backend --> MinIO
    Backend --> N8N
    N8N --> Ollama
    Ollama --> N8N
    N8N --> Backend
    Backend --> Frontend
    Frontend --> User
```

---

## 🚀 Deployment Flow

### Complete Pipeline Flow

```mermaid
flowchart TD
    A[1. Developer Push] --> B[2. GitHub Actions]
    B --> B1[Lint + Tests]
    B1 --> C[3. Jenkins Pipeline]
    
    C --> C1[Checkout]
    C1 --> C2[Build & Lint]
    C2 --> C3[Unit Tests<br/>60+133 tests]
    C3 --> C4[Integration Tests<br/>43 tests]
    C4 --> C5[E2E Tests<br/>56 tests]
    
    C5 --> D{Quality Gate}
    D -->|Fail| D1[STOP]
    D -->|Pass| E[4. Trigger Coolify]
    
    E --> E1{Branch?}
    E1 -->|main| E2[Production]
    E1 -->|develop| E3[Development]
    
    E2 --> F[5. Coolify Deploy]
    E3 --> F
    
    F --> F1[Pull Code]
    F1 --> F2[Build Images]
    F2 --> F3[Migrate DB]
    F3 --> F4[Deploy]
    F4 --> F5[Health Check]
    F5 --> G[6. Done]
```

### Jenkinsfile Configuration

**Note**: This project uses Jenkins Shared Library `@Library('my-shared-lib@main')` with helper functions:
- `notifyN8N(status, message)` - Send notifications to N8N webhook
- `deployToCoolify(projectName, uuidVar, tokenVar, baseUrlVar)` - Trigger Coolify deployment

Key stages from `Jenkinsfile`:

```groovy
@Library('my-shared-lib@main') _

pipeline {
    agent any
    
    options { 
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
    }
    
    environment {
        PROJECT_NAME     = 'MUSE MUSIC'
        REPO_URL         = 'https://github.com/your-org/MUSE-MUSIC.git'
        REPO_CREDENTIALS = 'github-token'
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    notifyN8N("INFO", "Pipeline started. Checking out code... (branch=${env.BRANCH_NAME})")
                }
                checkout scm
            }
        }
        
        stage('Build & Lint Parallel') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            parallel {
                stage('Frontend') {
                    stages {
                        stage('Install Frontend') { ... }
                        stage('Lint Frontend') { ... }
                        stage('Verify Test Structure') {
                            // npm run test:verify-structure
                        }
                    }
                }
                stage('Backend') {
                    stages {
                        stage('Install Backend') { ... }
                        stage('Lint Backend') { ... }
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            parallel {
                stage('Frontend Unit Tests') {
                    // export USE_TS_JEST=true
                    // npm run test:unit
                }
                stage('Backend Unit Tests') {
                    // npm run test:unit
                }
            }
        }
        
        stage('Integration Tests') {
            when { 
                anyOf { 
                    branch 'main'
                    branch 'develop'
                }
            }
            parallel {
                stage('Frontend Integration Tests') {
                    // export USE_TS_JEST=true
                    // npm run test:integration
                }
                stage('Backend Integration Tests') {
                    environment {
                        NODE_ENV = 'test'
                        DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db'
                        JWT_SECRET = 'test_jwt_secret_key_for_jenkins'
                        JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_jenkins'
                    }
                    steps {
                        // Check PostgreSQL availability
                        // Run migrations if available
                        // npm run test:integration
                        // Skip if PostgreSQL not available
                    }
                }
            }
        }
        
        stage('E2E Tests') {
            when { 
                anyOf { 
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                // Check if environment supports Playwright
                // npx playwright install --with-deps chromium
                // npm run test:e2e
                // Skip if no root/sudo access
            }
            post {
                always {
                    publishHTML([
                        reportDir: 'frontend/playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright E2E Test Report'
                    ])
                }
            }
        }
        
        stage('Deploy to Coolify') {
            when { anyOf { branch 'main'; branch 'develop' } }
            steps {
                script {
                    notifyN8N("INFO", "Preparing deployment to Coolify...")
                    
                    if (env.BRANCH_NAME == "main") {
                        deployToCoolify(
                            "MuseMusic",
                            "COOLIFY_UUID_MUSEMUSIC",
                            "COOLIFY_TOKEN",
                            "COOLIFY_BASEURL"
                        )
                    } else if (env.BRANCH_NAME == "develop") {
                        deployToCoolify(
                            "MuseMusic",
                            "COOLIFY_UUID_MUSEMUSIC_DEV",
                            "COOLIFY_TOKEN",
                            "COOLIFY_BASEURL"
                        )
                    }
                    
                    notifyN8N("SUCCESS", "Deployment request sent to Coolify.")
                }
            }
        }
    }
    
    post {
        success {
            script { notifyN8N("SUCCESS", "✅ Build, Lint, Test, Deploy Success!") }
        }
        failure {
            script { notifyN8N("FAILURE", "❌ Pipeline Failed!") }
        }
    }
}
```

**Detailed Stage Breakdown**:

1. **Checkout** - Clone repository with N8N notification
2. **Build & Lint** (Parallel, only on main/develop)
   - Frontend: `npm install` → `npm run lint:ci` → `npm run test:verify-structure`
   - Backend: `npm install` → `npm run lint`
3. **Unit Tests** (Parallel, only on main/develop)
   - Frontend: `export USE_TS_JEST=true && npm run test:unit` (~60 tests, ~3.4s)
   - Backend: `npm run test:unit` (~133 tests, ~2.0s)
4. **Integration Tests** (Parallel, only on main/develop)
   - Frontend: `export USE_TS_JEST=true && npm run test:integration` (~43 tests, ~2.7s)
   - Backend: Checks PostgreSQL → `npm run migrate` → `npm run test:integration` (skips if no DB)
5. **E2E Tests** (only on main/develop)
   - Checks root/sudo access → `npx playwright install --with-deps chromium` → `npm run test:e2e`
   - Publishes HTML report to Jenkins (56 passed/6 skipped, ~1.8 min)
6. **Deploy to Coolify** (only on main/develop)
   - Calls `deployToCoolify()` with different UUID for main vs develop
   - Sends N8N notification on success/failure

**Test Scripts (from package.json)**:
```bash
# Frontend
npm run lint:ci              # ESLint with CI format
npm run test:verify-structure  # Verify test file structure
npm run test:unit            # Jest unit tests
npm run test:integration     # Jest integration tests
npm run test:e2e             # Playwright E2E tests

# Backend
npm run lint                 # ESLint
npm run test:unit            # Jest unit tests
npm run test:integration     # Jest integration tests (requires PostgreSQL)
npm run migrate              # Run database migrations
npm run migrate:prod         # Run migrations in production
```

---

## 🤖 N8N Workflow Architecture

### Translator Workflow

**Workflow Name**: `MUSE MUSIC - Translator Workflow`  
**Purpose**: AI-powered lyrics translation with mood analysis  
**Type**: Webhook-based translation service

#### Workflow Diagram

```mermaid
flowchart LR
    A[Webhook Input] --> B[AI Agent]
    C[Ollama gpt-oss:120b] -.-> B
    D[OpenRouter API] -.-> B
    
    B --> E[Processing]
    E --> F[Translation]
    E --> G[Interpretation]
    E --> H[Mood Analysis]
    
    F --> I[Parser]
    G --> I
    H --> I
    
    I --> J[JSON Response]
```

#### Workflow Components

**1. Webhook Node**
```yaml
Type: Webhook Trigger
Method: POST
Path: /webhook/{id}/translator
Authentication: None (add API key if needed)

Expected Input:
{
  "language1": "Thai",           # Source language
  "language2": "English",        # Target language
  "lyrics": "...",               # Lyrics to translate (with timestamps)
  "moodEnabled": true,           # Enable mood analysis
  "moodTopK": 4                  # Top K moods to return (default: 4)
}
```

**2. AI Agent Node**
```yaml
Type: AI Agent (LangChain)
Model: Ollama Chat (gpt-oss:120b) or OpenRouter
Temperature: Default
Max Tokens: Auto

Prompt:
  - Line-by-line translation
  - Preserve timestamps
  - Maintain emotional tone
  - Natural phrasing (not literal)
  - Cultural interpretation
  - Mood analysis (if enabled)

Mood Classes (0-21):
  0: Happy, 1: Sad, 2: Anger, 3: Disgust,
  4-5: Fear, 6: Surprise, 7: Sleepy,
  8: Playful, 9: Love, 10: Calm, 11: Neutral,
  12: Sick, 13: Embarrassed, 14: Dizzy,
  15: Broken Heart, 16: Cool, 17: Mixed,
  18: Awkward, 19: Wink, 20: Hearts, 21: Angel
```

**3. Code in JavaScript Node**
```javascript
// Parse AI output into structured format
let trans = "";
let interpret = "";
let mood = "";

for (const item of $input.all()) {
  const output = item.json.output || "";
  const lines = output.split("\n");

  let foundInterpret = false;
  let foundMood = false;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith("**Interpretation:**")) {
      foundInterpret = true;
      foundMood = false;
      continue;
    }

    if (line.startsWith("MoodAnalyze:")) {
      foundMood = true;
      foundInterpret = false;
      continue;
    }

    if (foundMood) {
      // Parse mood line: "1 45%"
      if (/^\d+\s+\d+%$/.test(line)) {
        mood += line + "\n";
      }
    } else if (foundInterpret) {
      interpret += line + "\n";
    } else {
      trans += line + "\n";
    }
  }
}

return {
  translation: trans.trim(),
  interpretation: interpret.trim(),
  moodAnalyze: mood.trim() || null
};
```

**4. Response**
```json
{
  "translation": "Line-by-line translated lyrics\nwith timestamps preserved",
  "interpretation": "A reflective summary describing the story, emotion, and meaning...",
  "moodAnalyze": "1 45%\n15 30%\n10 25%" // or null if mood disabled
}
```

#### Backend Integration

In `backend/.env`:
```bash
TRANSLATE_WEBHOOK=https://n8n.your-domain.com/webhook/{your-webhook-id}/translator
N8N_API_KEY=your-api-key-here  # If authentication enabled
```

In backend code:
```javascript
// services/translateService.js
const response = await fetch(process.env.TRANSLATE_WEBHOOK, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // 'X-N8N-API-KEY': process.env.N8N_API_KEY  // If needed
  },
  body: JSON.stringify({
    language1: 'Thai',
    language2: 'English',
    lyrics: originalLyrics,
    moodEnabled: true,
    moodTopK: 4
  })
});

const { translation, interpretation, moodAnalyze } = await response.json();
```

#### N8N Workflow JSON (Ready to Import)

**📁 Workflow File**: [`n8n-translator-workflow.json`](./n8n-translator-workflow.json)

**How to Import**:
1. Download the workflow file: [`n8n-translator-workflow.json`](./n8n-translator-workflow.json)
2. Open N8N → Workflows → Click "+" → "Import from JSON"
3. Upload or paste the JSON content
4. Update credentials (Ollama API connection)
5. Activate the workflow
6. Copy the webhook URL and set it in your backend `.env`

**Quick Import via Command Line**:
```bash
# Download the workflow JSON
curl -O https://raw.githubusercontent.com/your-org/MUSE-MUSIC/main/n8n-translator-workflow.json

# Or if already cloned
cp n8n-translator-workflow.json /path/to/import/
```

**Workflow JSON Preview** (See full file: `n8n-translator-workflow.json`):
```json
{
  "name": "MUSE MUSIC - Translator Workflow",
  "nodes": [
    {
      "parameters": {
        "promptType": "define",
        "text": "=# Song Translation — SLIM+ (n8n / oos:120:b – Production Lyric Mode)\n\nYou are a professional lyric translator and cultural interpreter.\nOutput only the formatted text below. No meta commentary, system notes, or Markdown beyond what is shown.\n\n## Variables\n- Source: {{ $json.body.language1 }}\n- Target: {{ $json.body.language2 }}\n- Lyrics: {{ $json.body.lyrics }}\n- MoodEnabled: {{ $json.body.moodEnabled }}\n- MoodTopK: {{ $json.body.moodTopK }}\n\nMoodEnabled is considered ON if it is not null, not empty, and not equal to \"false\" or 0.  \nIf MoodEnabled is null, missing, empty, \"false\", or 0, you MUST NOT output any mood analysis.\n\nIf MoodTopK is null or missing, treat MoodTopK as 4.\n\n## Goal\nTranslate line by line with faithful meaning and poetic naturalness.  \nIf Source and Target are the same language, copy each line exactly (no translation or paraphrasing). Keep original spacing, punctuation, and timestamps.  \n\nMaintain the same emotional atmosphere and pacing rhythm as the source lyrics.  \nThe translation should sound like natural song lyrics in the Target language, not like a literal or robotic translation.  \nBalance accuracy, emotion, and musicality.  \nPreserve tone (e.g., sadness, warmth, nostalgia, longing, anger) and recurring imagery (e.g., moon, night, silence, sea, sky) when present.  \nPrioritize emotional coherence over strict grammatical symmetry.  \nIf a literal translation sounds unnatural, rewrite slightly to keep the emotional meaning.\n\nSilently read and understand the entire lyrics before translating. Use that understanding to keep the emotional atmosphere consistent across all lines.\n\n## Mood Classes (for optional mood analysis)\n\nWhen MoodEnabled is ON, you must also infer an overall emotional mood for the entire song from the following discrete classes.  \nEach class has a numeric index and a label:\n\n0: Happy  \n1: Sad  \n2: Anger  \n3: Disgust  \n4: Fear  \n5: Fear  \n6: Surprise  \n7: Sleepy  \n8: Playful  \n9: Love  \n10: Calm  \n11: Neutral  \n12: Sick  \n13: Embarrassed  \n14: Dizzy  \n15: Broken Heart  \n16: Cool  \n17: Mixed  \n18: Awkward  \n19: Wink  \n20: Hearts  \n21: Angel  \n\nGuidelines when MoodEnabled is ON:\n- Think about the song as a whole (not just one line).\n- Choose the 3–5 most relevant mood classes.\n- Assign each chosen class a percentage score from 0–100, such that the scores sum approximately to 100.\n- Higher percentage means more dominant emotional tone.\n- In the final mood output, you MUST use only the numeric Class Index (no emojis, no icons).\n\nIf MoodEnabled is OFF (null/empty/\"false\"/0), you MUST ignore this section and produce no mood output at all.\n\n---\n\n## Context Analysis (Before Translation)\nBefore translating, silently read and understand the entire lyrics as a whole.  \nIdentify the overall mood, tone, and key images (e.g., melancholy, nostalgic, hopeful, romantic, despair).  \nUse this understanding so every translated line fits the same emotional atmosphere.  \nIf the mood shifts during the song, reflect that transition naturally in the translated tone.  \nMaintain emotional consistency—each line should feel like part of one song, not isolated sentences.\n\nSome phrases or idioms may be split across multiple lines (for example, line A + line B = one idiom).  \nYou must still keep a strict 1:1 mapping of lines, but you may use neighbouring lines to interpret the meaning correctly.\n\n---\n\n## Rules\n\n### 1) Structure (STRICT)\n- Output pairs exactly in this format:\n  [Original line]  \n  [Translated line]\n\n  (one blank line between pairs)\n- Keep the same order and number of lines as the source.  \n  Do not merge, split, reorder, insert, or skip lines.\n- For each pair, the first line is a copy of the source line verbatim  \n  (same spelling, casing, spacing, punctuation, timestamps).  \n  Do not guess or complete missing/partial lines.\n\n### 2) Translation line (second line)\n- Translate poetically and faithfully in {{ $json.body.language2 }}, balancing emotional tone and natural rhythm over literal word-for-word mapping.\n- Treat the text as song lyrics, not prose. Use rhythm-aware phrasing and emotional nuance.\n- Slight reordering for natural flow is allowed, as long as the meaning is preserved.\n- Use everyday, natural phrasing in the target language, not stiff or bureaucratic wording.\n- Trim unnecessary pronouns if the subject is obvious from context.\n- Avoid stiff, literal calques; choose expressions that sound like real lyrics.\n- For idioms and figurative expressions, focus on the intended meaning, not the literal words.\n- If the original line contains mixed languages, you may keep foreign words where natural, but do not over-explain them.\n- When a line or phrase repeats (hook/chorus), keep the translation consistent across occurrences unless the context clearly changes the nuance.\n\n### 3) Language Quality & Safety\n- Ensure correct spelling, spacing, and natural grammar in {{ $json.body.language2 }}.\n- Do not output more lyrics than provided. If source lines are partial, keep them partial.\n- Do not invent, complete, or continue missing lyrics.\n- Do not add apologies, warnings, or comments about copyright, safety, or limitations.\n- Do not change the relationship between characters (e.g., friend vs lover) unless clearly implied by the lyrics.\n\n## Naturalness Checklist\nBefore finalizing, quickly verify that:\n- The target language reads smoothly, without stiffness or awkward literal phrasing.\n- Connective words are used only when they sound natural in the target language.\n- The tone and emotion align with the source's intent (e.g., bitter, tender, resigned, hopeful).\n- The rhythm and phrasing feel suitable for song lyrics, not a technical document.\n- Repeated lines are translated consistently, forming a coherent hook/chorus.\n\n## Final Sections\n\nAfter all [Original line] / [Translated line] pairs, add the following:\n\n1) Always output this section:\n\n**Interpretation:**  \nWrite a reflective summary in {{ $json.body.language2 }} describing the story, emotion, and meaning of the song.  \nCapture how the feeling or perspective changes from beginning to end.  \nDo not quote lyrics, analyze rhyme, or discuss musical structure.  \nKeep the tone gentle, poetic, and emotionally aware, as if explaining the song's heart to a listener.\n\n2) Only if MoodEnabled is ON (not null/empty/\"false\"/0), output an additional section immediately after the interpretation:\n\nMoodAnalyze:\n<ClassIndex1> <Score1>%\n<ClassIndex2> <Score2>%\n<ClassIndex3> <Score3>%\n...\n\nWhere:\n- Each line after \"MoodAnalyze:\" contains one mood.\n- ClassIndex is an integer from 0 to 21 (the numeric mood class).\n- Score is an integer percentage (e.g., 34%), without extra text.\n- Lines MUST be sorted from highest Score to lowest.\n- You MUST NOT output more than MoodTopK mood lines.\n- You MUST NOT output emojis, icons, or any extra explanation in this section.\n\nIf MoodEnabled is OFF (null/missing/empty/\"false\"/0):\n- Do NOT output the \"MoodAnalyze:\" header.\n- Do NOT output any mood lines.\n- End the response right after the Interpretation section.\n\n---\n\nLyrics to translate:\n{{ $json.body.lyrics }}\n",
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [432, 0],
      "id": "d7635582-362e-4759-a437-4c65c455b913",
      "name": "AI Agent"
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "translator",
        "responseMode": "lastNode",
        "responseData": "allEntries",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [176, 0],
      "id": "44b2f88f-8583-4103-9444-d27db337c31d",
      "name": "Webhook"
    },
    {
      "parameters": {
        "jsCode": "let trans = \"\";\nlet interpret = \"\";\nlet mood = \"\";\n\n// Loop through all inputs\nfor (const item of $input.all()) {\n  const output = item.json.output || \"\";\n  const lines = output.split(\"\\n\");\n\n  let foundInterpret = false;\n  let foundMood = false;\n\n  for (let line of lines) {\n    line = line.trim();\n    if (!line) continue;\n\n    // Check for Interpretation header\n    if (line.startsWith(\"**Interpretation:**\")) {\n      foundInterpret = true;\n      foundMood = false;\n      continue;\n    }\n\n    // Check for MoodAnalyze header\n    if (line.startsWith(\"MoodAnalyze:\")) {\n      foundMood = true;\n      foundInterpret = false;\n      continue;\n    }\n\n    // Separate content by context\n    if (foundMood) {\n      // mood line: must have number + %\n      if (/^\\d+\\s+\\d+%$/.test(line)) {\n        mood += line + \"\\n\";\n      }\n    } else if (foundInterpret) {\n      interpret += line + \"\\n\";\n    } else {\n      trans += line + \"\\n\";\n    }\n  }\n}\n\n// Return parsed object\nreturn {\n  translation: trans.trim(),\n  interpretation: interpret.trim(),\n  moodAnalyze: mood.trim() || null\n};\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [768, 0],
      "id": "49ff1b66-36e8-4f00-81d1-bc83bcc279db",
      "name": "Code in JavaScript"
    },
    {
      "parameters": {
        "model": "gpt-oss:120b",
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOllama",
      "typeVersion": 1,
      "position": [432, 208],
      "id": "4380bd8f-d41c-4a4b-a193-7ce8aca64f86",
      "name": "Ollama Chat Model",
      "credentials": {
        "ollamaApi": {
          "id": "YOUR_OLLAMA_CREDENTIAL_ID",
          "name": "Ollama API"
        }
      }
    }
  ],
  "connections": {
    "AI Agent": {
      "main": [
        [
          {
            "node": "Code in JavaScript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook": {
      "main": [
        [
          {
            "node": "AI Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Ollama Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "AI Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}
```
<details>
<summary>👆 Click to see full workflow structure (or use the separate JSON file)</summary>

The complete workflow JSON is available in the file: [`n8n-translator-workflow.json`](./n8n-translator-workflow.json)

**Workflow includes**:
- Webhook node (POST /translator)
- AI Agent with full prompt (lyrics translation + mood analysis)
- Ollama Chat Model (gpt-oss:120b)
- JavaScript parser (splits output into translation/interpretation/mood)
- Response formatter

</details>

**After Import Checklist**:
- [ ] Update Ollama credentials in "Ollama Chat Model" node
- [ ] Configure Ollama endpoint (default: `http://localhost:11434`)
- [ ] Verify `gpt-oss:120b` model is downloaded in Ollama
- [ ] Activate the workflow
- [ ] Copy webhook URL from "Webhook" node
- [ ] Add webhook URL to backend `.env` as `TRANSLATE_WEBHOOK`
- [ ] Test with a sample request

**Alternative Models**:
If you prefer to use OpenRouter API instead of Ollama:
1. Replace "Ollama Chat Model" node with "OpenRouter Chat Model" node
2. Configure OpenRouter API key
3. Use model: `mistralai/mistral-nemo:free` or your preferred model

---

## 📝 Step-by-Step Deployment

### Prerequisites

1. ✅ All infrastructure services running:
   - PostgreSQL database
   - MinIO object storage
   - N8N workflow automation
   - Jenkins CI/CD server
   - Coolify deployment platform

2. ✅ Environment variables configured
3. ✅ GitHub repository set up with proper branch protection
4. ✅ All tests passing locally

### Step 1: Prepare Infrastructure

#### 1.1 PostgreSQL Setup
```bash
# Create database
CREATE DATABASE muse_music;
CREATE USER muse_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE muse_music TO muse_user;

# Test connection
psql -h your-host -U muse_user -d muse_music
```

#### 1.2 MinIO Setup
```bash
# Create bucket via MinIO Console or CLI
mc alias set myminio https://minio.your-domain.com ACCESS_KEY SECRET_KEY
mc mb myminio/muse-music
mc policy set download myminio/muse-music  # Public read
```

#### 1.3 N8N Setup
```bash
# Import translator workflow
# Via N8N UI: Import from JSON
# Or via API:
curl -X POST https://n8n.your-domain.com/api/v1/workflows \
  -H "X-N8N-API-KEY: your-key" \
  -d @translator-workflow.json

# Activate workflow
curl -X PATCH https://n8n.your-domain.com/api/v1/workflows/{id}/activate \
  -H "X-N8N-API-KEY: your-key"
```

### Step 2: Configure Environment Variables

#### Backend Environment (`backend/.env`)

**Important**: Copy from `backend/env.example` and update values. The `env.example` file includes default values for development infrastructure (PostgreSQL, MinIO, n8n) that connect to `docker-compose.infra.dev.yml` services.

**For Production**: Replace all values with your production infrastructure details.

```bash
# Server Configuration
BACKEND_PORT=3001
BACKEND_HOST=api.your-domain.com
NODE_ENV=production

# Database Configuration
# Production: Use your production PostgreSQL host
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=muse_music
DB_USER=muse_user
DB_PASSWORD=secure-password

# CORS Configuration
FRONTEND_URL=https://your-domain.com

# JWT Configuration (⚠️ REQUIRED - Change in production!)
JWT_SECRET=generate-secure-random-string-here
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth Configuration (⚠️ REQUIRED)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# N8N Email Service Configuration
EMAIL_N8N_USERNAME=your-email-username
EMAIL_N8N_PASSWORD=your-email-password
EMAIL_N8N_WEBHOOK_URL=https://n8n.your-domain.com/webhook/{id}/email

# Analysis/Translate Webhook
TRANSLATE_WEBHOOK=https://n8n.your-domain.com/webhook/{id}/translator
TRANSLATE_TEST_WEBHOOK=https://n8n.your-domain.com/webhook/{id}/translator-test

# N8N Workflow API Configuration
N8N_API_KEY=your-n8n-api-key
N8N_WORKFLOW_URL=https://n8n.your-domain.com/api/v1/workflows/your-workflow-id
N8N_WORKFLOW_TEST_URL=https://n8n.your-domain.com/api/v1/workflows/your-test-workflow-id

# LRCLIB (Lyrics) Configuration (has defaults, optional)
LRCLIB_BASE_URL=https://lrclib.net
LRCLIB_USER_AGENT=MUSE-MUSIC Backend (https://github.com/your-org/MUSE-MUSIC)

# MinIO Configuration (⚠️ REQUIRED)
# Production: Use your production MinIO endpoint
MINIO_ENDPOINT=minio.your-domain.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-minio-access-key
MINIO_SECRET_KEY=your-minio-secret-key
MINIO_BUCKET_NAME=muse-music
MINIO_PUBLIC_URL=https://minio.your-domain.com

# YouTube Data API v3 Configuration (⚠️ REQUIRED)
YOUTUBE_API_KEY=your-youtube-api-key
```

**Note**: The health check endpoint (`/api/health`) will report missing required environment variables. All external API configurations marked with ⚠️ REQUIRED must be set for the system to function properly.

#### Frontend Environment (`frontend/.env.local`)

**Important**: Copy from `frontend/env.example` and update values

```bash
# Frontend Configuration
NEXT_PUBLIC_PORT=3000
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_NODE_ENV=production

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Step 3: Setup Jenkins Shared Library (Optional)

**Note**: This project uses a Jenkins Shared Library for reusable functions.

#### 3.1 Create Shared Library Repository
```groovy
// vars/notifyN8N.groovy
def call(String status, String message) {
    // Send notification to N8N webhook
    // Implementation depends on your N8N webhook setup
}

// vars/deployToCoolify.groovy
def call(String projectName, String uuidVar, String tokenVar, String baseUrlVar) {
    def uuid = env[uuidVar]
    def token = credentials(tokenVar)
    def baseUrl = env[baseUrlVar]
    
    sh """
        curl -X POST ${baseUrl}/webhooks/${uuid} \
          -H "Authorization: Bearer ${token}"
    """
}
```

#### 3.2 Configure Shared Library in Jenkins
```bash
# Jenkins → Manage Jenkins → Configure System → Global Pipeline Libraries
Name: my-shared-lib
Default version: main
Retrieval method: Modern SCM
Source Code Management: Git
Project Repository: https://github.com/your-org/jenkins-shared-lib
```

### Step 4: Configure Jenkins

#### 4.1 Jenkins Environment Variables
```bash
# In Jenkins → Manage Jenkins → Configure System → Global Properties
COOLIFY_UUID_MUSEMUSIC=production-uuid-here
COOLIFY_UUID_MUSEMUSIC_DEV=development-uuid-here
COOLIFY_TOKEN=your-coolify-api-token
COOLIFY_BASEURL=https://coolify.your-domain.com
```

#### 4.2 Jenkins NodeJS Installation
```bash
# Jenkins → Manage Jenkins → Global Tool Configuration → NodeJS
Name: NodeJS_24
Version: NodeJS 24.x
Install automatically: Yes
```

#### 4.3 Jenkins Credentials
```bash
# Add GitHub token
# Jenkins → Credentials → Add Credentials
- Type: Secret text
- ID: github-token
- Secret: your-github-personal-access-token
```

#### 4.4 PostgreSQL for Integration Tests (Optional)
```bash
# If you want Jenkins to run backend integration tests:
# Install PostgreSQL on Jenkins server
sudo apt install postgresql postgresql-contrib

# Create test database
sudo -u postgres psql -c "CREATE USER test_user WITH PASSWORD 'test_password';"
sudo -u postgres psql -c "CREATE DATABASE test_db OWNER test_user;"
```

### Step 5: Configure Coolify

#### 5.1 Create Coolify Projects
```bash
# Via Coolify UI:
1. Create new project: "MUSE Music Production"
2. Create new project: "MUSE Music Development"

# For each project:
- Set up GitHub repository connection
- Configure branch (main for prod, develop for dev)
- Set environment variables (copy from .env files)
- Configure domains:
  - Production: your-domain.com, api.your-domain.com
  - Development: dev.your-domain.com, api-dev.your-domain.com
```

#### 5.2 Configure Webhooks
```bash
# Get webhook URLs from Coolify:
Production: https://coolify.your-domain.com/webhooks/{production-uuid}
Development: https://coolify.your-domain.com/webhooks/{development-uuid}

# These will be called by Jenkins after successful build
```

#### 5.3 Docker Compose Configuration (Optional)

**Note**: The project includes three docker-compose files for different purposes:
- `docker-compose.infra.dev.yml` - Infrastructure services (PostgreSQL, MinIO, n8n) for local development
- `docker-compose.dev.yml` - Full stack (backend + frontend containers) for development
- `docker-compose.prod.yml` - Production setup

**Infrastructure Services** (`docker-compose.infra.dev.yml`):
```yaml
# Services:
# - PostgreSQL: 7770:5432
# - MinIO API: 7771:9000
# - MinIO Console: 7772:9001
# - N8N: 7773:5678
# Network: muse-network-dev (bridge)
# 
# Note: Database migrations run automatically on first startup
# via docker-entrypoint-initdb.d
```

**Development** (`docker-compose.dev.yml`):
```yaml
# Ports: 
# - Frontend: 7664:3000
# - Backend: 7665:3001
# Network: muse-network-dev (external, must exist)
# 
# Note: Requires infrastructure services to be running first
# (via docker-compose.infra.dev.yml)
```

**Production** (`docker-compose.prod.yml`):
```yaml
# Ports:
# - Frontend: 7661:3000
# - Backend: 7662:3001
# Network: muse-network (bridge)
```

**Usage**:
```bash
# 1. Start infrastructure services (for local development)
docker-compose -f docker-compose.infra.dev.yml up -d

# 2. Start application services (requires infrastructure)
docker-compose -f docker-compose.dev.yml up -d

# Production (full stack)
docker-compose -f docker-compose.prod.yml up -d
```

**Note**: These docker-compose files are for reference only. Coolify handles the actual production deployment. For local development, it's recommended to use `npm run dev` with infrastructure services in Docker.

### Step 6: Run Database Migrations

```bash
# SSH to backend server or run locally
cd backend
npm run migrate:prod

# Verify tables created
psql -h your-host -U muse_user -d muse_music -c "\dt"
```

### Step 7: Deploy!

#### For v1.3.0 Release:

```bash
# 1. Ensure you're on develop branch
git checkout develop
git pull origin develop

# 2. Merge to main
git checkout main
git pull origin main
git merge develop --no-ff -m "Release v1.3.0: Merge develop to main"

# 3. Push to main (triggers Jenkins)
git push origin main

# 4. Create and push tag
git tag -a 1.3.0 -m "Release v1.3.0 - Seamless Journey ✨

56 new features, 33 bug fixes, 265 commits since v1.2.0

Key features:
- YouTube Transcript Integration (auto-fetch lyrics)
- Fullscreen Player Enhancements (real-time updates)
- Favorites & History System (complete tracking)
- Privacy & Legal Pages (Terms + Privacy Policy)
- 15 Architecture Diagrams (7,566 lines)
- Performance optimizations and infinite scroll
"
git push origin 1.3.0

# 5. Monitor Jenkins
# - Watch build progress
# - Check test results
# - Wait for Coolify deployment

# 6. Verify deployment
curl https://api.your-domain.com/health
curl https://your-domain.com

# 7. Test critical features
# - Login/Authentication
# - Song analysis
# - Rating system
# - Social sharing
```

---

## 🔍 Monitoring & Troubleshooting

### Health Checks

#### Backend Health Check
```bash
curl https://api.your-domain.com/api/health

# Expected response (all configurations complete):
{
  "status": "ok",
  "message": "MUSE Music API is running",
  "timestamp": "2025-11-12T...",
  "uptime": 12345,
  "environment": "production",
  "version": "1.0.0",
  "database": true,
  "externalApis": {
    "configured": {
      "jwt": { "name": "JWT Authentication", "vars": ["JWT_SECRET"] },
      "googleOAuth": { "name": "Google OAuth", "vars": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
      "youtube": { "name": "YouTube API", "vars": ["YOUTUBE_API_KEY"] },
      "minio": { "name": "MinIO Storage", "vars": ["MINIO_ENDPOINT", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY"] },
      "n8nWorkflow": { "name": "N8N Workflow", "vars": ["N8N_API_KEY", "N8N_WORKFLOW_URL"] }
    },
    "missing": [],
    "summary": {
      "total": 6,
      "configured": 6,
      "missing": 0,
      "missingRequired": 0
    }
  }
}

# Response when configurations are missing:
{
  "status": "WARNING",
  "message": "API running but 3 required external API configuration(s) are missing. System will not function completely.",
  "database": true,
  "externalApis": {
    "configured": { ... },
    "missing": [
      {
        "service": "Google OAuth",
        "missingVariables": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
        "affectedFeatures": ["Google login", "Social authentication", "User registration via Google"]
      },
      ...
    ],
    "summary": {
      "total": 6,
      "configured": 3,
      "missing": 3,
      "missingRequired": 3
    }
  }
}
```

**Note**: The frontend will display a warning modal on initial load if external API configurations are incomplete, showing which features will not work.

#### Frontend Health Check
```bash
curl -I https://your-domain.com

# Expected: HTTP 200 OK
```

### Common Issues

#### 1. Jenkins Build Fails
```bash
# Check Jenkins console output
# Common causes:
- Test failures → Check test logs
- Linting errors → Run npm run lint locally
- Network issues → Check Jenkins network access
- Environment variables → Verify Jenkins env vars

# Fix and push again
git commit --amend
git push origin main
```

#### 2. Coolify Deployment Fails
```bash
# Check Coolify logs
# Common causes:
- Environment variables missing → Check Coolify env settings
- Database connection failed → Verify DB credentials
- Port conflicts → Check port configurations
- Resource limits → Check server resources

# Redeploy manually via Coolify UI
```

#### 3. N8N Translation Fails
```bash
# Check N8N execution log
# Common causes:
- Workflow not activated → Activate workflow
- AI model not loaded → Check Ollama/OpenRouter
- Invalid input format → Verify JSON structure
- API key invalid → Check N8N API key

# Test webhook directly:
curl -X POST https://n8n.your-domain.com/webhook/{id}/translator \
  -H "Content-Type: application/json" \
  -d '{
    "language1": "Thai",
    "language2": "English",
    "lyrics": "test lyrics",
    "moodEnabled": true,
    "moodTopK": 4
  }'
```

#### 4. Database Connection Issues
```bash
# Test connection
psql -h your-host -U muse_user -d muse_music

# Check connection pool
# In backend logs, look for:
- "Database connected" ✅
- "Connection refused" ❌
- "Authentication failed" ❌

# Fix:
- Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
- Check firewall rules
- Verify database is running
```

### Rollback Procedure

If deployment fails:

```bash
# Option 1: Quick rollback via Coolify
# - Go to Coolify UI
# - Select previous deployment
# - Click "Redeploy"

# Option 2: Git rollback
git checkout main
git reset --hard 1.1.0  # Previous version
git push origin main --force

# Option 3: Database rollback (if needed)
psql -h your-host -U muse_user -d muse_music < backup_YYYYMMDD_HHMMSS.sql
```

---

## 📊 Resource Requirements Summary

### Minimum Production Setup

| Service | RAM | CPU | Storage | Network |
|---------|-----|-----|---------|---------|
| **Frontend** | 512 MB | 0.5 core | 2 GB | 100 Mbps |
| **Backend** | 1 GB | 1 core | 5 GB | 100 Mbps |
| **PostgreSQL** | 2 GB | 2 cores | 20 GB SSD | 100 Mbps |
| **MinIO** | 2 GB | 1 core | 50 GB | 1 Gbps |
| **N8N** | 1 GB | 1 core | 10 GB | 100 Mbps |
| **Ollama** | 8 GB | 4 cores | 50 GB | 100 Mbps |
| **Jenkins** | 4 GB | 2 cores | 50 GB | 100 Mbps |
| **Coolify** | 2 GB | 2 cores | 20 GB | 100 Mbps |
| **Total** | **~20 GB** | **~14 cores** | **~200 GB** | |

### Recommended Production Setup

| Service | RAM | CPU | Storage | Notes |
|---------|-----|-----|---------|-------|
| **Application Servers** | 8 GB | 4 cores | 50 GB | Frontend + Backend |
| **Database** | 8 GB | 4 cores | 100 GB SSD | With backups |
| **Object Storage** | 4 GB | 2 cores | 500 GB | High traffic |
| **N8N + Ollama** | 16 GB | 8 cores | 100 GB | With GPU for AI |
| **CI/CD (Jenkins)** | 8 GB | 4 cores | 100 GB | Separate server |
| **Total** | **~44 GB** | **~22 cores** | **~850 GB** | |

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] All infrastructure services running and healthy
- [ ] Environment variables configured
- [ ] Database backups completed
- [ ] Tests passing (292/298, 98%)
- [ ] Code reviewed and approved
- [ ] Release notes prepared

### Deployment
- [ ] Merge develop → main
- [ ] Create and push tag (e.g., 1.2.0)
- [ ] Jenkins pipeline passes
- [ ] Coolify deployment successful
- [ ] Database migrations applied

### Post-Deployment
- [ ] Health checks passing
- [ ] Critical features tested
- [ ] Logs monitored (no errors)
- [ ] Performance metrics normal
- [ ] Team notified
- [ ] Documentation updated

---

## 📞 Support & Contacts

- **Technical Issues**: Development Team
- **Infrastructure**: DevOps Team
- **CI/CD Pipeline**: Jenkins Admin
- **Database**: DBA Team
- **Monitoring**: SRE Team

---

**Last Updated**: 2025-11-12  
**Version**: 1.0  
**Maintained by**: MUSE Music DevOps Team

