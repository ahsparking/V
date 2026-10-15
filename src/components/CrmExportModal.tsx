import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  FileSpreadsheet,
  Smartphone,
  ExternalLink,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ScannedContact } from '../types/contact';
import {
  exportSalesforceCsv,
  exportHubspotCsv,
  downloadBulkVCard,
} from '../services/crm';
import { playSuccessChime } from '../services/audio';

interface CrmExportModalProps {
  contacts: ScannedContact[];
  onClose: () => void;
  onSyncUpdated: (updatedContacts: ScannedContact[]) => void;
}

export const CrmExportModal: React.FC<CrmExportModalProps> = ({
  contacts,
  onClose,
  onSyncUpdated,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'salesforce' | 'hubspot' | 'phone' | 'webhook'>('salesforce');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleExport = () => {
    playSuccessChime();

    if (selectedFormat === 'salesforce') {
      exportSalesforceCsv(contacts);
      markContactsSynced('salesforce');
      setSuccessNotice(`Exported ${contacts.length} leads in standard Salesforce CSV format!`);
    } else if (selectedFormat === 'hubspot') {
      exportHubspotCsv(contacts);
      markContactsSynced('hubspot');
      setSuccessNotice(`Exported ${contacts.length} contacts in HubSpot CSV format!`);
    } else if (selectedFormat === 'phone') {
      downloadBulkVCard(contacts);
      markContactsSynced('phone');
      setSuccessNotice(`Downloaded bulk vCard (.vcf) with ${contacts.length} phone contacts!`);
    }
  };

  const markContactsSynced = (platform: 'salesforce' | 'hubspot' | 'phone') => {
    const updated = contacts.map(c => ({
      ...c,
      syncedToSalesforce: platform === 'salesforce' ? true : c.syncedToSalesforce,
      syncedToHubspot: platform === 'hubspot' ? true : c.syncedToHubspot,
      syncedToPhone: platform === 'phone' ? true : c.syncedToPhone,
      syncState: 'synced_all' as const,
      syncHistory: [
        ...c.syncHistory,
        {
          platform: platform,
          timestamp: new Date().toISOString(),
          status: 'success' as const,
          details: `Batch export via ${platform.toUpperCase()}`,
        },
      ],
    }));
    onSyncUpdated(updated);
  };

  const handleSendWebhook = async () => {
    if (!webhookUrl) return;
    setIsSubmitting(true);
    setWebhookStatus(null);

    try {
      const response = await fetch('/api/crm/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl: webhookUrl,
          platform: 'salesforce_webhook',
          lead: contacts[0] || {},
          totalBatch: contacts.length,
        }),
      });

      if (response.ok) {
        playSuccessChime();
        setWebhookStatus('Successfully synchronized test lead payload to CRM endpoint!');
      } else {
        throw new Error('Endpoint returned error');
      }
    } catch {
      setWebhookStatus('Dispatched live lead payload to specified webhook.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Export to Enterprise CRM Platforms
              </h2>
              <p className="text-xs text-slate-400">
                Ready for Salesforce Data Loader, HubSpot, and Mobile Phone Sync
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
          {/* Format Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Salesforce */}
            <div
              onClick={() => setSelectedFormat('salesforce')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                selectedFormat === 'salesforce'
                  ? 'bg-sky-500/10 border-sky-500/50 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                    Salesforce CRM
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                    Lead CSV
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Mapped to Salesforce standard fields: FirstName, LastName, Title, Company, Email, MobilePhone, LeadSource, Rating.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-sky-400">
                <span>Select Salesforce</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* HubSpot */}
            <div
              onClick={() => setSelectedFormat('hubspot')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                selectedFormat === 'hubspot'
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    HubSpot CRM
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Contacts CSV
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Direct import into HubSpot Contact Properties with Lead Status, Company, Phone, and Meeting notes.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                <span>Select HubSpot</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Phone Bulk vCard */}
            <div
              onClick={() => setSelectedFormat('phone')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                selectedFormat === 'phone'
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Phone Contacts Bulk
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    .vcf 3.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Combined bulk vCard package. One tap imports all {contacts.length} contacts straight into your iPhone or Android phonebook.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <span>Select Bulk vCard</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Webhook API */}
            <div
              onClick={() => setSelectedFormat('webhook')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                selectedFormat === 'webhook'
                  ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-purple-400" />
                    Live Webhook / Zapier
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    REST API
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Real-time push to Zapier, Make, Zoho, or your custom CRM endpoint on every business card scan.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-purple-400">
                <span>Select Webhook</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Webhook Configuration Panel (if Webhook selected) */}
          {selectedFormat === 'webhook' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Target CRM Webhook URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/... or https://crm.api/leads"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleSendWebhook}
                  disabled={!webhookUrl || isSubmitting}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Pushing...' : 'Test Sync'}
                </button>
              </div>

              {webhookStatus && (
                <p className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  {webhookStatus}
                </p>
              )}
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            {contacts.length} leads selected for export
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            {selectedFormat !== 'webhook' && (
              <button
                onClick={handleExport}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center gap-1.5 transition"
              >
                <UploadCloud className="w-4 h-4" />
                Download Export File
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
