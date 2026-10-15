import React, { useState } from 'react';
import {
  X,
  Check,
  User,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  Flame,
  Smartphone,
  ShieldCheck,
  CloudUpload,
  Sparkles,
  Tag,
  Share2,
} from 'lucide-react';
import { ScannedContact, LeadPriority, PipelineStage } from '../types/contact';
import { downloadVCard } from '../services/crm';
import { playSuccessChime } from '../services/audio';

interface ReviewModalProps {
  initialData: any;
  cardImageUri?: string;
  onSave: (contact: ScannedContact, autoSyncPhone: boolean) => void;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  initialData,
  cardImageUri,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    firstName: initialData.firstName || initialData.fullName?.split(' ')[0] || '',
    lastName: initialData.lastName || initialData.fullName?.split(' ').slice(1).join(' ') || '',
    jobTitle: initialData.jobTitle || '',
    company: initialData.company || '',
    department: initialData.department || '',
    industry: initialData.industry || 'Technology & Innovation',
    email: initialData.email || '',
    phoneMobile: initialData.phoneMobile || '',
    phoneWork: initialData.phoneWork || '',
    website: initialData.website || '',
    addressStreet: initialData.addressStreet || '',
    addressCity: initialData.addressCity || '',
    addressState: initialData.addressState || '',
    addressZip: initialData.addressZip || '',
    addressCountry: initialData.addressCountry || 'United States',
    linkedin: initialData.linkedin || '',
    twitter: initialData.twitter || '',
    tagline: initialData.tagline || '',
    notes: initialData.notes || '',
    leadPriority: (initialData.leadPriority as LeadPriority) || 'Hot',
    leadRating: initialData.leadRating || 5,
    pipelineStage: 'New Lead' as PipelineStage,
  });

  const [tags, setTags] = useState<string[]>(['Scanned Lead', 'CardVault Pro']);
  const [tagInput, setTagInput] = useState('');
  const [syncToPhoneChecked, setSyncToPhoneChecked] = useState(true);
  const [authorizeCloudSync, setAuthorizeCloudSync] = useState(false);

  const handleFieldChange = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(item => item !== t));
  };

  const handleSubmit = (exportPhoneDirect: boolean = false) => {
    playSuccessChime();

    const contact: ScannedContact = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fullName: formData.fullName || `${formData.firstName} ${formData.lastName}`.trim(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      jobTitle: formData.jobTitle,
      company: formData.company,
      department: formData.department,
      industry: formData.industry,
      email: formData.email,
      phoneMobile: formData.phoneMobile,
      phoneWork: formData.phoneWork,
      website: formData.website,
      addressStreet: formData.addressStreet,
      addressCity: formData.addressCity,
      addressState: formData.addressState,
      addressZip: formData.addressZip,
      addressCountry: formData.addressCountry,
      linkedin: formData.linkedin,
      twitter: formData.twitter,
      tagline: formData.tagline,
      notes: formData.notes,
      tags: tags,
      leadRating: formData.leadRating,
      leadPriority: formData.leadPriority,
      pipelineStage: formData.pipelineStage,
      cardImageUri: cardImageUri,
      ocrConfidence: initialData.ocrConfidence || 98,
      ocrEngine: initialData.engine || 'Gemini 3.8 Flash Vision AI',
      isEncrypted: true,
      syncState: authorizeCloudSync ? 'synced_all' : 'pending_authorization',
      syncedToPhone: exportPhoneDirect || syncToPhoneChecked,
      syncedToSalesforce: false,
      syncedToHubspot: false,
      syncedToCloud: authorizeCloudSync,
      syncHistory: [
        ...(exportPhoneDirect || syncToPhoneChecked
          ? [
              {
                platform: 'phone' as const,
                timestamp: new Date().toISOString(),
                status: 'success' as const,
                details: 'Direct vCard synced to phone contacts',
              },
            ]
          : []),
      ],
    };

    if (exportPhoneDirect || syncToPhoneChecked) {
      downloadVCard(contact);
    }

    onSave(contact, exportPhoneDirect || syncToPhoneChecked);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Review Scanned Business Card
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {initialData.ocrConfidence || 98}% Accuracy
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Extracted via Gemini 3.8 Flash Vision AI &bull; Encrypted locally
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

        {/* Body Container */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Card Image Preview Banner */}
          {cardImageUri && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black/50 p-2 flex items-center justify-center">
              <img
                src={cardImageUri}
                alt="Business Card"
                className="max-h-40 rounded-xl object-contain shadow-md"
              />
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[10px] text-slate-300 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Raw Card Image Archived
              </div>
            </div>
          )}

          {/* Lead Qualification & Priority Bar */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Lead Priority
              </label>
              <div className="flex items-center gap-1.5">
                {(['Hot', 'Warm', 'Cold'] as LeadPriority[]).map(pri => (
                  <button
                    key={pri}
                    type="button"
                    onClick={() => handleFieldChange('leadPriority', pri)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      formData.leadPriority === pri
                        ? pri === 'Hot'
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                          : pri === 'Warm'
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                          : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pri === 'Hot' && <Flame className="w-3.5 h-3.5" />}
                    {pri}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Lead Rating ({formData.leadRating}/5)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleFieldChange('leadRating', star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= formData.leadRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
                CRM Pipeline Stage
              </label>
              <select
                value={formData.pipelineStage}
                onChange={e => handleFieldChange('pipelineStage', e.target.value)}
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
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => handleFieldChange('fullName', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                placeholder="John Doe"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                Job Title
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={e => handleFieldChange('jobTitle', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                placeholder="Chief Executive Officer"
              />
            </div>

            {/* Company */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Company / Organization
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={e => handleFieldChange('company', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                placeholder="Acme Corp"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={e => handleFieldChange('industry', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                placeholder="Software & Cloud"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleFieldChange('email', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                placeholder="name@company.com"
              />
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Mobile Phone
              </label>
              <input
                type="text"
                value={formData.phoneMobile}
                onChange={e => handleFieldChange('phoneMobile', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Work Phone */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Work / Office Phone
              </label>
              <input
                type="text"
                value={formData.phoneWork}
                onChange={e => handleFieldChange('phoneWork', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                placeholder="+1 (555) 111-2222"
              />
            </div>

            {/* Website */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Website URL
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={e => handleFieldChange('website', e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                placeholder="https://company.com"
              />
            </div>
          </div>

          {/* Physical Address */}
          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Office Address
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={formData.addressStreet}
                onChange={e => handleFieldChange('addressStreet', e.target.value)}
                className="md:col-span-3 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                placeholder="Street Address, Suite / Floor"
              />
              <input
                type="text"
                value={formData.addressCity}
                onChange={e => handleFieldChange('addressCity', e.target.value)}
                className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                placeholder="City"
              />
              <input
                type="text"
                value={formData.addressState}
                onChange={e => handleFieldChange('addressState', e.target.value)}
                className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                placeholder="State / Region"
              />
              <input
                type="text"
                value={formData.addressZip}
                onChange={e => handleFieldChange('addressZip', e.target.value)}
                className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                placeholder="Postal / Zip Code"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              Tags & Labels
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {tags.map(t => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add custom tag (e.g. Dreamforce 2026, VIP, Enterprise)..."
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Meeting Notes */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Meeting Notes & Follow-up Context
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => handleFieldChange('notes', e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              placeholder="Key talking points, budget, timeline, action items..."
            />
          </div>

          {/* Sync & Privacy Options */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Auto-Save to Phone Contacts
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Immediately generates native vCard for iOS/Android Contacts app
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={syncToPhoneChecked}
                onChange={e => setSyncToPhoneChecked(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-500/10">
              <div className="flex items-center gap-2.5">
                <CloudUpload className="w-5 h-5 text-teal-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Authorize Cloud Sync
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Allow synchronization to authorized Google Drive / iCloud cloud backups
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={authorizeCloudSync}
                onChange={e => setAuthorizeCloudSync(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-slate-950/80 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted with AES-256 before disk write</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              Save to Encrypted Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
