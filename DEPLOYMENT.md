# Deployment Guide

This guide will walk you through deploying your HR Analytics Dashboard to Vercel.

## Prerequisites

- Your code pushed to GitHub
- A Vercel account (free tier is sufficient)
- Your Google Service Account credentials ready

## Step 1: Create GitHub Repository

If you haven't already created a GitHub repository:

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Repository details:
   - **Owner**: AdminRHS
   - **Repository name**: `employees-attendance-dashboard`
   - **Description**: "HR Analytics Dashboard with Google Sheets integration"
   - **Visibility**: Public or Private (your choice)
   - **Do NOT** initialize with README (we already have one)

4. Click "Create repository"

5. Push your code to GitHub:

```bash
# Navigate to your project directory
cd "/Users/nikolay/Library/CloudStorage/Dropbox/Nov25/AI/Artemchuk Nikolay/Employees attendance/hr-dashboard"

# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "feat: Complete MVP with analytics, charts, pagination, and filters"

# Add GitHub remote (use the URL from your newly created repo)
git remote add origin https://github.com/AdminRHS/employees-attendance-dashboard.git

# Push to GitHub
git push -u origin main
```

**Note**: If you encounter authentication errors, you may need to:
- Use a Personal Access Token (PAT) instead of password
- Set up SSH keys for GitHub

### Creating a Personal Access Token (if needed):

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "HR Dashboard Deployment"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy the token immediately (you won't see it again!)
7. When pushing, use the token as your password

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com) and sign in (use GitHub to sign in for easier integration)

2. Click "Add New..." > "Project"

3. Import your GitHub repository:
   - If this is your first time, you'll need to authorize Vercel to access your GitHub account
   - Find `employees-attendance-dashboard` in the list
   - Click "Import"

4. Configure your project:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

5. **Add Environment Variables** (CRITICAL):

   Click "Environment Variables" and add these three variables:

   | Name | Value |
   |------|-------|
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Your service account email |
   | `GOOGLE_PRIVATE_KEY` | Your full private key (including BEGIN/END markers) |
   | `GOOGLE_SHEET_ID` | Your spreadsheet ID |

   **Important Notes**:
   - For `GOOGLE_PRIVATE_KEY`: Copy the entire key from your `.env.local` file, INCLUDING the quotes
   - Make sure the `\n` characters are preserved
   - All three variables should be available for Production, Preview, and Development

6. Click "Deploy"

7. Wait for deployment (usually 2-3 minutes)

8. Once deployed, Vercel will give you a URL: `https://your-project-name.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from your project directory)
cd "/Users/nikolay/Library/CloudStorage/Dropbox/Nov25/AI/Artemchuk Nikolay/Employees attendance/hr-dashboard"
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? employees-attendance-dashboard
# - In which directory is your code located? ./
# - Want to modify settings? No

# Add environment variables
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel env add GOOGLE_SHEET_ID

# Deploy to production
vercel --prod
```

## Step 3: Verify Deployment

1. Visit your deployed URL: `https://your-project-name.vercel.app`

2. Check that:
   - The page loads without errors
   - KPI cards show correct numbers
   - The data table displays records from your Google Sheet
   - Charts render properly
   - Filters and pagination work
   - Export CSV button works

3. If you see errors:
   - Check the Vercel deployment logs
   - Verify your environment variables are correct
   - Ensure your Google Service Account has access to the sheet
   - Check that the sheet tab is named exactly `Merged_report`

## Step 4: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Troubleshooting

### Error: "Missing Google Sheets credentials"

**Solution**: Check that all three environment variables are set in Vercel:
1. Go to your project in Vercel Dashboard
2. Settings > Environment Variables
3. Verify `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `GOOGLE_SHEET_ID` are present
4. If missing, add them and redeploy

### Error: "Failed to fetch reports"

**Possible causes**:
1. Service account doesn't have access to the Google Sheet
2. Google Sheets API not enabled in Google Cloud Console
3. Wrong spreadsheet ID
4. Sheet tab not named `Merged_report`

**Solution**:
1. Verify the service account email has Editor access to your Google Sheet
2. Check Google Cloud Console that the Sheets API is enabled
3. Double-check the spreadsheet ID in your environment variables
4. Ensure the sheet tab name matches exactly (case-sensitive)

### Charts not displaying

**Solution**: This is usually a build-time issue with Tremor components.
1. Clear Vercel cache: Settings > General > Clear Cache
2. Redeploy: Deployments > (latest) > Redeploy

### Environment variables not working after update

**Solution**:
1. Environment variable changes require a redeploy
2. Go to Deployments tab
3. Click on the latest deployment
4. Click "Redeploy"

## Continuous Deployment

Once set up, Vercel will automatically:
- Deploy every push to `main` branch to production
- Create preview deployments for pull requests
- Run build checks before deployment

To trigger a new deployment:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically detect the push and deploy your changes.

## Monitoring and Analytics

### View Deployment Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on any deployment to view logs

### View Runtime Logs

1. In Vercel Dashboard, go to your project
2. Click "Logs" tab
3. View real-time logs and errors

### Performance Monitoring

Vercel provides built-in analytics:
1. Go to your project in Vercel Dashboard
2. Click "Analytics" tab
3. View page views, unique visitors, and performance metrics

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. Rotate your Google Service Account keys periodically
3. Use Vercel's environment variable encryption (automatic)
4. Monitor your Google Cloud Console for unusual API usage
5. Set up alerts in Google Cloud Console for API quota limits

## Cost Considerations

**Vercel Free Tier Limits**:
- 100 GB bandwidth per month
- Unlimited deployments
- Unlimited team members
- 100 GB-hours of serverless function execution

For a typical HR dashboard with moderate usage (100-200 users/day), the free tier should be sufficient.

**Google Sheets API Free Tier**:
- 60 read requests per minute per user
- 300 read requests per minute per project

Monitor usage in Google Cloud Console to ensure you stay within limits.

## Updating Your Deployment

### Method 1: Git Push (Automatic)
```bash
# Make your changes
# Commit and push
git add .
git commit -m "Update: your change description"
git push origin main
```

### Method 2: Vercel Dashboard (Manual)
1. Make changes locally
2. Push to GitHub
3. Vercel auto-deploys

### Method 3: Vercel CLI
```bash
vercel --prod
```

## Rollback to Previous Version

If something goes wrong:
1. Go to Vercel Dashboard > Deployments
2. Find a working deployment
3. Click "..." menu > "Promote to Production"

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Google Sheets API Quotas](https://developers.google.com/sheets/api/limits)
- [Troubleshooting Vercel Deployments](https://vercel.com/docs/deployments/troubleshoot-a-build)

---

**Need Help?**

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables
4. Review the Troubleshooting section in README.md
5. Check Google Cloud Console for API errors

Last Updated: November 2025
