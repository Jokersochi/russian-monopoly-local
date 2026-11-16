#!/usr/bin/env node
// Offline-capable copy of the server's atomic JSON snapshot. No credentials or API calls.
import { createHash, randomBytes } from 'node:crypto';
import {
  chmodSync, closeSync, constants, fstatSync, fsyncSync, lstatSync, mkdirSync,
  openSync, readFileSync, renameSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { basename, resolve } from 'node:path';

const source = resolve(process.env.ONLINE_DATA_FILE ?? '/app/data/rooms.json');
const destination = resolve(process.env.ONLINE_BACKUP_DIR ?? '/app/backups');

function validate(data) {
  if (data.byteLength > 32 * 1024 * 1024) {
    throw new Error('Snapshot exceeds 32 MiB; investigate before backing up');
  }
  const value = JSON.parse(data.toString('utf8'));
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || value.schema !== 1 || !Array.isArray(value.rooms) || value.rooms.length > 500) {
    throw new Error('Invalid online room snapshot: no backup created');
  }
}

function backup() {
  const fd = openSync(source, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  let data;
  try {
    const meta = fstatSync(fd);
    if (!meta.isFile()) throw new Error('Snapshot must be a regular file');
    if (process.platform !== 'win32' && (meta.mode & 0o077) !== 0) {
      throw new Error('Snapshot permissions must not allow group/other access');
    }
    data = readFileSync(fd);
  } finally {
    closeSync(fd);
  }
  validate(data);

  mkdirSync(destination, { recursive: true, mode: 0o700 });
  if (!lstatSync(destination).isDirectory()) {
    throw new Error('Backup destination must be a directory, not a symlink');
  }
  chmodSync(destination, 0o700);

  const suffix = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomBytes(6).toString('hex');
  const filename = 'rooms-' + suffix + '.json';
  const temporary = resolve(destination, '.' + filename + '.tmp');
  const finalName = resolve(destination, filename);
  let output;
  try {
    output = openSync(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL, 0o600);
    writeFileSync(output, data);
    fsyncSync(output);
    closeSync(output);
    output = undefined;
    renameSync(temporary, finalName);
  } finally {
    if (output !== undefined) closeSync(output);
    try { unlinkSync(temporary); } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  console.log(JSON.stringify({
    backup: basename(finalName),
    bytes: data.byteLength,
    sha256: createHash('sha256').update(data).digest('hex'),
  }));
}

try {
  backup();
} catch (error) {
  console.error('Online backup failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
