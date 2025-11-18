# 🚀 Deployment Guide - Number Guessing Game

## 📦 GitHub Repository Setup

### Option 1: Using GitHub Web Interface (Easiest)

1. **Go to GitHub** and sign in to your account
2. **Click the "+" icon** in the top-right corner → Select "New repository"
3. **Fill in repository details**:
   - Repository name: `number-guessing-game` (or your preferred name)
   - Description: "Real-time two-player number guessing game with WebSocket support"
   - Visibility: Public (or Private)
   - **DO NOT** check "Initialize this repository with a README" (we already have one)
4. **Click "Create repository"**

5. **Copy the repository URL** shown on the next page (it will look like: `https://github.com/YOUR_USERNAME/number-guessing-game.git`)

6. **Return to your terminal** and run these commands:

```bash
# Add the GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/number-guessing-game.git

# Push your code to GitHub
git push -u origin master
```

### Option 2: Using GitHub CLI (gh)

If you have GitHub CLI installed:

```bash
# Create repository and push in one go
gh repo create number-guessing-game --public --source=. --remote=origin --push
```

---

## ☁️ Deploy to Hosting Platform

### Option 1: Deploy to Render (Recommended - Free Tier Available)

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +"** → Select **"Web Service"**
3. **Connect your GitHub repository**:
   - Click "Connect account" if needed
   - Select your `number-guessing-game` repository
4. **Configure the service**:
   - **Name**: `number-guessing-game` (or your preference)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. **Click "Create Web Service"**
6. **Wait for deployment** (2-3 minutes)
7. **Get your live URL**: Render will provide a URL like `https://number-guessing-game.onrender.com`

**Note**: Render's free tier may spin down after inactivity - first request might take 30 seconds.

---

### Option 2: Deploy to Railway (Easy & Fast)

1. **Go to [Railway.app](https://railway.app)** and sign up/login
2. **Click "New Project"** → **"Deploy from GitHub repo"**
3. **Select your repository**: `number-guessing-game`
4. Railway will automatically:
   - Detect it's a Node.js app
   - Run `npm install`
   - Run `npm start`
   - Assign a public URL
5. **Get your URL**: Click on your deployment → "Settings" → "Generate Domain"
6. **Your game is live!** 🎉

---

### Option 3: Deploy to Heroku

**Prerequisites**: Install Heroku CLI from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-game-name

# Push code to Heroku
git push heroku master

# Open your deployed app
heroku open
```

Your game will be live at: `https://your-game-name.herokuapp.com`

---

### Option 4: Deploy to Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel
```

3. **Follow the prompts** and your app will be deployed instantly!

---

## 🔧 Environment Configuration

All hosting platforms automatically set the `PORT` environment variable. No manual configuration needed!

If you need to add environment variables:

### Render
- Go to your service → "Environment" → Add variables

### Railway  
- Go to your project → "Variables" → Add variables

### Heroku
```bash
heroku config:set VARIABLE_NAME=value
```

---

## 📊 Verify Deployment

After deployment, test your game:

1. ✅ Open the live URL in your browser
2. ✅ Click "Create New Session"
3. ✅ Open the same URL in an incognito window
4. ✅ Join the session with the code
5. ✅ Play a complete game to test all features

---

## 🐛 Troubleshooting

### Build Failed
- Check Node.js version compatibility in `package.json` (currently set to >=10.0.0)
- Ensure all dependencies are listed in `package.json`
- Check build logs for specific errors

### App Not Loading
- Verify the `PORT` environment variable is being used
- Check if the server is listening on `0.0.0.0` not just `localhost`
- Review application logs in your hosting platform

### WebSocket Issues
- Ensure hosting platform supports WebSocket connections
- All platforms mentioned above support WebSockets by default

---

## 📈 Scaling for Production

For production-level traffic:

1. **Use Redis for session storage** (instead of in-memory)
   ```bash
   npm install redis socket.io-redis
   ```

2. **Enable Socket.IO Redis Adapter** for multiple instances
   ```javascript
   const redisAdapter = require('socket.io-redis');
   io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
   ```

3. **Add monitoring**: Use tools like:
   - Sentry for error tracking
   - LogRocket for user session replay
   - New Relic for performance monitoring

4. **Add rate limiting**: Prevent abuse
   ```bash
   npm install express-rate-limit
   ```

---

## 🔐 Security Best Practices

For production deployment:

- Add rate limiting to prevent DDoS
- Implement session cleanup for abandoned games
- Add CORS configuration if needed
- Use environment variables for sensitive data
- Enable HTTPS (automatic on all mentioned platforms)

---

## 📝 Next Steps

After successful deployment:

- ✅ Share the live URL with friends to test
- ✅ Monitor application logs for errors
- ✅ Set up custom domain (optional)
- ✅ Add analytics to track usage
- ✅ Gather user feedback for improvements

---

## 🎯 Quick Reference Commands

```bash
# Check git status
git status

# View commit history
git log --oneline

# Push new changes
git add .
git commit -m "Your commit message"
git push origin master

# View remote repository
git remote -v

# Pull latest changes
git pull origin master
```

---

**Need help?** Check the README.md file or create an issue on GitHub!

Happy Gaming! 🎮
