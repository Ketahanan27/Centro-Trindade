import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { put, del } from '@vercel/blob';

export const uploadDir = fileURLToPath(new URL('../uploads/', import.meta.url));

export function detectImage(buffer) {
  if (!Buffer.isBuffer(buffer)) return null;
  const starts = (bytes, offset = 0) => bytes.every((byte, i) => buffer[offset + i] === byte);
  if (starts([0xff, 0xd8, 0xff])) return { extension: '.jpg', contentType: 'image/jpeg' };
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { extension: '.png', contentType: 'image/png' };
  if (buffer.subarray(0, 6).toString() === 'GIF87a' || buffer.subarray(0, 6).toString() === 'GIF89a') return { extension: '.gif', contentType: 'image/gif' };
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return { extension: '.webp', contentType: 'image/webp' };
  return null;
}

export async function savePhoto(file, userId) {
  const image = detectImage(file.buffer);
  if (!image) throw new Error('Imagem inválida.');
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`membros/${userId}/${randomUUID()}${image.extension}`, file.buffer, {
      access: 'public', contentType: image.contentType, addRandomSuffix: true,
    });
    return { url: blob.url, remove: () => del(blob.url) };
  }
  if (process.env.VERCEL) throw new Error('Configure BLOB_READ_WRITE_TOKEN para guardar fotografias.');
  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `membro_${userId}_${randomUUID()}${image.extension}`;
  const target = path.join(uploadDir, filename);
  await fs.writeFile(target, file.buffer, { flag: 'wx' });
  return { url: `/uploads/${filename}`, remove: () => fs.unlink(target) };
}
