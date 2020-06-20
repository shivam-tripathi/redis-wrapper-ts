import IoRedis from 'ioredis';
import { Pipeline, Transaction } from '../multi';

export interface ClusterConfig {
  password?: string;
  cluster: {
    hosts: { host: string; port: number }[];
  };
}

export interface SentinelConfig {
  password?: string;
  sentinel: {
    name: string;
    hosts: { host: string; port: number }[];
  };
  db?: number;
}

export interface SingleConfig {
  password?: string;
  host: string;
  port: number;
  db?: number;
}

export type RedisConfig = ClusterConfig | SentinelConfig | SingleConfig;

export interface Redis {
  client: IoRedis.Cluster | IoRedis.Redis;
  init: (config: RedisConfig) => Promise<Redis>;
  transaction: () => Transaction;
  pipeline: () => Pipeline;
}
