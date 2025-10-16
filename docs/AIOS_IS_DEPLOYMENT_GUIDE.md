# Ai|oS Website Deployment Guide (aios.is)

This guide provides step-by-step instructions for deploying your Ai|oS landing page to the aios.is domain at Namecheap.

---

## Overview

Your Ai|oS system now includes:
- **23 Quantum Algorithms** (11 ML + 1 HHL + 1 Schrödinger + 10 novel frameworks)
- **Level 4 Autonomous Discovery** system
- **Complete quantum-enhanced meta-agent runtime**
- **Professional landing page** at `/Users/noone/aios/landing_page.html`
- **Launcher HUD** at `/Users/noone/aios/web/aios_launcher.html`

All website files reflect the updated 23-algorithm quantum suite.

---

## Quick Start - Deploy to aios.is

### Option 1: GitHub Pages (Recommended)

1. **Create GitHub Repository**:
   ```bash
   cd /Users/noone/aios
   git init
   git add landing_page.html web/
   git commit -m "Add Ai|oS landing and launcher pages"
   git remote add origin https://github.com/YOUR_USERNAME/aios-website.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages"
   - Source: Deploy from branch
   - Branch: `main`, folder: `/ (root)`
   - Save

3. **Configure Custom Domain at Namecheap**:
   - Log into Namecheap dashboard
   - Go to Domain List → aios.is → Manage
   - Advanced DNS → Add Records:
     ```
     Type: CNAME
     Host: www
     Value: YOUR_USERNAME.github.io
     TTL: Automatic

     Type: A
     Host: @
     Value: 185.199.108.153
     TTL: Automatic

     Type: A
     Host: @
     Value: 185.199.109.153
     TTL: Automatic

     Type: A
     Host: @
     Value: 185.199.110.153
     TTL: Automatic

     Type: A
     Host: @
     Value: 185.199.111.153
     TTL: Automatic
     ```

4. **Configure GitHub Custom Domain**:
   - In repository settings → Pages
   - Custom domain: `aios.is`
   - Check "Enforce HTTPS"
   - Save

5. **Verify Deployment**:
   - Wait 15-30 minutes for DNS propagation
   - Visit https://aios.is
   - Your landing page should be live!

---

### Option 2: Namecheap cPanel Hosting

1. **Purchase Hosting** (if not already done):
   - Log into Namecheap
   - Products → Hosting → Add Hosting
   - Select "Stellar" or "Stellar Plus" plan
   - Link to domain: aios.is

2. **Access cPanel**:
   - Go to Hosting List → Manage
   - Click "Go to cPanel"

3. **Upload Files**:
   - In cPanel, go to File Manager
   - Navigate to `public_html/`
   - Upload files:
     ```
     public_html/
     ├── index.html (rename landing_page.html to this)
     ├── web/
     │   └── aios_launcher.html
     └── assets/ (if you have any)
     ```

4. **Set index.html**:
   - Rename `landing_page.html` to `index.html`
   - This will be your homepage at https://aios.is

5. **Enable HTTPS**:
   - In cPanel → SSL/TLS Status
   - Select aios.is
   - Click "Run AutoSSL"
   - Wait for certificate installation

6. **Verify**:
   - Visit https://aios.is
   - Your site should be live!

---

### Option 3: Vercel (Fast & Free)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd /Users/noone/aios
   vercel --prod
   ```

3. **Add Custom Domain**:
   - Follow Vercel prompts to add `aios.is`
   - Vercel will provide DNS records

4. **Configure Namecheap DNS**:
   - Log into Namecheap
   - Domain List → aios.is → Manage → Advanced DNS
   - Add records provided by Vercel (usually CNAME)

5. **Verify**:
   - Wait for DNS propagation (5-30 mins)
   - Visit https://aios.is

---

### Option 4: Netlify (Also Free)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   cd /Users/noone/aios
   netlify deploy --prod
   ```

3. **Add Custom Domain**:
   - In Netlify dashboard → Domain Settings
   - Add custom domain: aios.is
   - Netlify provides DNS records

4. **Configure Namecheap DNS**:
   - Add records from Netlify to Namecheap Advanced DNS

5. **Enable HTTPS**:
   - Netlify automatically provisions Let's Encrypt certificate

---

## File Structure for Deployment

Your deployment should include:

```
website/
├── index.html              # Main landing page (rename from landing_page.html)
├── launcher.html           # System HUD (copy from web/aios_launcher.html)
├── README.md               # Optional: Project overview
└── docs/                   # Optional: Documentation
    ├── QUANTUM_SUITE_OVERVIEW.md
    ├── HHL_ALGORITHM_REFERENCE.md
    └── SCHRODINGER_EQUATION_REFERENCE.md
