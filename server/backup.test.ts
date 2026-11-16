import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { RoomService } from './rooms';
import { JsonRoomStore } from './storage';

const backupScript = fileURLToPath(new URL('../scripts/online-state-backup.mjs', import.meta.url));
const directories: string[] = [];

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'monopoly-backup-'));
  directories.push(root);
  const source = join(root, 'data', 'rooms.json');
  const backupDir = join(root, 'private-backups');
  return { source, backupDir };
}

function runBackup(source: string, backupDir: string) {
  return spawnSync(process.execPath, [backupScript], {
    encoding: 'utf8',
    env: { ...process.env, ONLINE_DATA_FILE: source, ONLINE_BACKUP_DIR: backupDir },
  });
}

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('private online room backups', () => {
  it('captures a valid snapshot without modifying the game or exposing the session token', () => {
    const { source, backupDir } = fixture();
    const room = new RoomService(new JsonRoomStore(source));
    const host = room.create('Алиса');
    const original = readFileSync(source);
    const run = runBackup(source, backupDir);

    expect(run.status).toBe(0);
    const names = readdirSync(backupDir);
    expect(names).toHaveLength(1);
    expect(names[0]).toMatch(/^rooms-.*\.json$/);
    const copy = readFileSync(join(backupDir, names[0]));
    expect(copy).toEqual(original);
    expect(readFileSync(source)).toEqual(original);
    expect(copy.toString('utf8')).not.toContain(host.sessionId);
    const report = JSON.parse(run.stdout) as { backup: string; bytes: number; sha256: string };
    expect(report.backup).toBe(names[0]);
    expect(report.bytes).toBe(original.byteLength);
    expect(report.sha256).toBe(createHash('sha256').update(original).digest('hex'));
    if (process.platform !== 'win32') {
      expect(statSync(backupDir).mode & 0o777).toBe(0o700);
      expect(statSync(join(backupDir, names[0])).mode & 0o777).toBe(0o600);
    }
    const restored = new RoomService(new JsonRoomStore(join(backupDir, names[0])));
    expect(restored.get(host.room.roomId, host.sessionId).youId).toBe(host.room.youId);
  });

  it('refuses invalid snapshots instead of backing up invalid state', () => {
    const { source, backupDir } = fixture();
    new RoomService(new JsonRoomStore(source)).create('Алиса');
    writeFileSync(source, '{"schema":2,"rooms":[]}');
    const run = runBackup(source, backupDir);
    expect(run.status).not.toBe(0);
    expect(run.stderr).toContain('Invalid online room snapshot');
    expect(() => readdirSync(backupDir)).toThrow();
  });

  it('refuses a missing snapshot rather than fabricating an empty session', () => {
    const { source, backupDir } = fixture();
    const run = runBackup(source, backupDir);
    expect(run.status).not.toBe(0);
    expect(() => readdirSync(backupDir)).toThrow();
  });

  it.skipIf(process.platform === 'win32')('refuses world-readable source data', () => {
    const { source, backupDir } = fixture();
    new RoomService(new JsonRoomStore(source)).create('Алиса');
    chmodSync(source, 0o644);
    const run = runBackup(source, backupDir);
    expect(run.status).not.toBe(0);
    expect(run.stderr).toContain('Snapshot permissions');
  });
});
