import IoRedis from 'ioredis';
import AbstractRedis from './redis';
import { SentinelConfig } from './types';

export default class SentinelRedis extends AbstractRedis {
  protected createClient() {
    const { db, sentinel, password } = this.config as SentinelConfig;
    const { hosts, name } = sentinel;
    const sentinelOptions: IoRedis.RedisOptions = {
      sentinels: hosts,
      name,
      db,
      retryStrategy: (times: number) => (times < 1000 ? Math.min(times * 100, 2000) : null),
      reconnectOnError: () => true,
      password,
    };

    const client = new IoRedis(sentinelOptions);
    return { client, info: { mode: 'SENTINEL', hosts, db, name, auth: Boolean(password) } };
  }
}
