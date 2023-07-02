import { Model } from 'sequelize-typescript';

import { DBService } from '../../../services';

export abstract class BaseModel<ModelAttributes extends object, CreationAttributes extends object>
  extends Model<ModelAttributes, CreationAttributes> {

  declare id: number;

  static get empty() {
    return this.json();
  }

  static json<CreationAttributes>(defaults?: Partial<CreationAttributes>): Partial<CreationAttributes> {
    return defaults ?? {};
  }
  
  static get store() {
    return DBService.sq;
  }

}