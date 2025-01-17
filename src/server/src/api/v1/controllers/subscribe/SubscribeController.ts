import {
  Body,
  Post,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';

import {
  AuthError,
  Request as ExpressRequest,
  InternalError,
} from '../../middleware';
import {
  PublicSubscriptionAttributes,
  Subscription,
  SubscriptionCreationAttributes,
} from '../../schema';

@Route('/v1/subscribe')
@Tags('Subscriptions')
@Security('jwt')
@SuccessResponse(200, 'OK')
@SuccessResponse(201, 'Created')
@SuccessResponse(204, 'No Content')
@Response<AuthError>(401, 'Unauthorized')
@Response<InternalError>(500, 'Internal Error')
export class SubscribeController {
  
  @Post('/')
  public static async subscribe(
    @Request() req: ExpressRequest,
    @Body() body: SubscriptionCreationAttributes
  ): Promise<PublicSubscriptionAttributes> {
    const user = req.jwt?.user;
    const subscription = await Subscription.subscribe({ ...body, userId: user?.id });
    return subscription;
  }

  @Post('/status')
  public static async getSubscriptionStatus(
    @Request() req: ExpressRequest,
    @Body() body: Pick<SubscriptionCreationAttributes, 'channel' | 'uuid'>
  ): Promise<PublicSubscriptionAttributes[]> {
    const subscription = await Subscription.getSubscriptionStatus(body);
    return subscription;
  }

  @Post('/verify')
  public static async verifySubscription(
    @Request() req: ExpressRequest,
    @Body() body: Pick<SubscriptionCreationAttributes, 'verificationCode'>
  ): Promise<PublicSubscriptionAttributes> {
    const subscription = await Subscription.verify(body);
    return subscription;
  }
  
  @Post('/unsubscribe')
  public static async unsubscribe(
    @Request() req: ExpressRequest,
    @Body() body: Pick<SubscriptionCreationAttributes, 'event' | 'unsubscribeToken'>
  ): Promise<void> {
    await Subscription.unsubscribe(body);
  }
  
}