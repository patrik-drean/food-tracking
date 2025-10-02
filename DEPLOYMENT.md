# Deployment Guide

## Railway Backend Deployment

The backend is configured to deploy automatically to Railway when you push to the main branch.

### Configuration Files

- `railway.json` - Railway deployment configuration for monorepo
- Backend workspace deployment only

### Environment Variables

Set these in your Railway project dashboard:

```bash
# Required
DATABASE_URL=<automatically-provided-by-railway-postgresql>
NODE_ENV=production

# Optional
FRONTEND_URL=https://patrik-drean.github.io/food-tracking
PORT=<automatically-assigned-by-railway>
```

### Railway Setup Process

1. **Connect GitHub Repository**
   - Link your GitHub repo to Railway
   - Railway will detect the Node.js monorepo

2. **Add PostgreSQL Service**
   - Railway will automatically set `DATABASE_URL`
   - Database migrations run automatically on first deploy

3. **Configure Environment Variables**
   - Set `NODE_ENV=production`
   - Set `FRONTEND_URL=https://patrik-drean.github.io/food-tracking` for CORS

4. **Deploy**
   - Push to main branch triggers automatic deployment
   - Railway uses workspace-specific commands:
   - Build: `npm install --workspace=backend && npm run build --workspace=backend`
   - Start: `npm run start --workspace=backend`

### Health Check

Railway will check `/graphql` endpoint for health status.

### Troubleshooting

- **Build fails**: Check that dependencies install correctly in backend workspace
- **Start fails**: Verify `DATABASE_URL` is set and accessible
- **CORS errors**: Ensure `FRONTEND_URL` matches your frontend domain

## GitHub Pages Frontend Deployment

The frontend is configured for automatic static deployment to GitHub Pages via GitHub Actions.

### Setup Steps

1. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Set Source to "GitHub Actions"
   - This enables the workflow in `.github/workflows/deploy-frontend.yml`

2. **Configure Environment Variables**
   - Go to repository Settings > Secrets and variables > Actions
   - Add Repository Variable: `NEXT_PUBLIC_GRAPHQL_ENDPOINT`
   - Set value to your Railway backend URL: `https://your-railway-app.railway.app/graphql`

3. **Automatic Deployment**
   - Push changes to `frontend/**` on main branch
   - GitHub Actions will build and deploy automatically
   - Site will be available at: `https://patrik-drean.github.io/food-tracking`

### Build Configuration

- `.github/workflows/deploy-frontend.yml` - GitHub Actions workflow
- `next.config.js` - Configured for static export with `/food-tracking` base path
- Output directory: `frontend/out`
- Automatic deployment on frontend changes

## Full Stack Deployment Summary

1. **Backend**: Railway (auto-deploy from main branch)
2. **Frontend**: GitHub Pages (auto-deploy from main branch)
3. **Database**: Railway PostgreSQL (managed service)

Both deployments are triggered automatically when you push to the main branch.