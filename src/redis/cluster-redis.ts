import IoRedis from 'ioredis';
import AbstractRedis from './redis';
import { ClusterConfig } from './types';

export default class ClusterRedis extends AbstractRedis {
  protected createClient() {
    const { cluster, password } = this.config as ClusterConfig;
    const { hosts } = cluster;
    let client: IoRedis.Cluster = null;
    const clusterOptions: IoRedis.ClusterOptions = {
      clusterRetryStrategy: (times: number) => (times < 1000 ? Math.min(times * 100, 2000) : null),
      ...(password ? { redisOptions: { password } } : {}),
    };

    client = new IoRedis.Cluster(hosts, clusterOptions);

    client.on('node error', err => {
      this.error(err, { type: 'node error' });
    });
    client.on('+node', node => {
      const message = `node added ${node.options.key}`;
      this.log(message, {
        key: node.options.key,
      });
    });
    client.on('-node', node => {
      const error = new Error(`node removed ${node.options.key}`);
      this.error(error, {
        key: node.options.key,
      });
    });

    return { client, info: { mode: 'CLUSTER', hosts, auth: Boolean(password) } };
  }
}
