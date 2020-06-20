export interface PipelineAction {
  cmd: string;
  args?: any[];
  before?: (_?: any[]) => any[];
  after?: (result: any) => any;
}

export interface MultiAction {
  actions: { [id: string]: PipelineAction };
  executed: boolean;
  results: { [id: string]: any };
  addAction: (id: string, action: PipelineAction) => void;
  addCommand: (id: string, cmd: string, ...args: any[]) => void;
  exec: () => Promise<any>;
}
