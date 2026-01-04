# NOON Opticals - Project Configuration

## Environment Setup

### Development
```bash
# Base URL for development
DEV_API_URL=http://localhost:3000

# Enable debug mode
DEBUG=true
```

### Production
```bash
# Base URL for production
PROD_API_URL=https://api.noonopticals.com

# Disable debug mode
DEBUG=false
```

## File Permissions (Unix/Linux)

```bash
# Set correct permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod 644 index.html
chmod 755 assets/
```

## Cache Busting

Update version numbers in file references:
- `style.css?v=X`
- `script.js?v=X`

## Performance Checklist

- [ ] Images optimized (WebP format where possible)
- [ ] CSS minified for production
- [ ] JavaScript minified for production
- [ ] Gzip compression enabled
- [ ] Browser caching configured
- [ ] CDN configured for assets
- [ ] Lazy loading implemented
- [ ] Critical CSS inlined

## SEO Checklist

- [x] Meta tags configured
- [x] Open Graph tags added
- [x] Twitter cards added
- [ ] Schema.org markup added
- [ ] Sitemap.xml created
- [ ] Robots.txt configured
- [ ] Analytics integrated
- [ ] Google Search Console verified

## Security Checklist

- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] SQL injection prevention (backend)
- [ ] Rate limiting (backend)
- [ ] Input validation (backend)
- [ ] Secure cookie settings

## Browser Testing

Test on:
- [ ] Chrome (Desktop & Mobile)
- [ ] Firefox (Desktop & Mobile)
- [ ] Safari (Desktop & Mobile)
- [ ] Edge (Desktop)
- [ ] Samsung Internet (Mobile)
- [ ] Opera (Desktop & Mobile)

## Device Testing

Test on:
- [ ] iPhone (iOS Safari)
- [ ] Android Phone (Chrome)
- [ ] iPad (Safari)
- [ ] Android Tablet (Chrome)
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)

## Accessibility Testing

- [ ] Screen reader compatible
- [ ] Keyboard navigation working
- [ ] Color contrast sufficient
- [ ] ARIA labels present
- [ ] Alt text for images
- [ ] Focus indicators visible

## Deployment Steps

1. **Pre-deployment**
   - Run all tests
   - Update version numbers
   - Minify CSS and JS
   - Optimize images
   - Update API URLs

2. **Deploy**
   - Upload files to server
   - Verify file permissions
   - Test all functionality
   - Check responsive design

3. **Post-deployment**
   - Test on live site
   - Check analytics
   - Monitor error logs
   - Test payment gateway

## Monitoring

- [ ] Uptime monitoring setup
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Analytics tracking verified
- [ ] Log aggregation configured

## Backup Strategy

- Daily automated backups
- Database backups (if applicable)
- Store backups offsite
- Test restore procedures monthly

## Contact Information

- **Developer:** Azhan
- **Support:** hello@noonopticals.com
- **Phone:** +91 70105 31695
