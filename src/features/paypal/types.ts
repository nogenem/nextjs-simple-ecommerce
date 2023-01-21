import type { TPaypalStatus } from './constants/status';

export type TMinimalPaypalOrder = {
  id: string;
  status: TPaypalStatus;
};
