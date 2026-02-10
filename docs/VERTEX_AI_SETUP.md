# Vertex AI Setup Guide

You have a GCP project with billing enabled. Here are the remaining steps.

---

## Option A: Using gcloud CLI (Recommended)

### 1. Install gcloud CLI

**Windows** -- download and run the installer:
```
https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
```

Or via PowerShell:
```powershell
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& "$env:Temp\GoogleCloudSDKInstaller.exe"
```

After install, restart your terminal.

### 2. Login and set project

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your actual GCP project ID (visible in the console dashboard).

### 3. Enable required APIs

```bash
gcloud services enable aiplatform.googleapis.com
```

That's the only API needed. It covers:
- Vertex AI embeddings (`text-embedding-005`)
- Vertex AI Gemini (`gemini-2.0-flash-001`)
- All Vertex AI model endpoints

### 4. Create a service account

```bash
gcloud iam service-accounts create zuno-vertex-ai \
  --display-name="Zuno Vertex AI Service Account"
```

### 5. Grant the Vertex AI User role

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:zuno-vertex-ai@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### 6. Download the JSON key

```bash
gcloud iam service-accounts keys create ./vertex-ai-key.json \
  --iam-account=zuno-vertex-ai@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

This creates `vertex-ai-key.json` in your current directory.

### 7. Move the key to your backend

```bash
# Move to backend directory (DO NOT commit this file to git)
mv vertex-ai-key.json backend/vertex-ai-key.json
```

Make sure `vertex-ai-key.json` is in your `.gitignore` (it already should be -- service account keys must never be committed).

---

## Option B: Using Google Cloud Console (Browser)

### 1. Enable Vertex AI API

1. Go to: https://console.cloud.google.com/apis/enableflow?apiid=aiplatform.googleapis.com
2. Select your project
3. Click **Enable**

### 2. Create a service account

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click **+ CREATE SERVICE ACCOUNT**
3. Name: `zuno-vertex-ai`
4. Click **CREATE AND CONTINUE**
5. Role: search and select **Vertex AI User** (`roles/aiplatform.user`)
6. Click **DONE**

### 3. Download the JSON key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **ADD KEY** > **Create new key**
4. Select **JSON**
5. Click **CREATE** -- the file downloads automatically
6. Move it to `backend/vertex-ai-key.json`

---

## Configure your .env

Open `backend/.env` and add these lines:

```env
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GCP_CREDENTIALS_JSON=vertex-ai-key.json
VERTEX_EMBEDDING_MODEL=text-embedding-005
VERTEX_LLM_MODEL=gemini-2.0-flash-001
```

| Variable | Value | Notes |
|---|---|---|
| `GCP_PROJECT_ID` | Your GCP project ID | Found at top of Cloud Console |
| `GCP_LOCATION` | `us-central1` | Best availability for Vertex AI |
| `GCP_CREDENTIALS_JSON` | `vertex-ai-key.json` | Relative path to the JSON key file |
| `VERTEX_EMBEDDING_MODEL` | `text-embedding-005` | Latest embedding model (768 dims) |
| `VERTEX_LLM_MODEL` | `gemini-2.0-flash-001` | Fast + cheap Gemini model |

---

## Install the Python dependency

```bash
cd backend
pip install google-cloud-aiplatform>=1.60.0
```

---

## Verify it works

```bash
cd backend
python -c "
import vertexai
from google.oauth2 import service_account

creds = service_account.Credentials.from_service_account_file('vertex-ai-key.json')
vertexai.init(project='YOUR_PROJECT_ID', location='us-central1', credentials=creds)

from vertexai.language_models import TextEmbeddingModel
model = TextEmbeddingModel.from_pretrained('text-embedding-005')
result = model.get_embeddings(['Hello world'])
print(f'Embedding dimensions: {len(result[0].values)}')
print('Vertex AI is working!')
"
```

Expected output:
```
Embedding dimensions: 768
Vertex AI is working!
```

---

## Run the database migrations

Apply the migrations to your Supabase database:

```bash
supabase db push
```

Or manually run these SQL files via the Supabase SQL Editor (in order):
1. `supabase/migrations/20260210000000_knowledge_engine.sql` — creates `content_chunks` table and `match_chunks` RPC
2. `supabase/migrations/20260210100000_embedding_768.sql` — changes `content.embedding` from 1536 to 768 dims and updates `hybrid_search`

---

## Security checklist

- [ ] `vertex-ai-key.json` is in `.gitignore`
- [ ] Service account has only `Vertex AI User` role (principle of least privilege)
- [ ] API key is not exposed in any frontend code
- [ ] `.env` file is in `.gitignore`

---

## Summary

| Step | CLI Command | What it does |
|---|---|---|
| Enable API | `gcloud services enable aiplatform.googleapis.com` | Turns on Vertex AI |
| Create SA | `gcloud iam service-accounts create zuno-vertex-ai` | Creates service account |
| Grant role | `gcloud projects add-iam-policy-binding ...` | Gives SA permission to use Vertex AI |
| Get key | `gcloud iam service-accounts keys create ...` | Downloads JSON credentials |
| Configure | Edit `.env` | Points your app at the key |
| Install | `pip install google-cloud-aiplatform` | Installs the SDK |
| Migrate DB | `supabase db push` | Creates content_chunks table |
