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

## Quick Commands

```bash
# Local development
npm run dev

# Build locally
npm run build

# Test production build locally
npm run build && npm start

# Deploy via CLI (alternative)
vercel --prod
```

---

**Need help?** Check `DEPLOYMENT.md` for detailed instructions.

