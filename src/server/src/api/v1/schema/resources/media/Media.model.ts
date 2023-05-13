import {
  Column,
  DataType,
  Index,
} from 'sequelize-typescript';

import { 
  MediaAttributes,
  MediaCreationAttributes,
  MediaType,
} from './Media.types';
import { BaseModel } from '../../base';

export abstract class Media<
    A extends MediaAttributes = MediaAttributes,
    B extends MediaCreationAttributes = MediaCreationAttributes,
  > extends BaseModel<A, B> implements MediaAttributes {
    
  @Index({
    name: 'media_parent_id_key_unique',
    unique: true,
  })
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare parentId: number;

  @Index({
    name: 'media_parent_id_key_unique',
    unique: true,
  })
  @Column({
    allowNull: false,
    type: DataType.STRING(2083),
  })
  declare key: string;
  
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  declare type: MediaType;
  
  @Column({ type: DataType.STRING(2083) })
  declare url?: string;
  
  @Column({ type: DataType.TEXT })
  declare content?: string;
  
}