import ms from 'ms';
import {
  Column,
  DataType,
  Table,
} from 'sequelize-typescript';

import { CacheAttributes, CacheCreationAttributes } from './Cache.types';
import { BaseModel } from '../base';

@Table({
  modelName: 'cache',
  paranoid: true,
  timestamps: true,
})
export class Cache<A extends CacheAttributes = CacheAttributes, B extends CacheCreationAttributes = CacheCreationAttributes> extends BaseModel<A, B> implements CacheAttributes {
  
  public static async fromKey(key: string) {
    return await Cache.findOne({ where: { key } });
  }

  @Column({
    allowNull: false, 
    type: DataType.STRING(2083), 
  })
  declare key: string;

  @Column({ 
    allowNull: false, 
    type: DataType.STRING, 
  })
  declare halflife: string;

  @Column({ 
    allowNull: false, 
    type: DataType.TEXT, 
  })
  declare value: string;
  
  get willExpireSoon() {
    return this.updatedAt.valueOf() + ms(this.halflife) > Date.now();
  }

}