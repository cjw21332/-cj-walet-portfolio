# Publish CJ Walet's Official Portfolio

This guide publishes the portfolio as a production website with a working contact form.

## Recommended website name

**CJ Walet | Full-Stack Developer Portfolio**

Recommended domain name:

```text
cjwalet.dev
```

Check the domain's availability with a registrar before purchasing it. If it is unavailable, consider:

- `charlesjameswalet.dev`
- `cjwalet.tech`
- `cjwaletportfolio.com`

## What will be deployed

This project contains:

- A static portfolio frontend in `index.html`, `styles.css`, and `script.js`
- Images and PDF certificates
- A serverless contact endpoint at `api/send-email.js`
- A Maileroo delivery helper at `api/mailer.js`
- A Maileroo integration that sends the portfolio notification and visitor auto-reply

Use a host that supports serverless functions. **Vercel is the recommended option** because it supports this repository layout directly.

## Before publishing: rotate exposed credentials

Previous local files contained Maileroo credentials. Treat those credentials as compromised:

1. Sign in to Maileroo.
2. Revoke or rotate the exposed sending/API key.
3. Create a replacement API key.
4. Do not paste the replacement key into `index.html`, `script.js`, `README.md`, or any other browser-served file.

The current frontend no longer sends mail directly and does not need a client-side API key.

## Step 1: Prepare the project

1. Open a terminal in the project folder.
2. Confirm that these files exist:

   ```text
   index.html
   styles.css
   script.js
   api/send-email.js
   api/mailer.js
   certifications/
   ```

3. Confirm that `env.js` is not included. Mail settings now belong only in the deployment environment.
4. Keep `.env` local only. It is excluded by `.gitignore`.

## Step 2: Create a GitHub repository

1. Go to [GitHub](https://github.com) and create a new repository.
2. Suggested repository name:

   ```text
   cj-walet-portfolio
   ```

3. Keep the repository public if you want recruiters to inspect the source.
4. Do not upload `.env`, API keys, SMTP passwords, or private credentials.
5. From the project folder, run:

   ```powershell
   git init
   git add .
   git commit -m "Prepare CJ Walet portfolio for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cj-walet-portfolio.git
   git push -u origin main
   ```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Create the Vercel project

1. Sign in to [Vercel](https://vercel.com) with GitHub.
2. Select **Add New Project**.
3. Import `cj-walet-portfolio`.
4. Use these settings:

   - Framework preset: **Other**
   - Root directory: `.`
   - Build command: leave blank
   - Output directory: `.`
   - Install command: leave blank

5. Deploy once. The static portfolio should load, but configure the mail variables before testing the form.

## Step 4: Configure Maileroo secrets in Vercel

In the Vercel project, open **Settings → Environment Variables** and add these variables for **Production**, **Preview**, and **Development**:

```text
MAILEROO_API_KEY=the_rotated_maileroo_api_key
MAILEROO_FROM_EMAIL=the_verified_maileroo_sender_address
MAILEROO_VERIFIED_DOMAIN=your-verified-domain.example
```

The sender address must be verified in Maileroo. Do not use a visitor's email address as the `from` address.
`MAILEROO_VERIFIED_DOMAIN` is optional, but when configured it lets the server log confirm that the sender address belongs to the expected verified domain.

After saving the variables:

1. Open **Deployments**.
2. Redeploy the latest deployment.
3. Do not place either value in `env.js` or frontend JavaScript.

## Step 5: Verify the contact form

Test the deployed URL:

1. Open the **Get in Touch** section.
2. Enter a real name, email address, and message.
3. Submit the form.
4. Confirm that the button says **Message Sent!** only after the API accepts the request.
5. Confirm that CJ receives the notification email.
6. Confirm that the visitor receives the automatic acknowledgement.

If the form shows **Unable to Send**:

1. Open the Vercel deployment logs.
2. Check that `MAILEROO_API_KEY` and `MAILEROO_FROM_EMAIL` are present in the deployment environment.
3. Confirm the Maileroo sender is verified.
4. Confirm the rotated key is active.
5. Redeploy after changing environment variables.
6. Read the server logs for the full Maileroo status code, response body, redacted request metadata, API-key presence check, and sender-domain check.

## Step 6: Add a custom domain

1. Purchase an available domain such as `cjwalet.dev`.
2. In Vercel, open **Settings → Domains**.
3. Add the domain.
4. Copy the DNS records Vercel provides.
5. Add those records at the domain registrar.
6. Wait for DNS verification.
7. Set the custom domain as the primary domain.
8. Confirm the site loads over HTTPS.

## Step 7: Make the portfolio official

Update the following before sharing the website:

- Replace placeholder `#` project links with real repository and demo URLs.
- Confirm the GitHub username and contribution information.
- Review the CV download.
- Review every certificate PDF.
- Confirm the internship dates and descriptions.
- Test the light and dark themes.
- Test the mobile navigation on a phone.
- Test the contact form from a separate email account.
- Add the final domain to the CV, GitHub profile, and professional profiles.

## Step 8: Search and social sharing improvements

Before launch, update `index.html` with a final description and social preview metadata:

```html
<meta name="description" content="CJ Walet's portfolio: full-stack web development, SQL, AI applications, and IT operations.">
<meta property="og:title" content="CJ Walet | Full-Stack Developer Portfolio">
<meta property="og:description" content="Explore CJ Walet's projects, skills, experience, certifications, and contact information.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://cjwalet.dev">
```

Replace the URL if a different domain is selected.

## Updating the portfolio after launch

1. Edit the relevant HTML, CSS, or JavaScript file.
2. Test locally with Live Server.
3. Check the responsive layout at mobile, tablet, and desktop widths.
4. Commit and push:

   ```powershell
   git add .
   git commit -m "Update portfolio content"
   git push
   ```

5. Vercel automatically creates a deployment from the pushed commit.
6. Test the production URL after deployment.

## Important security rules

- Never commit `.env`.
- Never place Maileroo API keys in browser JavaScript.
- Never use a CORS proxy for production email delivery.
- Keep contact-form mail server-to-server through `/api/send-email`.
- Rotate a key immediately if it appears in a public repository, browser bundle, screenshot, or chat.
- Review Vercel logs for failures without logging message contents or credentials.

## Final launch checklist

- [ ] Domain connected and HTTPS active
- [ ] Portfolio loads on desktop and mobile
- [ ] Custom scrollbar works without horizontal overflow
- [ ] Skills and technology count are accurate
- [ ] GitHub section loads acceptably on mobile
- [ ] Footer links work
- [ ] CV download works
- [ ] Certificate viewer works
- [ ] Maileroo sender is verified
- [ ] Production environment variables are configured
- [ ] Contact notification is received
- [ ] Visitor auto-reply is received
- [ ] No credentials are present in the repository
