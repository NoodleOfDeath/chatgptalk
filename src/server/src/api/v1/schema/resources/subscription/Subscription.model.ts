import ms from 'ms';
import { Op } from 'sequelize';
import {
  Column,
  DataType,
  Index,
  Table,
} from 'sequelize-typescript';
import { v4 } from 'uuid';

import {
  SubscriptionAttributes,
  SubscriptionChannel,
  SubscriptionCreationAttributes,
} from './Subscription.types';
import { MailService, MailServiceOptions } from '../../../../../services';
import { InternalError } from '../../../middleware';
import { BaseModel } from '../../base';

@Table({
  modelName: 'subscription',
  paranoid: true,
  timestamps: true,
})
export class Subscription<
    A extends SubscriptionAttributes = SubscriptionAttributes,
    B extends SubscriptionCreationAttributes = SubscriptionCreationAttributes,
  > extends BaseModel<A, B> implements SubscriptionAttributes {

  verifyToken: string;

  @Index({  
    name: 'subscription_channel_uuid_event',
    unique: true,
  })
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  declare channel: SubscriptionChannel;
    
  @Index({  
    name: 'subscription_channel_uuid_event',
    unique: true,
  })
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  declare uuid: string;
    
  @Index({  
    name: 'subscription_channel_uuid_event',
    unique: true,
  })
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  declare event: string;
    
  @Column({
    allowNull: false,
    defaultValue: 'en',
    type: DataType.STRING,
  })
  declare locale?: string;
    
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  declare verifiedToken?: string;
    
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  declare unsubscribeToken?: string;
    
  @Column({ type: DataType.DATE })
  declare verifiedAt?: Date;

  @Column({
    defaultValue: new Date(Date.now() + ms(process.env.TOKEN_TTL_LEVEL_1 || '30m')),
    type: DataType.DATE,
  })
  declare expiresAt?: Date;

  public static async subscribe({
    channel,
    uuid,
    event,
    locale,
  }: SubscriptionCreationAttributes): Promise<Subscription> {
    const verifyToken = v4();
    const subscription = await Subscription.create({
      channel,
      event,
      locale,
      uuid,
      verifyToken,
    });
    switch (subscription.channel) {
    case 'email':
      await new MailService().sendMail({
        subject: 'Verify Subscription',
        text: `Please verify your subscription by clicking the following link: ${process.env.SSL ? 'https://' : 'http://'}${process.env.BASE_DOMAIN}/subscribe/verify?t=${subscription.verifyToken}`,
        to: subscription.uuid,
      });
      break;
    default:
      throw new InternalError('invalid subscription channel');
    }
    return subscription;
  }

  public static async verify({
    channel,
    uuid,
    event,
    unsubscribeToken,
  }: SubscriptionAttributes): Promise<Subscription> {
    const subscription = await Subscription.findOne({
      where: {
        channel,
        event,
        unsubscribeToken,
        uuid,
      },
    });
    if (!subscription) {
      throw new InternalError('invalid subscription');
    }
    subscription.set('verifyToken', null);
    subscription.set('unsubscribeToken', v4());
    subscription.set('verifiedAt', new Date());
    subscription.set('expiresAt', null);
    await subscription.save();
    return subscription;
  }
  
  public static async unsubscribe({
    channel,
    uuid,
    event,
    verifyToken,
  }: SubscriptionCreationAttributes): Promise<void> {
    const subscription = await Subscription.findOne({
      where: {
        channel,
        event,
        uuid,
        verifyToken,
      },
    });
    if (!subscription) {
      throw new InternalError('invalid subscription');
    }
    await subscription.destroy();
  }

  public static async notify<
    T extends SubscriptionChannel, 
    D extends T extends 'email' ? MailServiceOptions : never
  >(
    event: string, 
    channel: T,
    data: D
  ): Promise<void> {
    const subscriptions = await Subscription.findAll({
      where: {
        channel, 
        event, 
        verifiedAt: { [Op.ne] : null }, 
      },
    });
    console.log(`notifying ${subscriptions.length} subscribers`);
    for (const subscription of subscriptions) {
      const unsub = `${process.env.SSL ? 'https://' : 'http://'}${process.env.BASE_DOMAIN}/unsubscribe?t=${subscription.unsubscribeToken}`;
      switch (subscription.channel) {
      case 'email':
        await new MailService().sendMail({
          ...data,
          from: process.env.MAIL_REPLY_TO,
          html: `${data.html}<br /><br /><a href="${unsub}">Unsubscribe</a>`,
          to: subscription.uuid,
        });
        break;
      default:
        throw new InternalError('invalid subscription channel');
      }
    }
  }
  
}