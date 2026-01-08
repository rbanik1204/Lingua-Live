export type JitsiEnvConfig = {
  domain: string;
  roomNamePrefix?: string;
};

function readEnv(key: string): string | undefined {
  // Vite exposes import.meta.env at build time.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any).env as Record<string, unknown> | undefined;
  const raw = env?.[key];
  return typeof raw === 'string' && raw.trim().length ? raw.trim() : undefined;
}

export function getJitsiEnvConfig(): JitsiEnvConfig {
  return {
    domain: readEnv('VITE_JITSI_DOMAIN') ?? 'meet.jit.si',
    roomNamePrefix: readEnv('VITE_JITSI_ROOM_NAME_PREFIX'),
  };
}
