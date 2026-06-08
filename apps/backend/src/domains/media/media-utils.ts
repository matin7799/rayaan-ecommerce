import { MediaType } from './entities/media.entity';

export function extractFilenameFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const rawFilename = pathname.substring(pathname.lastIndexOf('/') + 1);

    if (!rawFilename) {
      return `remote-media-${Date.now()}`;
    }

    return decodeURIComponent(rawFilename);
  } catch {
    return `remote-media-${Date.now()}`;
  }
}

export function getMimeTypeFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.toLowerCase();
    const extension = pathname.split('.').pop();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  } catch {
    return 'application/octet-stream';
  }
}

export function getMediaTypeFromMimeType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) {
    return MediaType.IMAGE;
  }

  if (mimeType.startsWith('video/')) {
    return MediaType.VIDEO;
  }

  if (mimeType === 'application/pdf') {
    return MediaType.DOCUMENT;
  }

  return MediaType.IMAGE;
}

export function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) {
    return MediaType.IMAGE;
  }

  if (mimeType.startsWith('video/')) {
    return MediaType.VIDEO;
  }

  return MediaType.DOCUMENT;
}
