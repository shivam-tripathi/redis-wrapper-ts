import IoRedis from 'ioredis';
import AbstractMultiAction from './multi-action';

export class Pipeline extends AbstractMultiAction {
  constructor(client: IoRedis.Cluster | IoRedis.Redis) {
    super(client.pipeline());
  }
}
