import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

export default function AuthenticatedPhoto({ src, fallback, ...props }) {
  const [loaded, setLoaded] = useState(null);
  useEffect(() => {
    if (!src?.startsWith('/api/membros/')) return;
    const controller = new AbortController();
    let objectUrl;
    apiFetch(src, { signal: controller.signal, cache: 'no-store' }).then(async (response) => {
      if (!response.ok) throw new Error('Fotografia indisponível');
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob);
      setLoaded({ src, url: objectUrl });
    }).catch(() => {});
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);
  const direct = src?.startsWith('blob:') || src?.startsWith('data:') ? src : fallback;
  return <img {...props} src={loaded?.src === src ? loaded.url : direct} />;
}