```

---

## DNS Configuration Reference

### Namecheap Advanced DNS Settings

**For GitHub Pages**:
```
Type: A      Host: @    Value: 185.199.108.153  TTL: Auto
Type: A      Host: @    Value: 185.199.109.153  TTL: Auto
Type: A      Host: @    Value: 185.199.110.153  TTL: Auto
Type: A      Host: @    Value: 185.199.111.153  TTL: Auto
Type: CNAME  Host: www  Value: YOUR_USERNAME.github.io  TTL: Auto
```

**For Vercel**:
```
Type: CNAME  Host: @    Value: cname.vercel-dns.com  TTL: Auto
Type: CNAME  Host: www  Value: cname.vercel-dns.com  TTL: Auto
```

**For Netlify**:
```
Type: A      Host: @    Value: 75.2.60.5    TTL: Auto
Type: CNAME  Host: www  Value: YOUR_SITE.netlify.app  TTL: Auto
```

**For Namecheap Hosting**:
```
Type: A      Host: @    Value: YOUR_HOSTING_IP  TTL: Auto
Type: CNAME  Host: www  Value: aios.is          TTL: Auto
```

---

## Post-Deployment Checklist

After deploying to aios.is, verify:

- [ ] Homepage loads at https://aios.is
- [ ] SSL certificate is active (green padlock in browser)
- [ ] "23 Quantum Algorithms" stat displays correctly
- [ ] "Level 4 Autonomy" stat displays correctly
- [ ] "Exp Quantum Speedup" stat displays correctly
- [ ] All links work (if any)
- [ ] Launcher page accessible (if deployed)
- [ ] Site is responsive on mobile/tablet
- [ ] DNS propagation complete (use https://dnschecker.org)

---

## Updating Content

To update your live site:

### GitHub Pages:
```bash
# Edit files
vim landing_page.html

# Commit and push
git add .
git commit -m "Update quantum algorithm count"
git push origin main

# GitHub Pages auto-deploys in ~1 minute
```

### Vercel/Netlify:
```bash
# Edit files, then:
vercel --prod
# or
netlify deploy --prod
```

### cPanel:
- Log into cPanel → File Manager
- Edit index.html directly
- Or re-upload files

---

## Troubleshooting

### DNS Not Propagating
- Wait 24-48 hours for full global propagation
- Check status: https://dnschecker.org
- Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Try incognito/private browsing mode

### SSL Certificate Issues
- For GitHub Pages: Uncheck and re-check "Enforce HTTPS" in settings
- For Namecheap cPanel: Run AutoSSL again
- For Vercel/Netlify: Automatic, should work within minutes

### Site Not Loading
1. Verify DNS records in Namecheap dashboard
2. Check deployment status in hosting provider dashboard
3. Ensure index.html exists in root directory
4. Check browser console for errors (F12)

### Wrong Content Showing
- Clear CDN cache (if using Cloudflare or similar)
- Hard refresh browser: Cmd+Shift+R or Ctrl+Shift+R
- Verify correct files were uploaded

---

## Performance Optimization

### Enable Caching
Add to your hosting configuration:

```apache
# .htaccess (for Apache/cPanel)
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 1 hour"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
</IfModule>
```

### Minify HTML/CSS/JS
```bash
# Install minifier
npm install -g html-minifier

# Minify
html-minifier --collapse-whitespace --remove-comments \
  landing_page.html -o landing_page.min.html
```

### Add CDN (Optional)
- Cloudflare (free): https://cloudflare.com
- Add aios.is to Cloudflare
- Update Namecheap nameservers to Cloudflare nameservers
- Enable caching and minification in Cloudflare dashboard

---

## Security Best Practices

1. **Always use HTTPS**: Enable SSL certificate
2. **Set security headers**: Add to .htaccess or hosting config:
   ```apache
   Header set X-Content-Type-Options "nosniff"
   Header set X-Frame-Options "SAMEORIGIN"
   Header set X-XSS-Protection "1; mode=block"
   ```
3. **Keep software updated**: Update hosting platform, CMS, etc.
4. **Backup regularly**: Download site files weekly
5. **Monitor uptime**: Use https://uptimerobot.com (free)

---

## Support

If you need help:
- **Namecheap Support**: https://www.namecheap.com/support/
- **GitHub Pages**: https://docs.github.com/en/pages
- **Vercel**: https://vercel.com/docs
- **Netlify**: https://docs.netlify.com

---

## Summary

Your Ai|oS quantum computing suite (23 algorithms) is now fully documented and ready for deployment at **aios.is**. Choose your deployment method above and follow the steps to go live!

**Recommended**: Start with **GitHub Pages** (free, easy, reliable) or **Vercel** (fastest, automatic SSL).

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Last Updated: 2025-10-13
