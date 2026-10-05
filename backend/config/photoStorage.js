import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { put, del, get } from '@vercel/blob';

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
  if (process.env.BLOB_PRIVATE_READ_WRITE_TOKEN) {
    const blob = await put(`membros/${userId}/${randomUUID()}${image.extension}`, file.buffer, {
      access: 'private', token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN, contentType: image.contentType, addRandomSuffix: true,
    });
    return { url: blob.url, remove: () => removePhoto(blob.url) };
  }
  if (process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Configure BLOB_PRIVATE_READ_WRITE_TOKEN para guardar fotografias privadas.');
  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `membro_${userId}_${randomUUID()}${image.extension}`;
  const target = path.join(uploadDir, filename);
  await fs.writeFile(target, file.buffer, { flag: 'wx' });
  return { url: `/uploads/${filename}`, remove: () => fs.unlink(target) };
}

function localPath(url) {
  const name = url.slice('/uploads/'.length);
  if (!name || name !== path.basename(name) || !/^[\w.-]+$/.test(name) || name.includes('..')) throw new Error('Caminho de fotografia inválido.');
  return path.join(uploadDir, name);
}

export function photoAccess(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port || !/^[a-z0-9-]+\.(public|private)\.blob\.vercel-storage\.com$/.test(parsed.hostname)) throw new Error('Armazenamento de fotografia inválido.');
  return parsed.hostname.includes('.private.') ? 'private' : 'public';
}

export async function readPhoto(url) {
  let buffer;
  if (url.startsWith('/uploads/')) buffer = await fs.readFile(localPath(url));
  else {
    const access = photoAccess(url);
    const token = access === 'private' ? process.env.BLOB_PRIVATE_READ_WRITE_TOKEN : process.env.BLOB_READ_WRITE_TOKEN;
    const blob = await get(url, { access, token, useCache: false });
    if (!blob || blob.statusCode !== 200 || blob.blob.size > 2 * 1024 * 1024) throw new Error('Fotografia indisponível.');
    buffer = Buffer.from(await new Response(blob.stream).arrayBuffer());
  }
  const image = detectImage(buffer);
  if (!image || buffer.length > 2 * 1024 * 1024) throw new Error('Fotografia inválida.');
  return { buffer, contentType: image.contentType };
}

export async function removePhoto(url) {
  if (!url) return;
  if (url.startsWith('/uploads/')) { await fs.unlink(localPath(url)).catch((error) => { if (error.code !== 'ENOENT') throw error; }); return; }
  const access = photoAccess(url);
  await del(url, { token: access === 'private' ? process.env.BLOB_PRIVATE_READ_WRITE_TOKEN : process.env.BLOB_READ_WRITE_TOKEN });
}
