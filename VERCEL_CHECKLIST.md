# ✅ Vercel Deployment Checklist

## Pre-Deployment

- [ ] Code pushed to GitHub repository (`employees-attendance-dashboard`)
- [ ] All dependencies installed locally (`npm install`)
- [ ] Project builds successfully (`npm run build`)
- [ ] Local development works (`npm run dev`)

## Vercel Account Setup

- [ ] Created Vercel account (or logged in)
- [ ] Connected GitHub account to Vercel

## Project Deployment

- [ ] Imported GitHub repository in Vercel Dashboard
- [ ] Selected `employees-attendance-dashboard` repository
- [ ] Framework auto-detected as Next.js ✅
- [ ] Root Directory: `./` ✅
- [ ] Build Command: `npm run build` ✅
- [ ] Output Directory: `.next` ✅

## Environment Variables (CRITICAL!)

Add these in Vercel Dashboard → Settings → Environment Variables:

- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` (Production, Preview, Development)
- [ ] `GOOGLE_PRIVATE_KEY` (Production, Preview, Development) - **with quotes and \n**
- [ ] `GOOGLE_SHEET_ID` (Production, Preview, Development)

**Important**: Copy values from your `.env.local` file (if you have one) or from Google Cloud Console.

## Deploy

- [ ] Clicked "Deploy" button
- [ ] Waited for build to complete (2-3 minutes)
- [ ] Deployment successful ✅

## Post-Deployment Verification

- [ ] Dashboard loads at `https://your-project-name.vercel.app`
- [ ] No console errors in browser
- [ ] KPI cards display correct numbers
- [ ] Employee cards/data loads from Google Sheets
- [ ] Heatmap calendar renders
- [ ] Leaderboard shows top performers
- [ ] Refresh button works
- [ ] Mobile responsive design works

## Troubleshooting

If something doesn't work:

- [ ] Check Vercel deployment logs
- [ ] Verify all 3 environment variables are set correctly
- [ ] Ensure Google Service Account has Editor access to the sheet
- [ ] Check that sheet tab is named `Merged_report` (case-sensitive)
- [ ] Verify Google Sheets API is enabled in Google Cloud Console

## Deployment Methods

### Method 1: Vercel Dashboard (Recommended for first time)
Дивись вище ↑

### Method 2: Vercel CLI
```bash
# 1. Login
vercel login

# 2. Link project (first time)
vercel link

# 3. Add environment variables
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel env add GOOGLE_SHEET_ID

# 4. Deploy
vercel --prod
```
Детальніше: `DEPLOY_VIA_CLI.md`

### Method 3: Deployment Script
```bash
# Make executable (first time)
chmod +x deploy.sh

# Deploy to preview
./deploy.sh

# Deploy to production
./deploy.sh --prod
```

### Method 4: GitHub Actions (Automatic)
1. Додай secrets в GitHub:
   - `VERCEL_TOKEN` - отримай з https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - знайди в Vercel Dashboard → Settings → General
   - `VERCEL_PROJECT_ID` - після першого deployment через Dashboard
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`

2. Push на `main` - автоматично задеплоїться!

## Quick Commands

```bash
# Local development
npm run dev

# Build locally
npm run build

# Test production build locally
npm run build && npm start

# Deploy via CLI
vercel --prod

# Deploy via script
./deploy.sh --prod
```

---

**Need help?** 
- Dashboard: `DEPLOYMENT.md`
- CLI: `DEPLOY_VIA_CLI.md`
- Environment: `ENV_SETUP.md`

