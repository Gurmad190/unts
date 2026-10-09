import React, { useEffect, useState } from 'react';
import { ImagePlus, Save, Settings2 } from 'lucide-react';
import { Button, Input, Notice, PageHeader, cardClass } from '../../components/portal/ui';
import { getBranding, updateBranding, uploadBrandingLogo, type BrandingSettings } from '../../lib/portalApi';

const Settings: React.FC = () => {
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [name, setName] = useState('University of Northeastern Somalia');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { void getBranding().then((value) => { setBranding(value); setName(value.university_name); }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load branding settings.')); }, []);
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setNotice(null); setError(null);
    try { const value = logoFile ? await uploadBrandingLogo(logoFile, name) : await updateBranding(name, branding?.logo_url || null); setBranding(value); setLogoFile(null); setNotice('Branding settings saved.'); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save branding settings.'); } finally { setSaving(false); }
  };
  return <div className="space-y-8"><PageHeader eyebrow="System settings" title="University branding" description="Configure the university name and logo used by the public website. The existing static logo remains the fallback if no setting is configured." /><form onSubmit={save} className={`${cardClass} max-w-3xl p-6`}><div className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-teal-600" /><h2 className="font-semibold">Brand identity</h2></div>{notice && <div className="mt-5"><Notice tone="success">{notice}</Notice></div>}{error && <div className="mt-5"><Notice tone="error">{error}</Notice></div>}<label className="mt-6 block text-sm font-medium">University name<Input value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5" /></label><label className="mt-5 block text-sm font-medium">Logo file<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => setLogoFile(event.target.files?.[0] || null)} className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" /></label>{branding?.logo_url && <div className="mt-5 flex items-center gap-4 rounded-xl bg-slate-50 p-4"><img src={branding.logo_url} alt="Current university logo" className="h-16 w-16 rounded-full object-cover" /><div><p className="text-sm font-semibold">Current logo</p><p className="mt-1 text-xs text-slate-500">Upload a new image to replace the configured logo. The fallback remains available.</p></div></div>}<Button type="submit" className="mt-6" disabled={saving}><Save className="mr-2 h-4 w-4" /> Save branding</Button></form><div className={`${cardClass} max-w-3xl p-6`}><div className="flex items-start gap-3"><ImagePlus className="mt-0.5 h-5 w-5 text-slate-500" /><div><h2 className="font-semibold">Upload boundary</h2><p className="mt-1 text-sm leading-6 text-slate-500">Only super administrators and administrators can write branding objects. The public website reads the configured logo from a public branding bucket; service-role credentials never reach the browser.</p></div></div></div></div>;
};
export default Settings;
