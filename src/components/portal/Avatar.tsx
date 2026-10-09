import React, { useEffect, useState } from 'react';
import { getPrivateStorageUrl } from '../../lib/portalApi';

const initials = (name: string) => name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U';

const Avatar: React.FC<{ name?: string | null; path?: string | null; size?: 'sm' | 'md' | 'lg' }> = ({ name = 'UNS user', path, size = 'md' }) => {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    if (!path) { setSrc(null); return () => { mounted = false; }; }
    void getPrivateStorageUrl('avatars', path).then((url) => { if (mounted) setSrc(url); }).catch(() => { if (mounted) setSrc(null); });
    return () => { mounted = false; };
  }, [path]);
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg' };
  return src ? <img src={src} alt={`${name || 'User'} profile`} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`} /> : <div className={`${sizes[size]} flex items-center justify-center rounded-full bg-teal-300 font-semibold text-slate-950 ring-2 ring-white`}>{initials(name || 'UNS user')}</div>;
};

export default Avatar;
