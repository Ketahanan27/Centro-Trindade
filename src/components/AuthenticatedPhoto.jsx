import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="260" height="260"%3E%3Crect width="260" height="260" fill="%23e2e8f0"/%3E%3Ccircle cx="130" cy="95" r="45" fill="%2394a3b8"/%3E%3Cellipse cx="130" cy="220" rx="80" ry="70" fill="%2394a3b8"/%3E%3C/svg%3E';

export default function AuthenticatedPhoto({ src, fallback = PLACEHOLDER, ...props }) {
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
  const imageSrc = loaded && loaded.src === src ? loaded.url : direct;
  return <img key={imageSrc} {...props} src={imageSrc} />;
}
