#!/usr/bin/env node
/**
 * Manual, offline-only recovery for Online Core snapshots.
 *
 * Dry-run is the default. Applying requires both --apply and --confirm-offline:
 * the operator MUST stop the online server before invoking this command.
 * We never prune backups or send data over the network.
 */
import { createHash, randomBytes } from 'node:crypto';
import {
  closeSync, constants, existsSync, fstatSync, fsyncSync, lstatSync, mkdirSync,
  openSync, readFileSync, renameSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

const snapshotPath = resolve(process.env.ONLINE_DATA_FILE ?? '/app/data/rooms.json');
const backupDir = resolve(process.env.ONLINE_BACKUP_DIR ?? '/app/backups');
const MAX_BYTES = 32 * 1024 * 1024;

function fail(message) { throw new Error(message); }
function isObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

function parseArgs() {
  const args = process.argv.slice(2);
  let filename;
  let apply = false;
  let stopped = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && i + 1 < args.length && filename === undefined) {
      filename = args[++i];
    } else if (args[i] === '--apply' && !apply) {
      apply = true;
    } else if (args[i] === '--confirm-offline' && !stopped) {
      stopped = true;
    } else {
      fail('Usage: --file <backup filename> [--apply --confirm-offline]');
    }
  }
  if (!filename || basename(filename) !== filename
    || filename.includes('..')
    || !/^(rooms|pre-restore)-[A-Za-z0-9._-]+\.json$/.test(filename)) {
    fail('Specify a backup filename within ONLINE_BACKUP_DIR, without a path');
  }
  if (apply && !stopped) fail('Refusing restore: stop the online server and pass --confirm-offline');
  if (!apply && stopped) fail('--confirm-offline is only valid with --apply');
  return { filename, apply };
}

function regularPrivateFile(path) {
  const handle = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const meta = fstatSync(handle);
    if (!meta.isFile() || meta.size > MAX_BYTES) fail('Expected a regular snapshot at most 32 MiB');
    if (process.platform !== 'win32' && (meta.mode & 0o077) !== 0) {
      fail('Snapshot must be private (no group/other permissions)');
    }
    return readFileSync(handle);
  } finally {
    closeSync(handle);
  }
}

/** Preflight checks before any filesystem changes; RoomService does full validation on startup. */
function validateBackup(bytes) {
  let data;
  try { data = JSON.parse(bytes.toString('utf8')); }
  catch { fail('Backup is not valid JSON'); }
  if (!isObject(data) || data.schema !== 1 || !Array.isArray(data.rooms)
    || data.rooms.length > 500) fail('Backup has an unsupported snapshot schema');
  const ids = new Set();
  for (const room of data.rooms) {
    if (!isObject(room) || typeof room.id !== 'string'
      || !/^[a-f0-9]{10}$/i.test(room.id) || ids.has(room.id.toUpperCase())
      || typeof room.hostId !== 'string' || !Array.isArray(room.seats)
      || room.seats.length < 1 || room.seats.length > 6
      || !room.seats.some(seat => isObject(seat) && seat.id === room.hostId)
      || !Array.isArray(room.sessions) || room.sessions.length > 36
      || !Array.isArray(room.messages) || room.messages.length > 60
      || !(room.game === null || isObject(room.game))
      || !Number.isSafeInteger(room.version) || room.version < 1
      || !Number.isFinite(room.updatedAt) || room.updatedAt < 0) {
      fail('Backup contains an invalid room: no restore performed');
    }
    ids.add(room.id.toUpperCase());
  }
  return data.rooms.length;
}

function requireDirectory(path, create = false) {
  if (create) mkdirSync(path, { recursive: true, mode: 0o700 });
  if (!lstatSync(path).isDirectory()) fail('Expected a real directory (symlinks refused)');
}

function atomicWrite(path, bytes) {
  const directory = dirname(path);
  const temp = resolve(directory, '.' + basename(path) + '.' + randomBytes(8).toString('hex') + '.tmp');
  let fd;
  try {
    fd = openSync(temp, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL, 0o600);
    writeFileSync(fd, bytes);
    fsyncSync(fd);
    closeSync(fd);
    fd = undefined;
    renameSync(temp, path);
    if (process.platform !== 'win32') {
      let directoryHandle;
      try {
        directoryHandle = openSync(directory, constants.O_RDONLY);
        fsyncSync(directoryHandle);
      } catch {
        // Best effort: the data was fsynced and atomically renamed.
      } finally {
        if (directoryHandle !== undefined) closeSync(directoryHandle);
      }
    }
  } finally {
    if (fd !== undefined) closeSync(fd);
    try { unlinkSync(temp); } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
}

function restore() {
  const { filename, apply } = parseArgs();
  requireDirectory(backupDir);
  const incoming = regularPrivateFile(resolve(backupDir, filename));
  const rooms = validateBackup(incoming);
  const sha256 = createHash('sha256').update(incoming).digest('hex');
  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', backup: filename, rooms, bytes: incoming.byteLength, sha256 }));
    return;
  }

  const targetDir = dirname(snapshotPath);
  requireDirectory(targetDir, true);
  if (resolve(backupDir, filename) === snapshotPath) fail('Backup and restore paths must differ');
  const old = existsSync(snapshotPath) ? regularPrivateFile(snapshotPath) : null;
  let safeguard = null;
  if (old !== null) {
    safeguard = 'pre-restore-' + new Date().toISOString().replace(/[:.]/g, '-')
      + '-' + randomBytes(6).toString('hex') + '.json';
    atomicWrite(resolve(backupDir, safeguard), old);
  }
  atomicWrite(snapshotPath, incoming);
  console.log(JSON.stringify({
    mode: 'restored', backup: filename, preRestore: safeguard,
    rooms, bytes: incoming.byteLength, sha256,
  }));
}

try { restore(); }
catch (error) {
  console.error('Offline restore refused:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
