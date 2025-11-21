# Environment Variables Setup

## For Local Development

Create a `.env.local` file in the root directory with the following variables:

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-spreadsheet-id-here
```

## For Vercel Deployment

Add these same variables in Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add each variable for Production, Preview, and Development environments

### Important Notes:

- **GOOGLE_PRIVATE_KEY**: Must include the entire key with BEGIN/END markers and `\n` characters
- **GOOGLE_SERVICE_ACCOUNT_EMAIL**: The email from your Google Cloud Service Account JSON
- **GOOGLE_SHEET_ID**: Extract from your Google Sheet URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

## How to Get These Values:

1. **Google Cloud Console**:
   - Create a Service Account
   - Download the JSON key file
   - Extract `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Extract `private_key` → `GOOGLE_PRIVATE_KEY` (keep quotes and `\n`)

2. **Google Sheet**:
   - Share the sheet with the service account email (Editor access)
   - Copy the Sheet ID from the URL

3. **Never commit `.env.local` to Git!** (Already in `.gitignore`)

