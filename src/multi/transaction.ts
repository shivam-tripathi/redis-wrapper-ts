import IoRedis from 'ioredis';
import AbstractMultiAction from './multi-action';

export class Transaction extends AbstractMultiAction {
  constructor(client: IoRedis.Cluster | IoRedis.Redis) {
    super(client.multi());
  }
}
