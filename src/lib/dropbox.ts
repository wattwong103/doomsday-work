import type { AppData } from '../types';
import { importFromJSON, exportToJSON, mergeData } from './store';

const DROPBOX_FILE_PATH = '/doomsday-work-data.json';

// Dropbox API helpers
async function dropboxRequest(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(`Dropbox API error: ${res.status}`);
  }
  return res;
}

export async function uploadToDropbox(token: string, data: AppData): Promise<void> {
  const json = exportToJSON(data);
  await dropboxRequest('https://content.dropboxapi.com/2/files/upload', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: DROPBOX_FILE_PATH,
        mode: 'overwrite',
        autorename: false,
        mute: true,
      }),
    },
    body: json,
  });
}

export async function downloadFromDropbox(token: string): Promise<AppData | null> {
  try {
    const res = await dropboxRequest(
      'https://content.dropboxapi.com/2/files/download',
      token,
      {
        method: 'POST',
        headers: {
          'Dropbox-API-Arg': JSON.stringify({ path: DROPBOX_FILE_PATH }),
        },
      }
    );
    const text = await res.text();
    return importFromJSON(text);
  } catch {
    return null;
  }
}

export async function syncWithDropbox(
  token: string,
  localData: AppData
): Promise<AppData> {
  const remoteData = await downloadFromDropbox(token);
  if (!remoteData) {
    await uploadToDropbox(token, localData);
    return localData;
  }

  const merged = mergeData(localData, remoteData);
  await uploadToDropbox(token, merged);
  return merged;
}

// Generate Dropbox OAuth URL
// User needs to create an app at https://www.dropbox.com/developers/apps
// with "files.content.write" and "files.content.read" scopes
export function getDropboxAuthUrl(clientId: string): string {
  const redirectUri = window.location.origin + '/auth/dropbox';
  return (
    `https://www.dropbox.com/oauth2/authorize?` +
    `client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}`
  );
}

export function parseDropboxToken(): string | null {
  const hash = window.location.hash;
  if (!hash.includes('access_token=')) return null;
  const params = new URLSearchParams(hash.slice(1));
  return params.get('access_token');
}
