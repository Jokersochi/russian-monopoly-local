import {
  closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync,
  unlinkSync, writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

export interface RoomStore {
  load(): unknown;
  save(value: unknown): void;
}

/**
 * Atomic single-process snapshot store.
 *
 * Data includes hashed session tokens, player names, and chat history.
 * The file is private (0600). A corrupt snapshot aborts startup rather
 * than silently replacing players' games.
 */
export class JsonRoomStore implements RoomStore {
  readonly filename: string;

  constructor(filename: string) {
    this.filename = resolve(filename);
    mkdirSync(dirname(this.filename), { recursive: true, mode: 0o700 });
  }

  load(): unknown {
    if (!existsSync(this.filename)) return { schema: 1, rooms: [] };
    return JSON.parse(readFileSync(this.filename, 'utf8')) as unknown;
  }

  save(value: unknown): void {
    const temporary = this.filename + '.' + randomBytes(8).toString('hex') + '.tmp';
    const data = JSON.stringify(value);
    let descriptor: number | undefined;
    try {
      descriptor = openSync(temporary, 'wx', 0o600);
      writeFileSync(descriptor, data, 'utf8');
      fsyncSync(descriptor);
      closeSync(descriptor);
      descriptor = undefined;
      renameSync(temporary, this.filename);
      // Best-effort directory sync makes the rename durable on POSIX filesystems.
      if (process.platform !== 'win32') {
        const directory = openSync(dirname(this.filename), 'r');
        try {
          // Some mounted filesystems reject directory fsync. The atomic
          // rename has already committed, so a late error must not cause
          // the in-memory transaction to roll back behind the disk state.
          try {
            fsyncSync(directory);
          } catch {
            // Best effort: file contents were fsynced before the rename.
          }
        } finally {
          closeSync(directory);
        }
      }
    } finally {
      if (descriptor !== undefined) closeSync(descriptor);
      if (existsSync(temporary)) unlinkSync(temporary);
    }
  }
}
