import { httpsCallable } from 'firebase/functions';
import { functions } from './functions';

export async function createZoomMeetingForCourse(courseId: string): Promise<{ joinUrl: string; startUrl: string }> {
  const callable = httpsCallable(functions, 'createZoomMeetingForCourse');
  const res = await callable({ courseId });
  const data = res.data as any;

  const joinUrl = typeof data?.joinUrl === 'string' ? data.joinUrl : null;
  const startUrl = typeof data?.startUrl === 'string' ? data.startUrl : null;

  if (!joinUrl || !startUrl) {
    throw new Error('Unable to start Zoom meeting');
  }

  return { joinUrl, startUrl };
}
