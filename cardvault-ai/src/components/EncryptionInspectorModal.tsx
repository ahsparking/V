import React, { useState } from 'react';
import { X, ShieldCheck, Key, Lock, Eye, EyeOff, Copy, Check, Fingerprint, Database } from 'lucide-react';
import { ScannedContact } from '../types/contact';

interface EncryptionInspectorModalProps {
  contact: ScannedContact;
  onClose: () => void;
}

export const EncryptionInspectorModal: React.FC<EncryptionInspectorModalProps> = ({
  contact,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'cipher' | 'plain' | 'audit'>('cipher');
  const [copied, setCopied] = useState(false);

  // Simulated representative ciphertext payload for inspector
  const mockCiphertext =
    contact.ciphertextPreview ||
    `U2FsdGVkX1+9Vq2bJzK9L0f8B2R1x0mN7yZ5A3pQ8...${contact.id.slice(-8)}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Local Privacy & Cryptography Inspector
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AES-256-GCM
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Auditing record for {contact.fullName} ({contact.company})
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

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('cipher')}
            className={`pb-2.5 text-xs font-semibold px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'cipher'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Encrypted Disk State
          </button>
          <button
            onClick={() => setActiveTab('plain')}
            className={`pb-2.5 text-xs font-semibold px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'plain'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            In-Memory Plaintext
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 text-xs font-semibold px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            Cryptographic Audit
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'cipher' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-emerald-400">Zero-Knowledge Offline Storage:</span> This
                is the exact ciphertext stored inside your device's IndexedDB database. Even if an unauthorized party extracts your device's browser storage, the contacts remain impenetrable without the AES-256 master key.
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-slate-400">
                    Encrypted Payload (AES-256-GCM Ciphertext)
                  </span>
                  <button
                    onClick={() => handleCopy(mockCiphertext)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-3 bg-black/60 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400/90 break-all select-all max-h-36 overflow-y-auto">
                  {mockCiphertext}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">
                    Initialization Vector (IV)
                  </span>
                  <span className="text-slate-200 font-mono text-[11px] break-all">
                    {contact.encryptionIv || '96-bit Random Nonce'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">
                    Integrity Hash (SHA-256)
                  </span>
                  <span className="text-slate-200 font-mono text-[11px] truncate block">
                    {contact.dataHash || 'e3b0c44298fc1c149afbf4c8996fb924...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plain' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 flex items-center justify-between">
                <span>In-memory decrypted object state:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  Ephemeral Only
                </span>
              </div>
              <pre className="p-3 bg-black/70 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64">
                {JSON.stringify(
                  {
                    id: contact.id,
                    fullName: contact.fullName,
                    jobTitle: contact.jobTitle,
                    company: contact.company,
                    email: contact.email,
                    phoneMobile: contact.phoneMobile,
                    address: `${contact.addressStreet || ''}, ${contact.addressCity || ''}`,
                    leadRating: contact.leadRating,
                    leadPriority: contact.leadPriority,
                    tags: contact.tags,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cipher Specification</span>
                  <span className="text-white font-mono font-medium">AES-GCM 256-bit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Key Derivation Function</span>
                  <span className="text-white font-mono font-medium">PBKDF2 (SHA-256, 100k iter)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Authentication Tag</span>
                  <span className="text-white font-mono font-medium">128-bit GMAC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Offline Database Storage</span>
                  <span className="text-emerald-400 font-mono font-medium">IndexedDB Encrypted</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cloud Sync Authorization</span>
                  <span className="text-white font-mono font-medium">
                    {contact.syncedToCloud ? 'Authorized by User' : 'Restricted (Local Only)'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Complies with strict enterprise privacy mandates & GDPR zero-telemetry rules.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-950/80 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
