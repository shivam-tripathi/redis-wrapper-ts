import { EventEmitter } from 'events';
import IoRedis from 'ioredis';
import { EventHandlers } from '../event-handlers';
import { Pipeline, Transaction } from '../multi';
import { Redis, RedisConfig } from './types';

export default abstract class AbstractRedis extends EventHandlers implements Redis {
  client: IoRedis.Cluster | IoRedis.Redis;
  config: RedisConfig;

  constructor(name: string, config: RedisConfig, emitter: EventEmitter) {
    super(emitter, name);
    this.config = config;
  }

  protected abstract createClient(): {
    client: IoRedis.Cluster | IoRedis.Redis;
    info: { mode: string; auth: boolean } & (
      | { hosts: { host: string; port: number }[] } // cluster
      | { hosts: { host: string; port: number }[]; db: number; name: string } // sentinel
      | { host: string; port: number; db: number } // single
    );
  };

  init(): Promise<Redis> {
    return new Promise(resolve => {
      const { client, info } = this.createClient();
      this.log(`Connecting in ${info.mode} mode`, info);

      client.on('connect', () => {
        this.success(`Successfully connected in ${info.mode} mode`);
      });
      client.on('error', err => {
        this.error(err, {});
      });
      client.on('ready', () => {
        this.client = client;
        resolve(this);
      });
      client.on('close', () => {
        const error = new Error('Redis connection closed');
        this.error(error);
      });
      client.on('reconnecting', time => {
        this.log(`Reconnecting in ${info.mode} mode after ${time} ms`, info);
      });
      client.on('end', () => {
        this.error(new Error('Connection ended'));
      });
    });
  }

  transaction() {
    return new Transaction(this.client);
  }

  pipeline() {
    return new Pipeline(this.client);
  }
}
