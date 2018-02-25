import * as worker from './worker';

export interface WorkerProcess {
  dependencies: string[];
  generated: string;
}

export interface WorkerFarmOptions {

}

export class WorkerFarm {
  constructor(options: WorkerFarmOptions) {

  }

  process(filename): Promise<WorkerProcess> {
    return worker.run(filename);
  }

  end() {
    // do some close operations
  }
}
