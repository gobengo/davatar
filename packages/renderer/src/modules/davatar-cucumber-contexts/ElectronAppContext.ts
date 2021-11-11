import type { ElectronApplication } from 'playwright-core';

export class ElectronAppContext {
  app: ElectronApplication | undefined;
}
