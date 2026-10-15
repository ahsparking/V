import React, { useState, useEffect, useCallback } from 'react';
import {
  getAllContacts,
  saveContact,
  updateContact,
  deleteContact,
  getSettings,
  saveSettings,
  seedDefaultContacts,
  clearAllData,
} from './services/db';
import { ScannedContact, AppSettings } from './types/contact';
import { BiometricLock } from './components/BiometricLock';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { CameraScanner } from './components/CameraScanner';
import { LeadsList } from './components/LeadsList';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ReviewModal } from './components/ReviewModal';
import { LeadDetailModal } from './components/LeadDetailModal';
import { CrmExportModal } from './components/CrmExportModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { SettingsModal } from './components/SettingsModal';
import { EncryptionInspectorModal } from './components/EncryptionInspectorModal';
import {
  Camera,
  Users,
  BarChart3,
  Layers,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { isSessionExpired } from './services/biometrics';

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [contacts, setContacts] = useState<ScannedContact[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    biometricEnabled: true,
    biometricType: 'face_or_touch',
    pinCode: '1234',
    autoLockSeconds: 300,
    autoSyncPhone: true,
    cloudSyncAuthorized: false,
    cloudBackupProvider: 'all',
    autoBackupFrequency: 'daily',
    crmExportFormat: 'salesforce',
    soundEffects: true,
    hapticFeedback: true,
    theme: 'dark',
  });

  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  // Modals state
  const [pendingScan, setPendingScan] = useState<{ data: any; image: string } | null>(null);
  const [selectedLead, setSelectedLead] = useState<ScannedContact | null>(null);
  const [showCrmModal, setShowCrmModal] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [inspectingEncryption, setInspectingEncryption] = useState<ScannedContact | null>(null);

  // Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Last user active timestamp for auto-lock calculation
  const [lastActiveTime, setLastActiveTime] = useState<number>(Date.now());

  // Show Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Initial Load from Encrypted IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        const loadedSettings = await getSettings();
        setSettings(loadedSettings);

        // If biometric disabled, unlock directly
        if (!loadedSettings.biometricEnabled) {
          setIsLocked(false);
        }

        const loadedContacts = await getAllContacts();
        setContacts(loadedContacts);
      } catch (err) {
        console.error('Failed to load local database:', err);
      }
    }

    loadData();
  }, []);

  // Network Online/Offline Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Inactivity & Auto-Lock Listener
  useEffect(() => {
    if (!settings.biometricEnabled || settings.autoLockSeconds <= 0) return;

    const recordActivity = () => setLastActiveTime(Date.now());
    window.addEventListener('touchstart', recordActivity);
    window.addEventListener('click', recordActivity);
    window.addEventListener('keydown', recordActivity);

    const interval = setInterval(() => {
      if (!isLocked && isSessionExpired(lastActiveTime, settings.autoLockSeconds)) {
        setIsLocked(true);
      }
    }, 15000);

    // Auto-lock when tab is hidden/backgrounded if set to immediately
    const handleVisibility = () => {
      if (document.hidden && settings.autoLockSeconds === 0) {
        setIsLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('touchstart', recordActivity);
      window.removeEventListener('click', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [isLocked, lastActiveTime, settings]);

  // Handle OCR Scan from Camera
  const handleScanComplete = (cardData: any, imageBase64: string) => {
    setPendingScan({
      data: cardData,
      image: imageBase64,
    });
  };

  // Save new contact from ReviewModal
  const handleSaveContact = async (newContact: ScannedContact, autoSyncedPhone: boolean) => {
    try {
      const saved = await saveContact(newContact);
      setContacts(prev => [saved, ...prev]);
      setPendingScan(null);

      if (autoSyncedPhone) {
        showToast(`Saved & synced "${newContact.fullName}" to phone contacts!`);
      } else {
        showToast(`Encrypted & stored "${newContact.fullName}" in offline database.`);
      }

      // Switch to leads list to view new lead
      setActiveTab('leads');
    } catch (err: any) {
      console.error('Error saving contact:', err);
      showToast('Error saving contact: ' + err?.message);
    }
  };

  // Update existing contact
  const handleUpdateContact = async (updated: ScannedContact) => {
    try {
      await updateContact(updated);
      setContacts(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      setSelectedLead(updated);
      showToast(`Updated "${updated.fullName}".`);
    } catch (err: any) {
      console.error('Failed to update contact:', err);
    }
  };

  // Delete contact
  const handleDeleteContact = async (id: string) => {
    try {
      await deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      showToast('Lead deleted from encrypted vault.');
    } catch (err: any) {
      console.error('Failed to delete lead:', err);
    }
  };

  // Update App Settings
  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  // Reseed Sample Leads
  const handleReseed = async () => {
    await seedDefaultContacts();
    const fresh = await getAllContacts();
    setContacts(fresh);
    showToast('Loaded enterprise sample leads.');
  };

  // Clear Database
  const handleClearDb = async () => {
    await clearAllData();
    setContacts([]);
    showToast('Cleared local offline database.');
  };

  // Restore Contacts from Backup
  const handleRestoreContacts = async (restored: ScannedContact[]) => {
    for (const c of restored) {
      await saveContact(c);
    }
    const all = await getAllContacts();
    setContacts(all);
    showToast(`Successfully restored ${restored.length} leads!`);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 pb-20 md:pb-8">
      {/* Biometric Lock Screen */}
      {isLocked && settings.biometricEnabled && (
        <BiometricLock
          expectedPin={settings.pinCode}
          onUnlock={() => setIsLocked(false)}
        />
      )}

      {/* Top Application Header */}
      <Navbar
        onLockApp={() => setIsLocked(true)}
        onOpenCloudSync={() => setShowCloudModal(true)}
        onOpenCrmExport={() => setShowCrmModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        totalLeads={contacts.length}
        isOnline={isOnline}
      />

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl shadow-emerald-500/30 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 md:py-6">
        {/* Desktop Tab Selector Bar */}
        <div className="hidden md:flex items-center justify-between mb-6 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              Camera Scanner
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'leads'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              Scanned Leads ({contacts.length})
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics Dashboard
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Encrypted Offline Store</span>
          </div>
        </div>

        {/* Tab 1: Mobile Camera Business Card Scanner */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Mobile Business Card Scanner
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Point camera at physical business card &bull; High-accuracy Gemini 3.8 Flash OCR
                </p>
              </div>
            </div>

            <CameraScanner
              onScanComplete={handleScanComplete}
              isProcessing={isProcessingScan}
            />

            {/* Quick Feature Callouts for Commercial Appeal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Auto-Sync to Phone Contacts</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Automatically builds standard vCard 3.0 compatible with iOS & Android phonebook.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Salesforce & HubSpot CRM</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    1-click Data Loader CSV export with standard Lead API fields & webhook dispatcher.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AES-256 Local Encryption</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Encrypted offline database. No plaintext stored on disk. Biometric app lock.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Leads List */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Scanned Leads Directory
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {contacts.length} encrypted business contacts in local offline storage
                </p>
              </div>
            </div>

            <LeadsList
              contacts={contacts}
              onSelectLead={contact => setSelectedLead(contact)}
              onOpenScanner={() => setActiveTab('scanner')}
              onOpenCrmExport={() => setShowCrmModal(true)}
              onInspectEncryption={contact => setInspectingEncryption(contact)}
            />
          </div>
        )}

        {/* Tab 3: Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Lead Intelligence & Analytics
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time pipeline metrics, conversion funnel, and OCR field completeness
                </p>
              </div>
            </div>

            <AnalyticsDashboard contacts={contacts} />
          </div>
        )}

        {/* Tab 4: CRM & Cloud (Mobile Tab) */}
        {activeTab === 'crm' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  CRM Integration & Cloud Sync
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Export leads to Salesforce, HubSpot, or backup to Google Drive / iCloud
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setShowCrmModal(true)}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 cursor-pointer shadow-xl transition space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Export to Salesforce & CRM</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Export all leads to Salesforce Lead Data Loader CSV, HubSpot contacts format, or live Webhook API.
                </p>
                <span className="text-xs font-semibold text-sky-400 block pt-1">
                  Open CRM Export &rarr;
                </span>
              </div>

              <div
                onClick={() => setShowCloudModal(true)}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 cursor-pointer shadow-xl transition space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Google Drive & iCloud Backups</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Configure automated cloud backups, authorized sync, and restore previous encrypted .cardvault snapshots.
                </p>
                <span className="text-xs font-semibold text-teal-400 block pt-1">
                  Configure Cloud Sync &rarr;
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={tab => setActiveTab(tab)}
        leadsCount={contacts.length}
      />

      {/* Modals */}
      {pendingScan && (
        <ReviewModal
          initialData={pendingScan.data}
          cardImageUri={pendingScan.image}
          onSave={handleSaveContact}
          onClose={() => setPendingScan(null)}
        />
      )}

      {selectedLead && (
        <LeadDetailModal
          contact={selectedLead}
          onUpdate={handleUpdateContact}
          onDelete={handleDeleteContact}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {showCrmModal && (
        <CrmExportModal
          contacts={contacts}
          onClose={() => setShowCrmModal(false)}
          onSyncUpdated={updatedList => setContacts(updatedList)}
        />
      )}

      {showCloudModal && (
        <CloudSyncModal
          contacts={contacts}
          settings={settings}
          onUpdateSettings={handleSaveSettings}
          onRestoreContacts={handleRestoreContacts}
          onClose={() => setShowCloudModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onResetDb={handleClearDb}
          onReseedDb={handleReseed}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {inspectingEncryption && (
        <EncryptionInspectorModal
          contact={inspectingEncryption}
          onClose={() => setInspectingEncryption(null)}
        />
      )}
    </div>
  );
}
