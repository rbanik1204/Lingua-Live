import { useEffect, useMemo, useRef, useState } from 'react';

declare global {
  interface Window {
    JitsiMeetExternalAPI?: unknown;
  }
}

type JitsiApi = {
  dispose: () => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
  addEventListener: (event: string, handler: (payload: any) => void) => void;
  removeEventListener: (event: string, handler: (payload: any) => void) => void;
};

type JitsiExternalApiCtor = new (
  domain: string,
  options: {
    roomName: string;
    parentNode: HTMLElement;
    width?: string | number;
    height?: string | number;
    userInfo?: { displayName?: string; email?: string };
    jwt?: string;
    configOverwrite?: Record<string, unknown>;
    interfaceConfigOverwrite?: Record<string, unknown>;
  }
) => JitsiApi;

async function ensureJitsiScriptLoaded(domain: string): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.JitsiMeetExternalAPI) return;

  const scriptSrc = `https://${domain}/external_api.js`;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-jitsi-external-api="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Jitsi external API')));
      return;
    }

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    script.dataset.jitsiExternalApi = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Jitsi external API'));
    document.body.appendChild(script);
  });
}

export interface JitsiMeetProps {
  domain?: string;
  roomNamePrefix?: string;
  jwt?: string;
  roomName: string;
  displayName: string;
  email?: string;
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
  onApiReady?: (api: JitsiApi) => void;
  onAudioMuteChanged?: (muted: boolean) => void;
  onVideoMuteChanged?: (muted: boolean) => void;
}

export function JitsiMeet({
  domain = 'meet.jit.si',
  roomNamePrefix,
  jwt,
  roomName,
  displayName,
  email,
  startWithAudioMuted,
  startWithVideoMuted,
  onApiReady,
  onAudioMuteChanged,
  onVideoMuteChanged,
}: JitsiMeetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const onApiReadyRef = useRef<JitsiMeetProps['onApiReady']>(onApiReady);
  const onAudioMuteChangedRef = useRef<JitsiMeetProps['onAudioMuteChanged']>(onAudioMuteChanged);
  const onVideoMuteChangedRef = useRef<JitsiMeetProps['onVideoMuteChanged']>(onVideoMuteChanged);

  // Keep latest callbacks without forcing a Jitsi remount.
  useEffect(() => {
    onApiReadyRef.current = onApiReady;
  }, [onApiReady]);

  useEffect(() => {
    onAudioMuteChangedRef.current = onAudioMuteChanged;
  }, [onAudioMuteChanged]);

  useEffect(() => {
    onVideoMuteChangedRef.current = onVideoMuteChanged;
  }, [onVideoMuteChanged]);

  // Capture initial mute settings only at mount time.
  const startAudioMutedRef = useRef(Boolean(startWithAudioMuted));
  const startVideoMutedRef = useRef(Boolean(startWithVideoMuted));

  const normalizedRoomName = useMemo(() => {
    const cleaned = roomName.trim().replace(/[^a-zA-Z0-9-_]/g, '-');
    return cleaned.length ? cleaned : 'LinguaLive';
  }, [roomName]);

  const fullRoomName = useMemo(() => {
    const prefix = roomNamePrefix?.trim();
    if (!prefix) return normalizedRoomName;
    // JaaS-style deployments often require a tenant prefix like: vpaas-magic-cookie-<tenant>/<room>
    return `${prefix.replace(/\/+$/g, '')}/${normalizedRoomName.replace(/^\/+/, '')}`;
  }, [roomNamePrefix, normalizedRoomName]);

  useEffect(() => {
    let api: JitsiApi | null = null;
    let cancelled = false;

    const audioHandler = (payload: any) => {
      const muted = Boolean(payload?.muted);
      onAudioMuteChangedRef.current?.(muted);
    };

    const videoHandler = (payload: any) => {
      const muted = Boolean(payload?.muted);
      onVideoMuteChangedRef.current?.(muted);
    };

    async function mount() {
      try {
        setLoadError(null);
        await ensureJitsiScriptLoaded(domain);
        if (cancelled) return;

        const ctor = window.JitsiMeetExternalAPI as JitsiExternalApiCtor | undefined;
        if (!ctor) {
          setLoadError('Video engine failed to load.');
          return;
        }
        const parentNode = containerRef.current;
        if (!parentNode) return;

        // Clear any previous content (important when React remounts).
        parentNode.innerHTML = '';

        api = new ctor(domain, {
          roomName: fullRoomName,
          parentNode,
          width: '100%',
          height: '100%',
          userInfo: { displayName, email },
          jwt,
          configOverwrite: {
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            useHostPageLocalStorage: true,
            // Reduce friction on public deployments (best-effort; server may override).
            requireDisplayName: false,
            // Best-effort UI hardening if lobby exists; server may still enforce it.
            securityUi: {
              hideLobbyButton: true,
              disableLobbyPassword: true,
            },
            lobby: {
              autoKnock: false,
              enableChat: false,
            },
            startWithAudioMuted: startAudioMutedRef.current,
            startWithVideoMuted: startVideoMutedRef.current,
          },
        });

        api.addEventListener('audioMuteStatusChanged', audioHandler);
        api.addEventListener('videoMuteStatusChanged', videoHandler);

        onApiReadyRef.current?.(api);
      } catch (err) {
        if (cancelled) return;
        setLoadError('Unable to start video right now.');
      }
    }

    mount();

    return () => {
      cancelled = true;
      if (api) {
        try {
          api.removeEventListener('audioMuteStatusChanged', audioHandler);
          api.removeEventListener('videoMuteStatusChanged', videoHandler);
          api.dispose();
        } catch {
          // ignore
        }
      }
    };
  }, [
    domain,
    fullRoomName,
    displayName,
    email,
    jwt,
  ]);

  return (
    <div className="w-full h-full">
      {loadError ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
          <div className="text-center px-6">
            <div className="text-white text-lg">Video unavailable</div>
            <div className="text-white/70 text-sm mt-1">{loadError}</div>
            <div className="text-white/50 text-xs mt-3">Tip: allow camera & microphone permissions.</div>
          </div>
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full" />
      )}
    </div>
  );
}
