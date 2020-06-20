import { EventEmitter } from 'events';
import { getDefaultEmitter } from '../event-handlers';
import ClusterRedis from './cluster-redis';
import SentinelRedis from './sentinel-redis';
import SingleRedis from './single-redis';
import { ClusterConfig, Redis, RedisConfig, SentinelConfig } from './types';

export * from './types';
export { ClusterRedis, SentinelRedis, SingleRedis };

export function RedisStore(service: string, config: RedisConfig, emitter: EventEmitter): Redis {
  if ((config as ClusterConfig).cluster) {
    return new ClusterRedis(service, config, emitter || getDefaultEmitter());
  }
  if ((config as SentinelConfig).sentinel) {
    return new SentinelRedis(service, config, emitter || getDefaultEmitter());
  }
  return new SingleRedis(service, config, emitter || getDefaultEmitter());
}
