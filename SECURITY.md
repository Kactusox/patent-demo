# Security Notes

## Known Issues

### XLSX Vulnerability
The project currently uses `xlsx@0.18.5` which has known vulnerabilities:
- **CVE-2024-xxxx**: Prototype Pollution
- **CVE-2024-xxxx**: ReDoS (Regular Expression Denial of Service)

**Impact**: The xlsx library is used only for admin export functionality in a controlled environment. The vulnerabilities are:
- Low risk in current context (admin-only feature, internal system)
- Requires local file upload for exploitation
- Used only for export, not parsing untrusted files

**Mitigation Options**:
1. **Recommended**: Upgrade to `xlsx@0.20.2` or higher when available
2. **Alternative**: Switch to another Excel library like `exceljs`
3. **Current**: Use only in trusted admin environment

To upgrade when newer version is available:
```bash
npm install xlsx@latest
```

## Security Best Practices

### For Administrators
1. **Change default passwords immediately** after first login
2. **Use strong passwords** (minimum 8 characters, mix of letters, numbers, symbols)
3. **Regularly review activity logs** for suspicious behavior
4. **Limit admin access** to trusted personnel only
5. **Backup database regularly** (patent_system.db)

### For Institutions
1. **Never share your credentials** with others
2. **Log out** when finished using the system
3. **Report suspicious activity** to administrators
4. **Verify file uploads** before submission
5. **Keep your contact information updated**

### For Developers
1. **Never commit sensitive data** (.env files, database with real data)
2. **Use parameterized queries** to prevent SQL injection (already implemented)
3. **Validate all user inputs** on both frontend and backend
4. **Keep dependencies updated** regularly
5. **Review and test security patches** before deployment

## File Upload Security

Current measures in place:
- ✅ File type restriction (PDF only)
- ✅ File size limit (10MB)
- ✅ Secure file naming to prevent directory traversal
- ✅ Files stored outside web root

## Authentication

Current implementation:
- ✅ Session-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password validation
- ✅ Protected API endpoints

## Database Security

- ✅ Parameterized SQL queries (prevents SQL injection)
- ✅ Input validation and sanitization
- ✅ Proper error handling (doesn't expose sensitive info)
- ⚠️ Passwords stored in plaintext (consider hashing with bcrypt)

## Recommended Improvements

### High Priority
1. **Hash passwords** using bcrypt or argon2
   ```bash
   npm install bcrypt
   ```

2. **Add rate limiting** to prevent brute force attacks
   ```bash
   npm install express-rate-limit
   ```

3. **Implement HTTPS** in production
   - Use reverse proxy (nginx) with SSL certificate
   - Or use Let's Encrypt for free SSL

### Medium Priority
4. **Add CSRF protection** for forms
5. **Implement session timeout** for inactive users
6. **Add email verification** for password resets
7. **Enable audit logging** for all critical operations

### Low Priority
8. **Add two-factor authentication (2FA)**
9. **Implement IP whitelisting** for admin access
10. **Add content security policy (CSP)** headers

## Reporting Security Issues

If you discover a security vulnerability, please:
1. **Do not** open a public issue
2. Contact the development team directly
3. Provide detailed information about the vulnerability
4. Allow reasonable time for fix before public disclosure

## Security Checklist for Deployment

Before deploying to production:
- [ ] Change all default passwords
- [ ] Enable HTTPS
- [ ] Set up proper firewall rules
- [ ] Configure secure session settings
- [ ] Enable error logging (but not error displaying)
- [ ] Set up automated backups
- [ ] Review and remove development/debug code
- [ ] Update all dependencies
- [ ] Implement password hashing
- [ ] Add rate limiting
- [ ] Test authentication and authorization thoroughly
- [ ] Set up monitoring and alerting
- [ ] Document emergency response procedures

## Regular Security Maintenance

### Weekly
- Review activity logs
- Check for suspicious behavior
- Verify backups are working

### Monthly
- Update dependencies (`npm audit` and `npm update`)
- Review user access levels
- Test backup restoration

### Quarterly
- Security audit of code
- Penetration testing
- Review and update security policies
- User security training

---

**Last Updated**: October 2025  
**Next Review**: December 2025
