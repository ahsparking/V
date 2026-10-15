import React, { useState } from 'react';
import {
  X,
  Cloud,
  ShieldCheck,
  DownloadCloud,
  UploadCloud,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  FolderLock,
  Lock,
  Sparkles,
} from 'lucide-react';
import { ScannedContact, AppSettings } from '../types/contact';
import { downloadCloudBackupFile } from '../services/crm';
import { decryptPayload } from '../services/crypto';
import { playSuccessChime } from '../services/audio';

interface CloudSyncModalProps {
  contacts: ScannedContact[];
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onRestoreContacts: (restoredContacts: ScannedContact[]) => void;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  contacts,
  settings,
  onUpdateSettings,
  onRestoreContacts,
  onClose,
}) => {
  const [cloudAuthorized, setCloudAuthorized] = useState(settings.cloudSyncAuthorized);
  const [backupProvider, setBackupProvider] = useState<'google_drive' | 'icloud'>(
    settings.cloudBackupProvider === 'google_drive' ? 'google_drive' : 'icloud'
  );
  const [autoFrequency, setAutoFrequency] = useState(settings.autoBackupFrequency);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleToggleAuthorization = (val: boolean) => {
    setCloudAuthorized(val);
    const updated = {
      ...settings,
      cloudSyncAuthorized: val,
    };
    onUpdateSettings(updated);
  };

  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    setStatusMessage(null);
    playSuccessChime();

    try {
      await downloadCloudBackupFile(contacts, backupProvider);
      const updated = {
        ...settings,
        lastBackupTimestamp: new Date().toISOString(),
      };
      onUpdateSettings(updated);
      setStatusMessage(
        `Encrypted archive generated for ${
          backupProvider === 'google_drive' ? 'Google Drive' : 'iCloud Drive'
        }.`
      );
    } catch (e: any) {
      setStatusMessage('Error creating backup: ' + e?.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.ciphertext && parsed.iv) {
          // Decrypt payload
          const decrypted: any = await decryptPayload(parsed.ciphertext, parsed.iv);
          if (decrypted.contacts && Array.isArray(decrypted.contacts)) {
            playSuccessChime();
            onRestoreContacts(decrypted.contacts);
            setStatusMessage(`Successfully restored ${decrypted.contacts.length} encrypted leads!`);
          } else {
            throw new Error('Invalid backup container format');
          }
        } else if (Array.isArray(parsed)) {
          // Direct JSON format
          playSuccessChime();
          onRestoreContacts(parsed);
          setStatusMessage(`Restored ${parsed.length} contacts from archive.`);
        }
      } catch (err: any) {
        setStatusMessage('Restore failed: ' + (err?.message || 'Corrupt or mismatched key'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Cloud Backup & Authorized Sync
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  AES-256 Vault
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated Google Drive & iCloud Synchronization Controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* User Authorization Consent Switch */}
          <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  User Authorization for Cloud Synchronization
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Your offline database is 100% private. Cloud syncing only operates when explicitly authorized by you. All backups are encrypted with AES-256 before leaving your device.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={cloudAuthorized}
                onChange={e => handleToggleAuthorization(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          {/* Cloud Storage Target Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Preferred Cloud Storage Service
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBackupProvider('google_drive')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                  backupProvider === 'google_drive'
                    ? 'bg-teal-500/10 border-teal-500/50 text-white shadow-lg shadow-teal-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  G
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">Google Drive</span>
                  <span className="text-[10px] text-slate-400">Encrypted Snapshot</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBackupProvider('icloud')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                  backupProvider === 'icloud'
                    ? 'bg-teal-500/10 border-teal-500/50 text-white shadow-lg shadow-teal-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">iCloud Drive</span>
                  <span className="text-[10px] text-slate-400">Apple Files Vault</span>
                </div>
              </button>
            </div>
          </div>

          {/* Automatic Sync Frequency */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Automated Sync Schedule</span>
              <span className="text-[11px] text-slate-400">
                Trigger background encrypted snapshots
              </span>
            </div>
            <select
              value={autoFrequency}
              onChange={e => {
                const freq = e.target.value as any;
                setAutoFrequency(freq);
                onUpdateSettings({ ...settings, autoBackupFrequency: freq });
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500"
            >
              <option value="daily">Daily Automatic</option>
              <option value="weekly">Weekly</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>

          {/* Backup Action Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Last Successful Cloud Backup:</span>
              <span className="text-teal-400 font-mono">
                {settings.lastBackupTimestamp
                  ? new Date(settings.lastBackupTimestamp).toLocaleString()
                  : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Encrypted Leads in Vault:</span>
              <span className="text-white font-mono font-bold">{contacts.length} records</span>
            </div>

            <button
              onClick={handleTriggerBackup}
              disabled={isBackingUp || !cloudAuthorized}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition"
            >
              <UploadCloud className="w-4 h-4" />
              {isBackingUp
                ? 'Encrypting & Generating Archive...'
                : `Create & Save ${backupProvider === 'google_drive' ? 'Google Drive' : 'iCloud'} Backup`}
            </button>
            {!cloudAuthorized && (
              <p className="text-[11px] text-amber-400 text-center">
                &uarr; Please enable User Authorization above to activate cloud sync
              </p>
            )}
          </div>

          {/* Restore Section */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                Restore from .cardvault Backup
              </span>
              <span className="text-[11px] text-slate-400">
                Import from iCloud or Google Drive file
              </span>
            </div>
            <label className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer flex items-center gap-1.5 transition">
              <DownloadCloud className="w-3.5 h-3.5 text-teal-400" />
              Select File
              <input
                type="file"
                accept=".cardvault,.json"
                onChange={handleFileRestore}
                className="hidden"
              />
            </label>
          </div>

          {/* Feedback message */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-950/80 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
