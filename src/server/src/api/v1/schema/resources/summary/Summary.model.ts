import {
  AfterFind,
  Column,
  DataType,
  Table,
} from 'sequelize-typescript';

import { 
  READING_FORMATS,
  SummaryAttributes,
  SummaryCreationAttributes,
} from './Summary.types';
import { SummaryInteraction } from './SummaryInteraction.model';
import { SummarySentiment } from './SummarySentiment.model';
import { SummarySentimentAttributes } from './SummarySentiment.types';
import { SummarySentimentToken } from './SummarySentimentToken.model';
import { SummarySentimentTokenAttributes } from './SummarySentimentToken.types';
import { Post } from '../Post.model';
import { InteractionType } from '../interaction/Interaction.types';
import { PublicOutletAttributes } from '../outlet/Outlet.types';
import { PublicCategoryAttributes } from '../topic/Category.types';

@Table({
  modelName: 'summary',
  paranoid: true,
  timestamps: true,
})
export class Summary extends Post<SummaryInteraction, SummaryAttributes, SummaryCreationAttributes> implements SummaryAttributes {
  
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare outletId: number;
  
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare categoryId: number;

  @Column({
    allowNull: false,
    type: DataType.STRING(2083),
    unique: true,
  })
  declare url: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  declare rawText: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  declare filteredText: string;

  @Column({
    allowNull: false,
    type: DataType.STRING(1024),
  })
  declare originalTitle: string;

  @Column({ 
    defaultValue: new Date(0),
    type: DataType.DATE,
  })
  declare originalDate: Date;

  @Column({ 
    allowNull: false,
    type: DataType.TEXT,
  })
  declare summary: string;

  @Column({
    allowNull: false, 
    type: DataType.STRING(1024), 
  })
  declare shortSummary: string;

  @Column({
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING(1024)),
  })
  declare bullets: string[];

  formats = Object.values(READING_FORMATS);

  declare outlet: PublicOutletAttributes;
  declare outletAttributes?: PublicOutletAttributes;
  
  declare category: PublicCategoryAttributes;
  declare categoryAttributes?: PublicCategoryAttributes;
  
  declare sentiments: { [key: string]: SummarySentimentAttributes };
  // @Deprecated
  declare summary_sentiments?: SummarySentimentAttributes[];
  
  @AfterFind
  static async legacySupport(cursor?: Summary | Summary[]) {
    if (!cursor) {
      return;
    }
    const summaries = Array.isArray(cursor) ? cursor : [cursor];
    summaries.forEach((summary) => {
      summary.set('outletAttributes', summary.outlet, { raw: true });
      summary.set('categoryAttributes', summary.category, { raw: true });
      if ((summary.summary_sentiments ?? []).length > 0) {
        const sentiments = Object.fromEntries((summary.summary_sentiments ?? []).map((s) => [s.method, { ...(s as SummarySentiment).toJSON(), tokens: Object.fromEntries((s.summary_sentiment_tokens ?? [])?.map((t) => [t.text, (t as SummarySentimentToken).toJSON()])) as unknown as SummarySentimentTokenAttributes[] }]));
        summary.set('sentiments', sentiments, { raw: true });
      }
    });
  }

  async getInteractions(userId?: number, type?: InteractionType | InteractionType[]) {
    if (userId && type) {
      return await SummaryInteraction.findAll({
        where: {
          targetId: this.id, type, userId, 
        },
      });
    } else if (userId) {
      return await SummaryInteraction.findAll({ where: { targetId: this.id, userId } });
    }
    return await SummaryInteraction.findAll({ where: { targetId: this.id } });
  }
  
  async addUserInteractions(userId: number) {
    const uservotes = await this.getInteractions(userId, ['downvote', 'upvote']);
    const interactions = this.interactions;
    interactions.uservote = uservotes.some((v) => v.type === 'downvote') ? 'down' : uservotes.some((v) => v.type === 'upvote') ? 'up' : undefined;
    this.set('interactions', interactions, { raw: true });
  }

}
