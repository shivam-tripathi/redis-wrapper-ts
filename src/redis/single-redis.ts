import IoRedis from 'ioredis';
import AbstractRedis from './redis';
import { SingleConfig } from './types';

export default class SingleRedis extends AbstractRedis {
  protected createClient() {
    const { host, port, db, password } = this.config as SingleConfig;
    const singleOptions: IoRedis.RedisOptions = {
      port,
      host,
      db,
      retryStrategy: (times: number) => (times < 1000 ? Math.min(times * 100, 2000) : null),
      reconnectOnError: () => true,
      password,
    };

    const client = new IoRedis(singleOptions);
    return { client, info: { mode: 'SINGLE', host, port, db, auth: Boolean(password) } };
  }
}
