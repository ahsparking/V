import React, { useState } from 'react';
import {
  X,
  Settings,
  Shield,
  Fingerprint,
  KeyRound,
  Lock,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Smartphone,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { AppSettings } from '../types/contact';
import { playSuccessChime } from '../services/audio';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onResetDb: () => void;
  onReseedDb: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onResetDb,
  onReseedDb,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [pinChangeOpen, setPinChangeOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleToggle = (key: keyof AppSettings) => {
    const updated = {
      ...localSettings,
      [key]: !localSettings[key],
    };
    setLocalSettings(updated);
    onSave(updated);
  };

  const handleSavePin = () => {
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      const updated = {
        ...localSettings,
        pinCode: newPin,
      };
      setLocalSettings(updated);
      onSave(updated);
      setPinChangeOpen(false);
      setNewPin('');
      playSuccessChime();
      setNotice('Security PIN successfully updated to ' + newPin);
      setTimeout(() => setNotice(null), 3000);
    } else {
      alert('PIN must be exactly 4 digits');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Settings className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">App & Security Settings</h2>
              <p className="text-xs text-slate-400">CardVault AI Commercial Configuration</p>
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
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto text-xs">
          {/* Pro Commercial License Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  CardVault AI Pro
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">
                    ACTIVE
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Unlimited OCR Scans &bull; Salesforce CRM Sync &bull; Offline Database
                </p>
              </div>
            </div>

            <a
              href="/download/cardvault-ai.zip"
              download="cardvault-ai.zip"
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition shrink-0"
              title="Download clean project source code zip"
            >
              <span>Download .ZIP</span>
            </a>
          </div>

          {/* Biometrics & Access Section */}
          <div className="space-y-3">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Biometrics & Access Protection
            </span>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="font-bold text-white block">Biometric Lock on App Launch</span>
                  <span className="text-slate-400 text-[11px]">
                    Requires Face ID, Touch ID, or PIN upon opening app
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.biometricEnabled}
                onChange={() => handleToggle('biometricEnabled')}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="font-bold text-white block">Master Security PIN</span>
                  <span className="text-slate-400 text-[11px]">
                    Current PIN: •••• (Default: {localSettings.pinCode})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPinChangeOpen(!pinChangeOpen)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
              >
                Change PIN
              </button>
            </div>

            {pinChangeOpen && (
              <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl flex items-center gap-2">
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  placeholder="Enter 4-digit PIN..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleSavePin}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save
                </button>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="font-bold text-white block">Auto-Lock Timer</span>
                  <span className="text-slate-400 text-[11px]">Lock app after inactivity</span>
                </div>
              </div>
              <select
                value={localSettings.autoLockSeconds}
                onChange={e => {
                  const val = Number(e.target.value);
                  const updated = { ...localSettings, autoLockSeconds: val };
                  setLocalSettings(updated);
                  onSave(updated);
                }}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value={0}>Immediately</option>
                <option value={60}>1 Minute</option>
                <option value={300}>5 Minutes</option>
                <option value={900}>15 Minutes</option>
                <option value={-1}>Never</option>
              </select>
            </div>
          </div>

          {/* Sync & Automation Section */}
          <div className="space-y-3">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Workflow & Sync Preferences
            </span>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="font-bold text-white block">Auto-Sync to Phone Contacts</span>
                  <span className="text-slate-400 text-[11px]">
                    Automatically trigger native vCard import when card is scanned
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.autoSyncPhone}
                onChange={() => handleToggle('autoSyncPhone')}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {localSettings.soundEffects ? (
                  <Volume2 className="w-5 h-5 text-slate-300" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <span className="font-bold text-white block">Camera Shutter & Audio Chimes</span>
                  <span className="text-slate-400 text-[11px]">
                    Web Audio feedback on shutter snap and scan success
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.soundEffects}
                onChange={() => handleToggle('soundEffects')}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Data Maintenance */}
          <div className="space-y-3 pt-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Offline Storage Maintenance
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onReseedDb();
                  setNotice('Reloaded enterprise sample leads into encrypted store');
                  setTimeout(() => setNotice(null), 3000);
                }}
                className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>Load Sample Leads</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Clear all stored leads from local IndexedDB?')) {
                    onResetDb();
                    setNotice('Local encrypted database cleared');
                    setTimeout(() => setNotice(null), 3000);
                  }
                }}
                className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Local DB</span>
              </button>
            </div>
          </div>

          {notice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-950/80 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
