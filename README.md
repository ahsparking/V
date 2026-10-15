# CardVault AI™ — Mobile Business Card Scanner & Lead CRM

High-accuracy mobile business card scanner with AI Vision OCR, phone contacts sync, Salesforce CRM export, local AES-256-GCM encryption, and biometric app access.

## Features
- **Mobile Camera Scanner**: Point camera at any physical business card with golden-ratio alignment reticle, torch control, shutter audio, and haptic feedback.
- **Gemini 3.8 Flash Vision AI OCR**: Extracts full name, title, company, email, phone, website, physical address, LinkedIn, notes, and lead priority rating with zero API key configuration needed.
- **Phone Contacts Sync**: Standard RFC-compliant vCard (`.vcf`) 1-tap download that immediately opens the native "Add to Contacts" dialogue on iOS and Android.
- **Salesforce & CRM Export**: Export to Salesforce Lead CSV (with standard Data Loader headers), HubSpot Contacts CSV, or live webhook dispatching.
- **Hardware-Grade AES-256 Encryption**: Real Web Crypto API AES-GCM 256-bit local encryption with PBKDF2 key derivation.
- **Offline IndexedDB**: All lead records stored locally in browser storage, syncing only upon explicit user authorization.
- **Biometric Security**: WebAuthn platform authenticator (Face ID / Touch ID / Fingerprint) with PIN fallback.
- **Analytics Dashboard**: Pipeline conversion funnel, qualification ratios, and OCR field capture completeness.
- **Automated Cloud Backup**: Export encrypted `.cardvault` snapshots for Google Drive and iCloud.

## Quick Start (Local Development)

1. Extract the zip file:
   ```bash
   unzip cardvault-ai.zip
   cd cardvault-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY if testing OCR outside AI Studio
   ```

4. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Uploading to GitHub

To upload this project to your GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit of CardVault AI"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
git push -u origin main
```
