import { Publisher } from '../../api/v1/schema';

export type ReadAndSummarizePayload = {
  url: string;
  imageUrls?: string[];
  content?: string;
  publisher?: Publisher;
  force?: boolean;
  priority?: number;
};

export type RecapPayload = {
  start?: string;
  end?: string;
  duration?: string;
  key?: string;
  force?: boolean;
};