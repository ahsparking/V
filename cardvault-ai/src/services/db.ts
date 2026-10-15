import { ScannedContact, AppSettings } from '../types/contact';
import { encryptPayload, decryptPayload } from './crypto';

const DB_NAME = 'CardVault_Secure_DB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('contacts')) {
        const contactStore = db.createObjectStore('contacts', { keyPath: 'id' });
        contactStore.createIndex('createdAt', 'createdAt', { unique: false });
        contactStore.createIndex('syncState', 'syncState', { unique: false });
        contactStore.createIndex('leadPriority', 'leadPriority', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

const DEFAULT_SETTINGS: AppSettings = {
  biometricEnabled: true,
  biometricType: 'face_or_touch',
  pinCode: '1234',
  autoLockSeconds: 300, // 5 minutes
  autoSyncPhone: true,
  cloudSyncAuthorized: false,
  cloudBackupProvider: 'all',
  autoBackupFrequency: 'daily',
  crmExportFormat: 'salesforce',
  soundEffects: true,
  hapticFeedback: true,
  theme: 'dark',
};

const SEED_CONTACTS: ScannedContact[] = [
  {
    id: 'lead-seed-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    fullName: 'Alexandra Chen',
    firstName: 'Alexandra',
    lastName: 'Chen',
    jobTitle: 'VP of AI & Strategic Product Development',
    department: 'Executive Engineering',
    company: 'Nexus NeuroSystems Inc.',
    industry: 'Artificial Intelligence & Robotics',
    email: 'alexandra.chen@nexusneuro.ai',
    phoneMobile: '+1 (415) 890-3341',
    phoneWork: '+1 (415) 555-8820',
    website: 'https://nexusneuro.ai',
    addressStreet: '450 Townsend St, Suite 300',
    addressCity: 'San Francisco',
    addressState: 'CA',
    addressZip: '94107',
    addressCountry: 'United States',
    linkedin: 'linkedin.com/in/alexandra-chen-ai',
    twitter: '@alexchen_neuro',
    tagline: 'Autonomous intelligence for distributed robotics',
    notes: 'Met at SF AI Leaders Gala. Looking to migrate 400 seats to our CRM solution by Q1.',
    tags: ['VIP', 'Decision Maker', 'Enterprise', 'AI Summit'],
    leadRating: 5,
    leadPriority: 'Hot',
    pipelineStage: 'Meeting Scheduled',
    ocrConfidence: 99,
    ocrEngine: 'Gemini 3.8 Flash Vision AI',
    isEncrypted: true,
    syncState: 'pending_authorization',
    syncedToPhone: true,
    syncedToSalesforce: false,
    syncedToHubspot: false,
    syncedToCloud: false,
    syncHistory: [
      {
        platform: 'phone',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        status: 'success',
        details: 'vCard exported to iOS Contacts',
      },
    ],
  },
  {
    id: 'lead-seed-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    updatedAt: new Date().toISOString(),
    fullName: 'Robert Sterling',
    firstName: 'Robert',
    lastName: 'Sterling',
    jobTitle: 'Managing Director & Global Head of Procurement',
    department: 'Procurement & Supply Chain',
    company: 'Vanguard Global Logistics',
    industry: 'Transportation & Logistics',
    email: 'r.sterling@vanguardlogistics.com',
    phoneMobile: '+1 (312) 749-1120',
    phoneWork: '+1 (312) 555-4000',
    website: 'https://vanguardlogistics.com',
    addressStreet: '111 South Wacker Drive',
    addressCity: 'Chicago',
    addressState: 'IL',
    addressZip: '60606',
    addressCountry: 'United States',
    linkedin: 'linkedin.com/in/robert-sterling-supply',
    tagline: 'Next-generation maritime and freight orchestration',
    notes: 'Expressed high interest in automated lead capture for global sales team (1,200 reps).',
    tags: ['Enterprise', 'Salesforce CRM', 'Global'],
    leadRating: 5,
    leadPriority: 'Hot',
    pipelineStage: 'Proposal Sent',
    ocrConfidence: 97,
    ocrEngine: 'Gemini 3.8 Flash Vision AI',
    isEncrypted: true,
    syncState: 'synced_to_crm',
    syncedToPhone: true,
    syncedToSalesforce: true,
    syncedToHubspot: false,
    syncedToCloud: true,
    syncHistory: [
      {
        platform: 'phone',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
        status: 'success',
      },
      {
        platform: 'salesforce',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
        status: 'success',
        details: 'Exported as Salesforce Lead #00Q5g00000X9f1R',
      },
    ],
  },
  {
    id: 'lead-seed-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
    fullName: 'Maya Lin-Patel',
    firstName: 'Maya',
    lastName: 'Lin-Patel',
    jobTitle: 'Founder & Chief Creative Officer',
    department: 'Brand Studio',
    company: 'Aura Studio Design Lab',
    industry: 'Design & Interactive Media',
    email: 'maya@aurastudiolab.co',
    phoneMobile: '+1 (646) 381-9924',
    website: 'https://aurastudiolab.co',
    addressStreet: '520 West 28th St',
    addressCity: 'New York',
    addressState: 'NY',
    addressZip: '10001',
    addressCountry: 'United States',
    linkedin: 'linkedin.com/in/mayalinpatel',
    twitter: '@mayalin_design',
    tagline: 'Minimalist brand experiences for luxury innovators',
    notes: 'Card scanned at Brooklyn Tech Week. Requested demo for creative agency workflow.',
    tags: ['Design', 'Agency', 'Prospect'],
    leadRating: 4,
    leadPriority: 'Warm',
    pipelineStage: 'Contacted',
    ocrConfidence: 96,
    ocrEngine: 'Gemini 3.8 Flash Vision AI',
    isEncrypted: true,
    syncState: 'pending_authorization',
    syncedToPhone: false,
    syncedToSalesforce: false,
    syncedToHubspot: false,
    syncedToCloud: false,
    syncHistory: [],
  },
  {
    id: 'lead-seed-4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date().toISOString(),
    fullName: 'Dr. Takuya Takahashi',
    firstName: 'Takuya',
    lastName: 'Takahashi',
    jobTitle: 'Principal Research Scientist',
    department: 'Photonics & Quantum Sensors',
    company: 'Kyoto Quantum Labs',
    industry: 'DeepTech & Semiconductors',
    email: 't.takahashi@kyotoquantum.jp',
    phoneMobile: '+81 90-8841-2091',
    phoneWork: '+81 75-753-2000',
    website: 'https://kyotoquantum.jp',
    addressStreet: 'Yoshida-Honmachi, Sakyo-ku',
    addressCity: 'Kyoto',
    addressState: 'Kyoto Prefecture',
    addressZip: '606-8501',
    addressCountry: 'Japan',
    linkedin: 'linkedin.com/in/takuya-takahashi-quantum',
    tagline: 'Room-temperature optical quantum computing',
    notes: 'Connected during IEEE Photonics conference. Exploring partnership on secure sensor telemetry.',
    tags: ['DeepTech', 'Research', 'International'],
    leadRating: 4,
    leadPriority: 'Warm',
    pipelineStage: 'New Lead',
    ocrConfidence: 98,
    ocrEngine: 'Gemini 3.8 Flash Vision AI',
    isEncrypted: true,
    syncState: 'local_only',
    syncedToPhone: false,
    syncedToSalesforce: false,
    syncedToHubspot: false,
    syncedToCloud: false,
    syncHistory: [],
  },
];

export async function getAllContacts(): Promise<ScannedContact[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('contacts', 'readonly');
    const store = tx.objectStore('contacts');
    const request = store.getAll();

    request.onsuccess = async () => {
      let records = request.result;

      // Seed default contacts if empty so the app has rich lead data immediately
      if (!records || records.length === 0) {
        await seedDefaultContacts();
        records = await getAllContacts();
        return resolve(records);
      }

      // Decrypt any stored encrypted records
      const decryptedRecords: ScannedContact[] = [];
      for (const item of records) {
        if (item.isEncrypted && item.encryptedPayload && item.encryptionIv) {
          try {
            const decrypted = await decryptPayload<ScannedContact>(
              item.encryptedPayload,
              item.encryptionIv
            );
            decryptedRecords.push({
              ...decrypted,
              isEncrypted: true,
              encryptionIv: item.encryptionIv,
              ciphertextPreview: item.encryptedPayload.slice(0, 32) + '...',
              dataHash: item.dataHash,
            });
          } catch (err) {
            console.error('Decryption failed for record:', item.id, err);
            decryptedRecords.push(item);
          }
        } else {
          decryptedRecords.push(item);
        }
      }

      // Sort by newest first
      decryptedRecords.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      resolve(decryptedRecords);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function saveContact(contact: ScannedContact): Promise<ScannedContact> {
  const db = await getDb();

  // Encrypt the sensitive contact data before saving to IndexedDB
  const encrypted = await encryptPayload(contact);

  const encryptedStorageItem = {
    id: contact.id,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
    fullName: contact.fullName, // Plain metadata for search index
    company: contact.company,
    leadPriority: contact.leadPriority,
    syncState: contact.syncState,
    isEncrypted: true,
    encryptionIv: encrypted.iv,
    encryptedPayload: encrypted.ciphertext,
    dataHash: encrypted.hash,
    ocrConfidence: contact.ocrConfidence,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('contacts', 'readwrite');
    const store = tx.objectStore('contacts');
    const req = store.put(encryptedStorageItem);

    req.onsuccess = () => {
      resolve({
        ...contact,
        isEncrypted: true,
        encryptionIv: encrypted.iv,
        ciphertextPreview: encrypted.ciphertext.slice(0, 32) + '...',
        dataHash: encrypted.hash,
      });
    };
    req.onerror = () => reject(req.error);
  });
}

export async function updateContact(contact: ScannedContact): Promise<void> {
  await saveContact(contact);
}

export async function deleteContact(id: string): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('contacts', 'readwrite');
    const store = tx.objectStore('contacts');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const req = store.get('app_settings');

    req.onsuccess = () => {
      resolve(req.result?.settings || DEFAULT_SETTINGS);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    const req = store.put({ id: 'app_settings', settings });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function seedDefaultContacts(): Promise<void> {
  for (const contact of SEED_CONTACTS) {
    await saveContact(contact);
  }
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['contacts'], 'readwrite');
    const store = tx.objectStore('contacts');
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
