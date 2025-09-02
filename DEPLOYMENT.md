# Deployment Guide - Zim Coolant Website

This guide will walk you through deploying your Zim Coolant website to various platforms.

## 🚀 Quick Deploy to Vercel (Recommended)

### 1. Prepare Your Repository
- Push your code to GitHub, GitLab, or Bitbucket
- Ensure all environment variables are documented

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your repository
4. Configure environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```
5. Click "Deploy"

Your site will be live in minutes with automatic deployments on every push!

## 🌐 Deploy to Netlify

### 1. Build Locally
```bash
npm run build
npm run export  # If using static export
```

### 2. Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `out` folder
3. Or connect your Git repository
4. Set environment variables in Site Settings > Environment Variables

## 🐳 Deploy with Docker

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Build and Run
```bash
docker build -t zim-coolant .
docker run -p 3000:3000 zim-coolant
```

## ☁️ Deploy to AWS

### 1. AWS Amplify
1. Install AWS CLI and configure
2. Create new app in AWS Amplify Console
3. Connect your repository
4. Set environment variables
5. Deploy automatically

### 2. AWS S3 + CloudFront
1. Build your project: `npm run build`
2. Upload `out` folder to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain (optional)

## 🔧 Environment Variables

Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📱 Custom Domain Setup

### 1. DNS Configuration
- Add CNAME record pointing to your deployment URL
- Wait for DNS propagation (up to 48 hours)

### 2. SSL Certificate
- Most platforms provide automatic SSL
- For custom setups, use Let's Encrypt

## 🔍 Post-Deployment Checklist

- [ ] Test all pages and functionality
- [ ] Verify mobile responsiveness
- [ ] Check form submissions
- [ ] Test cart functionality
- [ ] Verify Supabase connection
- [ ] Check loading performance
- [ ] Test on different browsers
- [ ] Verify SEO meta tags

## 🚨 Common Issues

### Build Errors
- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Check TypeScript compilation

### Environment Variables
- Ensure variables start with `NEXT_PUBLIC_`
- Check for typos in variable names
- Verify Supabase credentials

### Performance Issues
- Optimize images
- Enable compression
- Use CDN for static assets

## 📊 Monitoring

### 1. Analytics
- Google Analytics
- Vercel Analytics
- Custom performance monitoring

### 2. Error Tracking
- Sentry
- LogRocket
- Built-in platform monitoring

## 🔄 Continuous Deployment

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

## 🆘 Support

If you encounter issues:
1. Check the platform's documentation
2. Review build logs
3. Verify environment variables
4. Check browser console for errors
5. Contact platform support

## 💡 Pro Tips

- Use staging environments for testing
- Set up automatic backups
- Monitor performance metrics
- Keep dependencies updated
- Use environment-specific configurations
- Set up proper logging and monitoring

---

**Happy Deploying! 🚀**
