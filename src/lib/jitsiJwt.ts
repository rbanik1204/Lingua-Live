import { httpsCallable } from 'firebase/functions';
import { functions } from './functions';

type GetJitsiJwtResponse = {
  token: string;
  domain?: string;
  room?: string;
  expiresInSeconds?: number;
};

export async function fetchJitsiModeratorJwt(roomName: string): Promise<string> {
  const callable = httpsCallable(functions, 'getJitsiJwt');
  const result = await callable({ roomName });

  const data = result.data as Partial<GetJitsiJwtResponse> | undefined;
  const token = typeof data?.token === 'string' ? data.token : '';
  if (!token) throw new Error('Unable to get moderator token');
  return token;
}
