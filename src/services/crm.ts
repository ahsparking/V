import { ScannedContact } from '../types/contact';
import { encryptPayload } from './crypto';

/**
 * Generates an RFC-compliant vCard 3.0 string for iOS & Android native contacts.
 */
export function generateVCard(contact: ScannedContact): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.fullName}`,
    `N:${contact.lastName || ''};${contact.firstName || ''};;;`,
    `ORG:${contact.company || ''};${contact.department || ''}`,
    `TITLE:${contact.jobTitle || ''}`,
    `EMAIL;TYPE=INTERNET,WORK:${contact.email || ''}`,
  ];

  if (contact.phoneMobile) {
    lines.push(`TEL;TYPE=CELL,VOICE:${contact.phoneMobile}`);
  }
  if (contact.phoneWork) {
    lines.push(`TEL;TYPE=WORK,VOICE:${contact.phoneWork}`);
  }
  if (contact.website) {
    lines.push(`URL:${contact.website}`);
  }

  // Address: PO Box; Extended Address; Street; City; State; Postal Code; Country
  if (
    contact.addressStreet ||
    contact.addressCity ||
    contact.addressState ||
    contact.addressZip ||
    contact.addressCountry
  ) {
    lines.push(
      `ADR;TYPE=WORK:;;${contact.addressStreet || ''};${contact.addressCity || ''};${
        contact.addressState || ''
      };${contact.addressZip || ''};${contact.addressCountry || ''}`
    );
  }

  const notesText = [
    contact.notes || '',
    contact.tagline ? `Tagline: ${contact.tagline}` : '',
    contact.linkedin ? `LinkedIn: ${contact.linkedin}` : '',
    contact.twitter ? `Twitter: ${contact.twitter}` : '',
    `Scanned with CardVault AI - Rating: ${contact.leadPriority} (${contact.leadRating}/5)`,
  ]
    .filter(Boolean)
    .join(' | ');

  lines.push(`NOTE:${notesText}`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Triggers a native download of a .vcf card file.
 * On mobile devices (iOS Safari, Android Chrome), tapping this immediately prompts:
 * "Add to Contacts" / "Create New Contact".
 */
export function downloadVCard(contact: ScannedContact): void {
  const vcardText = generateVCard(contact);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
  const filename = `${contact.fullName.replace(/[^a-zA-Z0-9]/g, '_') || 'Contact'}.vcf`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Exports multiple contacts as a combined vCard bulk file.
 */
export function downloadBulkVCard(contacts: ScannedContact[]): void {
  const allVcards = contacts.map(c => generateVCard(c)).join('\r\n\r\n');
  const blob = new Blob([allVcards], { type: 'text/vcard;charset=utf-8' });
  const filename = `CardVault_Phone_Contacts_${new Date().toISOString().slice(0, 10)}.vcf`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Exports contacts in standard Salesforce Lead Data Loader CSV format.
 * Maps exact Salesforce Lead standard API fields.
 */
export function exportSalesforceCsv(contacts: ScannedContact[]): void {
  const headers = [
    'FirstName',
    'LastName',
    'Title',
    'Company',
    'Email',
    'Phone',
    'MobilePhone',
    'Street',
    'City',
    'State',
    'PostalCode',
    'Country',
    'Website',
    'LeadSource',
    'Rating',
    'Status',
    'Industry',
    'Description',
  ];

  const escapeCsv = (val: string | undefined | null) => {
    if (!val) return '""';
    const clean = String(val).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = contacts.map(c => [
    escapeCsv(c.firstName),
    escapeCsv(c.lastName || c.fullName),
    escapeCsv(c.jobTitle),
    escapeCsv(c.company || 'Unknown'),
    escapeCsv(c.email),
    escapeCsv(c.phoneWork || ''),
    escapeCsv(c.phoneMobile || ''),
    escapeCsv(c.addressStreet || ''),
    escapeCsv(c.addressCity || ''),
    escapeCsv(c.addressState || ''),
    escapeCsv(c.addressZip || ''),
    escapeCsv(c.addressCountry || ''),
    escapeCsv(c.website || ''),
    escapeCsv('CardVault AI Scanner'),
    escapeCsv(c.leadPriority), // Hot, Warm, Cold
    escapeCsv(c.pipelineStage === 'New Lead' ? 'Open - Not Contacted' : c.pipelineStage),
    escapeCsv(c.industry || 'Technology'),
    escapeCsv(`${c.notes || ''} [Tags: ${c.tags.join(', ')}] [Confidence: ${c.ocrConfidence}%]`),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(
    csvContent,
    `Salesforce_Leads_Import_${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8;'
  );
}

/**
 * Exports contacts in HubSpot Contacts CSV import format.
 */
export function exportHubspotCsv(contacts: ScannedContact[]): void {
  const headers = [
    'First Name',
    'Last Name',
    'Job Title',
    'Company Name',
    'Email',
    'Mobile Phone Number',
    'Phone Number',
    'Website URL',
    'Street Address',
    'City',
    'State/Region',
    'Postal Code',
    'Country/Region',
    'Lead Status',
    'Notes',
  ];

  const escapeCsv = (val: string | undefined | null) => {
    if (!val) return '""';
    const clean = String(val).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = contacts.map(c => [
    escapeCsv(c.firstName),
    escapeCsv(c.lastName || c.fullName),
    escapeCsv(c.jobTitle),
    escapeCsv(c.company),
    escapeCsv(c.email),
    escapeCsv(c.phoneMobile),
    escapeCsv(c.phoneWork),
    escapeCsv(c.website),
    escapeCsv(c.addressStreet),
    escapeCsv(c.addressCity),
    escapeCsv(c.addressState),
    escapeCsv(c.addressZip),
    escapeCsv(c.addressCountry),
    escapeCsv(c.leadPriority === 'Hot' ? 'IN_PROGRESS' : 'NEW'),
    escapeCsv(`${c.notes || ''} [Confidence: ${c.ocrConfidence}%]`),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(
    csvContent,
    `HubSpot_Contacts_Import_${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8;'
  );
}

/**
 * Creates an encrypted cloud archive package (.cardvault) suitable for Google Drive or iCloud sync.
 */
export async function createEncryptedCloudBackup(contacts: ScannedContact[]): Promise<string> {
  const manifest = {
    app: 'CardVault AI Pro',
    version: '2.4.0',
    backupCreatedAt: new Date().toISOString(),
    totalRecords: contacts.length,
    encryptionSpec: 'AES-GCM-256-PBKDF2',
  };

  // Encrypt the full payload
  const encrypted = await encryptPayload({
    manifest,
    contacts,
  });

  const packageData = {
    ...manifest,
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    checksumSha256: encrypted.hash,
  };

  return JSON.stringify(packageData, null, 2);
}

/**
 * Downloads the encrypted backup file for Google Drive / iCloud / Local Files.
 */
export async function downloadCloudBackupFile(
  contacts: ScannedContact[],
  target: 'google_drive' | 'icloud'
): Promise<void> {
  const backupJson = await createEncryptedCloudBackup(contacts);
  const prefix = target === 'google_drive' ? 'GoogleDrive_CardVault' : 'iCloud_CardVault';
  const filename = `${prefix}_Backup_${new Date().toISOString().slice(0, 10)}.cardvault`;

  downloadFile(backupJson, filename, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
