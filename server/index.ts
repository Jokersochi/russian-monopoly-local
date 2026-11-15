import { createOnlineServer } from './http';
import { RoomService } from './rooms';

const port = Number(process.env.ONLINE_PORT ?? 3001);
const host = process.env.ONLINE_HOST ?? '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('ONLINE_PORT must be an integer between 1 and 65535');
}

const rooms = new RoomService();
const server = createOnlineServer(rooms);
server.requestTimeout = 15_000;
server.headersTimeout = 20_000;
server.listen(port, host, () => {
  console.info('Monopoly Online Core listening on http://' + host + ':' + port);
});
setInterval(() => rooms.cleanup(), 60 * 60 * 1000).unref();
