import { EventEmitter } from 'events';

export abstract class EventHandlers {
  constructor(public emitter: EventEmitter, public name: string) {}

  log(message: string, data: any) {
    this.emitter.emit('log', {
      service: this.name,
      data,
      message,
    });
  }

  success(message: string, data?: any) {
    this.emitter.emit('success', {
      service: this.name,
      data,
      message,
    });
  }

  error(err: Error, data?: any) {
    this.emitter.emit('error', {
      service: this.name,
      data,
      err,
    });
  }
}

export function getDefaultEmitter() {
  const defaultEmitter = new EventEmitter();
  defaultEmitter.on('log', console.log);
  defaultEmitter.on('success', console.log);
  defaultEmitter.on('error', console.log);
  return defaultEmitter;
}
