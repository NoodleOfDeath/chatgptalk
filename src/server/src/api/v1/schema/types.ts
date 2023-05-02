import {
  Attributes,
  OrderItem,
  FindAndCountOptions as SequelizeFindAndCountOptions,
} from 'sequelize';
import { Hooks } from 'sequelize/types/hooks';
import { Model } from 'sequelize-typescript';

export type DatedAttributes = {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FindAndCountOptions<T extends Model<any, any> | Hooks<Model<any, any>, any, any>> = Omit<
  SequelizeFindAndCountOptions<Attributes<T>>,
  'groups'
>;

export function orderByToItem(orderBy: string): OrderItem {
  return orderBy.split(':') as OrderItem;
}

export function orderByToItems(orderBy: string | string[]): OrderItem[] {
  if (typeof orderBy === 'string') {
    return [orderByToItem(orderBy)];
  }
  return orderBy.map(orderByToItem);
}

export type BulkResponse<T> = {
  count: number;
  rows: T[];
};

export type DestroyResponse = {
  success: boolean;
};

// Model Types

export * from './analytics/RateLimit.types';

// Queues
export * from './queue/Queue.types';
export * from './queue/Job.types';
export * from './queue/Worker.types';

// User
export * from './user/Alias.types';
export * from './user/User.types';
export * from './user/UserMetadata.types';

// Auth
export * from './auth/Credential.types';
export * from './auth/Role.types';

// Posts
export * from './interaction/Interaction.types';
export * from './resources/Post.types';
export * from './resources/topic/Category.types';
export * from './resources/outlet/Outlet.types';
export * from './resources/summary/Summary.types';
export * from './resources/note/Note.types';