import IoRedis from 'ioredis';
import { MultiAction, PipelineAction } from './types';

export default abstract class AbstractMultiAction implements MultiAction {
  executed = false;
  results: { [id: string]: any };
  actions: { [id: string]: PipelineAction } = {};
  constructor(private pipeline: IoRedis.Pipeline) {}

  addAction(id: string, action: PipelineAction) {
    if (this.actions[id]) {
      throw new Error('Action with id already exists');
    }
    this.actions[id] = action;
  }

  addCommand(id: string, cmd: string, ...args: any[]) {
    if (this.actions[id]) {
      throw new Error('Action with id already exists');
    }
    this.actions[id] = { cmd, args };
  }

  private parse(result: [Error, any][]) {
    const err: Error[] = [];
    result.forEach(res => {
      if (res[0]) {
        err.push(res[0]);
      }
    });
    if (err.length > 0) {
      throw new Error(err.map(e => e.toString()).join(' '));
    }
    return result.map(res => res[1]);
  }

  async exec() {
    if (this.executed) {
      return this.results;
    }
    const ids = Object.keys(this.actions);
    const actions = Object.values(this.actions);
    actions.forEach(action => {
      let { before = args => args, cmd, args } = action;
      if (!this.pipeline[cmd]) {
        throw new Error(`${cmd} is not a redis command`);
      }
      this.pipeline[cmd](before(args));
    });

    const results = this.parse(await this.pipeline.exec());
    this.results = ids.reduce((acc, id, index) => {
      const after = actions[index].after || (x => x);
      const result = results[index];
      return { ...acc, ...{ [id]: after(result) } };
    }, {});

    return this.results;
  }
}
