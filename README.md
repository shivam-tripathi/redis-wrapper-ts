# Redis Wrapper

Module for connecting to either single, sentinel or cluster redis. Comes with added power of
building and running multi commands (pipeline and transaction).

### Installation

`yarn install @shivam-tripathi/redis-wrapper-ts`

### Connection Parameters

RedisStore requires the following values:

1. service:`string` - Identifier for this instance. Can be any string.
2. config:`RedisConfig` - Config for connection. See the next section for details.
3. emitter?:`events.EventEmitter` - Event emitter for relevant events related data. The events are
   `log`, `success` and `error`. This is useful if one needs custom logging for the events.
   The data emitted would be of type:
   ```ts
   interface Event {
     service: string;
     message: string;
     data?: any;
     error?: Error;
   }
   ```
   The emitter defaults to using `console.log` for all events.

### Config

1. Cluster

```ts
interface ClusterConfig {
  cluster: {
    hosts: { host: string; port: number }[];
  };
  password?: string;
}
```

2. Sentinel

```ts
interface SentinelConfig {
  sentinel: {
    name: string;
    hosts: { host: string; port: number }[];
  };
  db?: number;
  password?: string;
}
```

3. Single

```ts
interface SingleConfig {
  host: string;
  port: number;
  db?: number;
  password?: string;
}
```

Preference of read is cluster > sentinel > single.

### Connection

```js
const Redis = require('@shivam/redis');

async function boot() {
  const redis = Redis.RedisStore('RedisNameIdentifier', {
    auth: { use: true, password: 'redisPassword' },
    host: 'localhost',
    port: '6379',
    db: 3,
  });
  await redis.init();
  await redis.client.set('one', 101);
  console.log(await redis.client.get('one'));
}
boot();
```

### Transaction and Pipeline

Multi interface is defined as:

```ts
interface PipelineAction {
  cmd: string; // Redis command you wish to execute, eg 'get', 'hget', 'del', 'hmset' etc
  args?: any[]; // Related args, for example with 'get' args would be ['keyName']
  before?: (_?: any[]) => any[]; // Function you wish to run on args before calling the command
  after?: (result: any) => any; // Function you wish to run on the result
}
interface MultiAction {
  actions: { [id: string]: PipelineAction };
  executed: boolean;
  results: { [id: string]: any };
  addAction: (id: string, action: PipelineAction) => void;
  addCommand: (id: string, cmd: string, ...args: any[]) => void;
  exec: () => Promise<any>;
}
```

1. Transaction

```ts
async function demo() {
  const transaction = redis.transaction();
  transaction.addAction('getOne', {
    cmd: 'get',
    args: ['one'],
  });
  transaction.addAction('hashMapSetTwo', {
    cmd: 'hmset',
    args: ['two', { foo: 'bar' }],
  });
  transaction.addCommand('getTwoFoo', 'hget', 'two', 'foo');
  const { getOne, hashMapSetTwo, getTwoFoo } = await transaction.exec();
}
```

Same code will be repeated for pipline, just replace `redis.transaction` with `redis.pipeline`.
