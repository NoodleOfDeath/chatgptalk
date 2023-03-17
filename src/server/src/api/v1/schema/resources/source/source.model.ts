import {
  AfterFind,
  Column,
  DataType,
  Table,
} from 'sequelize-typescript';

import {  SOURCE_ATTRS } from '../../types';
import { Outlet } from '../outlet/outlet.model';
import {
  Attr,
  TitledCategorizedPost,
  TitledCategorizedPostAttributes,
  TitledCategorizedPostCreationAttributes,
} from '../post';

export type SourceAttributes = TitledCategorizedPostAttributes & {
  outletId: number;
  url: string;
  rawText: string;
  filteredText: string;
  originalTitle: string;
};
export type SourceWithOutletName = SourceAttributes & { outletName: string };

export type SourceCreationAttributes = TitledCategorizedPostCreationAttributes & {
  outletId: number;
  url: string;
  rawText: string;
  filteredText: string;
  originalTitle: string;
};

export type SourceAttr = Attr<Source, typeof SOURCE_ATTRS[number]>;
export type SourceWithOutletAttr = SourceAttr & { outletName: string };

export type ReadAndSummarizeSourcePayload = {
  url: string;
};

@Table({
  modelName: 'source',
  paranoid: true,
  timestamps: true,
})
export class Source extends TitledCategorizedPost<SourceWithOutletName, SourceCreationAttributes> implements SourceWithOutletName {

  static get empty() {
    return this.json();
  }

  static json(defaults?: Partial<Source>): Partial<Source> {
    return defaults ?? {};
  }
  
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
    outletId: number;
  
  outletName: string;

  @Column({
    allowNull: false,
    type: DataType.STRING(2083),
    unique: true,
  })
    url: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
    rawText: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
    filteredText: string;

  @Column({
    allowNull: false,
    type: DataType.STRING(1024),
  })
    originalTitle: string;
  
  @AfterFind
  static async addOutletName(cursor?: Source | Source[]) {
    if (!cursor) {
      return;
    }
    const sources = Array.isArray(cursor) ? cursor : [cursor];
    const outletIds = sources.map((source) => {
      return source.toJSON().outletId;
    });
    const outlets = await Outlet.findAll({ where: { id: outletIds } });
    sources.forEach((source) => {
      const outlet = outlets.find((o) => o.id === source.toJSON().outletId);
      source.set('outletName', outlet?.toJSON().name ?? '', { raw: true });
    });
  }

}
