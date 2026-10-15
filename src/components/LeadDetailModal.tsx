import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Globe,
  MapPin,
  Linkedin,
  Twitter,
  Star,
  Flame,
  ShieldCheck,
  Share2,
  Trash2,
  Edit3,
  Calendar,
  Building2,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  UploadCloud,
} from 'lucide-react';
import { ScannedContact, PipelineStage } from '../types/contact';
import { downloadVCard, exportSalesforceCsv } from '../services/crm';
import { EncryptionInspectorModal } from './EncryptionInspectorModal';
import { playSuccessChime } from '../services/audio';

interface LeadDetailModalProps {
  contact: ScannedContact;
  onUpdate: (updated: ScannedContact) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  contact,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [showInspector, setShowInspector] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(contact.pipelineStage);
  const [syncedPhoneNotice, setSyncedPhoneNotice] = useState(false);

  const handleStageChange = (newStage: PipelineStage) => {
    setPipelineStage(newStage);
    const updated: ScannedContact = {
      ...contact,
      pipelineStage: newStage,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updated);
  };

  const handleSyncToPhone = () => {
    playSuccessChime();
    downloadVCard(contact);
    setSyncedPhoneNotice(true);
    const updated: ScannedContact = {
      ...contact,
      syncedToPhone: true,
      syncState: contact.syncedToSalesforce ? 'synced_all' : 'synced_to_phone',
      syncHistory: [
        ...contact.syncHistory,
        {
          platform: 'phone',
          timestamp: new Date().toISOString(),
          status: 'success',
          details: 'Direct vCard exported to native contacts',
        },
      ],
    };
    onUpdate(updated);
    setTimeout(() => setSyncedPhoneNotice(false), 3000);
  };

  const handleExportSalesforceSingle = () => {
    playSuccessChime();
    exportSalesforceCsv([contact]);
    const updated: ScannedContact = {
      ...contact,
      syncedToSalesforce: true,
      syncState: contact.syncedToPhone ? 'synced_all' : 'synced_to_crm',
      syncHistory: [
        ...contact.syncHistory,
        {
          platform: 'salesforce',
          timestamp: new Date().toISOString(),
          status: 'success',
          details: 'Exported as Salesforce Lead format',
        },
      ],
    };
    onUpdate(updated);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
        <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/20 shrink-0">
                {contact.firstName?.[0] || contact.fullName?.[0] || 'L'}
              </div>

              <div className="flex-1 pr-6">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {contact.fullName}
                  </h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      contact.leadPriority === 'Hot'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : contact.leadPriority === 'Warm'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {contact.leadPriority === 'Hot' && <Flame className="w-3 h-3" />}
                    {contact.leadPriority} Lead
                  </span>
                </div>

                <p className="text-sm text-emerald-400 font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {contact.jobTitle}
                </p>

                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {contact.company} {contact.department ? `&bull; ${contact.department}` : ''}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons Tray */}
            <div className="flex items-center gap-2 mt-5 flex-wrap">
              {contact.phoneMobile && (
                <a
                  href={`tel:${contact.phoneMobile}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Mobile
                </a>
              )}

              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  Send Email
                </a>
              )}

              <button
                onClick={handleSyncToPhone}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
              >
                <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                Sync to Phone (.vcf)
              </button>

              <button
                onClick={handleExportSalesforceSingle}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
              >
                <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
                Export Salesforce
              </button>

              <button
                onClick={() => setShowInspector(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 border border-emerald-500/30 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Inspect AES-256
              </button>
            </div>

            {syncedPhoneNotice && (
              <div className="mt-3 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>vCard generated! Tap downloaded file to save into iPhone/Android contacts.</span>
              </div>
            )}
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto">
            {/* Pipeline Stage Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-mono text-slate-400 block mb-0.5">
                  Sales Pipeline Stage
                </span>
                <span className="text-xs font-bold text-white">{pipelineStage}</span>
              </div>
              <select
                value={pipelineStage}
                onChange={e => handleStageChange(e.target.value as PipelineStage)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="New Lead">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Meeting Scheduled">Meeting Scheduled</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Qualified">Qualified</option>
                <option value="Closed Won">Closed Won</option>
              </select>
            </div>

            {/* Contact Details List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Email</span>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-emerald-400 hover:underline font-medium break-all"
                >
                  {contact.email || '—'}
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] uppercase font-mono block">Mobile</span>
                <a
                  href={`tel:${contact.phoneMobile}`}
                  className="text-slate-200 hover:text-emerald-400 font-medium"
                >
                  {contact.phoneMobile || '—'}
                </a>
              </div>

              {contact.phoneWork && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">
                    Office Phone
                  </span>
                  <span className="text-slate-200 font-medium">{contact.phoneWork}</span>
                </div>
              )}

              {contact.website && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">
                    Website
                  </span>
                  <a
                    href={
                      contact.website.startsWith('http')
                        ? contact.website
                        : `https://${contact.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline font-medium flex items-center gap-1 truncate"
                  >
                    {contact.website}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}

              {(contact.addressStreet || contact.addressCity) && (
                <div className="md:col-span-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">
                    Office Location
                  </span>
                  <span className="text-slate-200 font-medium">
                    {[
                      contact.addressStreet,
                      contact.addressCity,
                      contact.addressState,
                      contact.addressZip,
                      contact.addressCountry,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}

              {contact.linkedin && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-mono block">
                      LinkedIn
                    </span>
                    <span className="text-slate-200 font-medium truncate block max-w-[180px]">
                      {contact.linkedin}
                    </span>
                  </div>
                  <Linkedin className="w-4 h-4 text-sky-400" />
                </div>
              )}

              {contact.twitter && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-mono block">
                      Twitter / X
                    </span>
                    <span className="text-slate-200 font-medium">{contact.twitter}</span>
                  </div>
                  <Twitter className="w-4 h-4 text-sky-400" />
                </div>
              )}
            </div>

            {/* Notes */}
            {contact.notes && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold block mb-1">
                  Meeting Notes & Context:
                </span>
                <p className="text-slate-300 leading-relaxed">{contact.notes}</p>
              </div>
            )}

            {/* Tags */}
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map(t => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] border border-slate-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Sync History */}
            <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-[11px] space-y-1.5">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">
                Sync & Audit Log
              </span>
              <div className="flex items-center justify-between text-slate-400">
                <span>Scanned Date:</span>
                <span className="text-slate-200 font-mono">
                  {new Date(contact.createdAt).toLocaleDateString()} at{' '}
                  {new Date(contact.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>OCR Recognition Accuracy:</span>
                <span className="text-emerald-400 font-mono font-medium">
                  {contact.ocrConfidence}% ({contact.ocrEngine || 'Vision AI'})
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Local Encryption:</span>
                <span className="text-emerald-400 font-mono font-medium">
                  Active (AES-GCM 256)
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-t border-slate-800">
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${contact.fullName}?`)) {
                  onDelete(contact.id);
                  onClose();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Lead
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {showInspector && (
        <EncryptionInspectorModal
          contact={contact}
          onClose={() => setShowInspector(false)}
        />
      )}
    </>
  );
};
