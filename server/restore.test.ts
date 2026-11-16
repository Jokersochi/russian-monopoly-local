import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { RoomService } from './rooms';
import { JsonRoomStore } from './storage';

const backupScript = fileURLToPath(new URL('../scripts/online-state-backup.mjs', import.meta.url));
const restoreScript = fileURLToPath(new URL('../scripts/online-state-restore.mjs', import.meta.url));
const directories: string[] = [];

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'monopoly-restore-'));
  directories.push(root);
  const source = join(root, 'data', 'rooms.json');
  const backups = join(root, 'backups');
  return { source, backups, rooms: new RoomService(new JsonRoomStore(source)) };
}

function run(script: string, source: string, backups: string, args: string[] = []) {
  return spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ONLINE_DATA_FILE: source, ONLINE_BACKUP_DIR: backups },
  });
}

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('offline online-state restoration', () => {
  it('defaults to dry-run and requires explicit offline confirmation before replacing data', () => {
    const { source, backups, rooms } = fixture();
    const host = rooms.create('Алиса');
    const backedUpState = readFileSync(source);
    expect(run(backupScript, source, backups).status).toBe(0);
    const filename = readdirSync(backups)[0];

    rooms.join(host.room.roomId, 'Борис');
    const changedState = readFileSync(source);

    const preview = run(restoreScript, source, backups, ['--file', filename]);
    expect(preview.status).toBe(0);
    expect(JSON.parse(preview.stdout).mode).toBe('dry-run');
    expect(readFileSync(source)).toEqual(changedState);

    const blocked = run(restoreScript, source, backups, ['--file', filename, '--apply']);
    expect(blocked.status).not.toBe(0);
    expect(blocked.stderr).toContain('--confirm-offline');
    expect(readFileSync(source)).toEqual(changedState);

    const applied = run(restoreScript, source, backups,
      ['--file', filename, '--apply', '--confirm-offline']);
    expect(applied.status).toBe(0);
    const response = JSON.parse(applied.stdout) as { mode: string; preRestore: string; rooms: number };
    expect(response.mode).toBe('restored');
    expect(response.rooms).toBe(1);
    expect(readFileSync(source)).toEqual(backedUpState);
    expect(readFileSync(join(backups, response.preRestore))).toEqual(changedState);
    const recovered = new RoomService(new JsonRoomStore(source));
    expect(recovered.get(host.room.roomId, host.sessionId).players).toHaveLength(1);
  });

  it('refuses corrupt payloads, invalid rooms and path traversal without overwriting current data', () => {
    const { source, backups, rooms } = fixture();
    rooms.create('Алиса');
    expect(run(backupScript, source, backups).status).toBe(0);
    const original = readFileSync(source);
    const filename = readdirSync(backups)[0];
    const bad = join(backups, 'rooms-invalid.json');

    writeFileSync(bad, '{"schema":1,"rooms":[{"id":"bad"}]}', { mode: 0o600 });
    if (process.platform !== 'win32') chmodSync(bad, 0o600);
    const result = run(restoreScript, source, backups,
      ['--file', 'rooms-invalid.json', '--apply', '--confirm-offline']);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('invalid room');
    expect(readFileSync(source)).toEqual(original);

    const traversal = run(restoreScript, source, backups, ['--file', '../rooms.json']);
    expect(traversal.status).not.toBe(0);
    expect(readFileSync(source)).toEqual(original);

    const missing = run(restoreScript, source, backups, ['--file', 'rooms-not-found.json']);
    expect(missing.status).not.toBe(0);
    expect(readdirSync(backups).includes(filename)).toBe(true);
  });

  it.skipIf(process.platform === 'win32')('refuses a nonprivate backup', () => {
    const { source, backups, rooms } = fixture();
    rooms.create('Алиса');
    expect(run(backupScript, source, backups).status).toBe(0);
    const filename = readdirSync(backups)[0];
    chmodSync(join(backups, filename), 0o644);
    const result = run(restoreScript, source, backups, ['--file', filename]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('private');
  });

  it('restores into an empty data directory when the operator confirms offline state', () => {
    const { source, backups, rooms } = fixture();
    const host = rooms.create('Алиса');
    expect(run(backupScript, source, backups).status).toBe(0);
    const filename = readdirSync(backups)[0];

    rmSync(source);
    const result = run(restoreScript, source, backups,
      ['--file', filename, '--apply', '--confirm-offline']);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).preRestore).toBeNull();
    expect(new RoomService(new JsonRoomStore(source)).get(host.room.roomId, host.sessionId).youId).toBe(host.room.youId);
  });
});
