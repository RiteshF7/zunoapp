# Vertex AI Setup Guide

You have a GCP project with billing enabled. Here are the remaining steps.

---

## Option A: Using gcloud CLI (Recommended)

### 1. Install gcloud CLI

See: https://cloud.google.com/sdk/docs/install

### 2. Login and set project

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 3. Enable required APIs

```bash
gcloud services enable aiplatform.googleapis.com
```

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

Store the key in this directory. Never commit it to git.

---

## Configure your .env

Open `.env` and add:

```env
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GCP_CREDENTIALS_JSON=vertex-ai-key.json
VERTEX_EMBEDDING_MODEL=text-embedding-005
VERTEX_LLM_MODEL=gemini-2.0-flash-001
```

---

## Install the Python dependency

```bash
pip install google-cloud-aiplatform>=1.60.0
```

---

## Run database migrations

```bash
./scripts/supabase-push-dev.sh   # or supabase-push.sh for prod
```

---

## Security checklist

- [ ] `vertex-ai-key.json` is in `.gitignore`
- [ ] `.env` is in `.gitignore`
- [ ] Service account has only `Vertex AI User` role
