export type LeadPriority = 'Hot' | 'Warm' | 'Cold';

export type PipelineStage =
  | 'New Lead'
  | 'Contacted'
  | 'Meeting Scheduled'
  | 'Proposal Sent'
  | 'Qualified'
  | 'Closed Won';

export type SyncState =
  | 'local_only'
  | 'pending_authorization'
  | 'synced_to_crm'
  | 'synced_to_phone'
  | 'synced_all';

export interface SyncLogEntry {
  platform: 'phone' | 'salesforce' | 'hubspot' | 'google_drive' | 'icloud' | 'webhook';
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  details?: string;
}

export interface ScannedContact {
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // Primary Contact Info
  fullName: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department?: string;
  company: string;
  industry?: string;
  
  // Communication
  email: string;
  phoneMobile: string;
  phoneWork?: string;
  website?: string;
  
  // Location
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  addressCountry?: string;
  
  // Social & Web
  linkedin?: string;
  twitter?: string;
  
  // Business Metadata
  tagline?: string;
  notes?: string;
  tags: string[];
  leadRating: number; // 1-5
  leadPriority: LeadPriority;
  pipelineStage: PipelineStage;
  
  // Visual Asset
  cardImageUri?: string; // Captured photo thumbnail or full base64
  
  // OCR & Intelligence
  ocrConfidence: number; // 0-100
  rawText?: string;
  ocrEngine?: string;
  
  // Privacy & Encryption (Local AES-256-GCM)
  isEncrypted: boolean;
  encryptionIv?: string;
  ciphertextPreview?: string;
  dataHash?: string;
  
  // Sync & Integrations
  syncState: SyncState;
  syncedToPhone: boolean;
  syncedToSalesforce: boolean;
  syncedToHubspot: boolean;
  syncedToCloud: boolean;
  syncHistory: SyncLogEntry[];
}

export interface AppSettings {
  biometricEnabled: boolean;
  biometricType: 'face_or_touch' | 'pin';
  pinCode: string;
  autoLockSeconds: number; // 0 = immediately, 60 = 1 min, 300 = 5 min, -1 = never
  
  // Sync & Cloud
  autoSyncPhone: boolean;
  cloudSyncAuthorized: boolean;
  cloudBackupProvider: 'google_drive' | 'icloud' | 'all';
  autoBackupFrequency: 'daily' | 'weekly' | 'manual';
  lastBackupTimestamp?: string;
  
  // CRM integrations
  salesforceWebhookUrl?: string;
  crmExportFormat: 'salesforce' | 'hubspot' | 'zoho' | 'vcard';
  
  // UX
  soundEffects: boolean;
  hapticFeedback: boolean;
  theme: 'dark' | 'light';
}

export interface AnalyticsSummary {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  syncedToPhoneCount: number;
  syncedToCrmCount: number;
  averageConfidence: number;
  topIndustries: { industry: string; count: number }[];
  topCompanies: { company: string; count: number }[];
  scansByDay: { date: string; count: number; hot: number }[];
  enrichmentRate: {
    hasEmail: number;
    hasPhone: number;
    hasWebsite: number;
    hasAddress: number;
    hasLinkedin: number;
  };
}
