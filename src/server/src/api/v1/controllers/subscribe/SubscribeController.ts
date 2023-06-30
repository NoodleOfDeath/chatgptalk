import { Request as ExpressRequest } from 'express';
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

import { AuthError, InternalError } from '../../middleware';
import {
  PublicSubscriptionAttributes,
  Subscription,
  SubscriptionCreationAttributes,
} from '../../schema';

@Route('/v1/subscribe')
@Tags('Subscribe')
@Security('jwt')
@SuccessResponse(200, 'OK')
@SuccessResponse(201, 'Created')
@SuccessResponse(204, 'No Content')
@Response<AuthError>(401, 'Unauthorized')
@Response<InternalError>(500, 'Internal Error')
export class SubscribeController {
  
  @Post('/')
  public static async subscribe(
    @Request() req?: ExpressRequest,
    @Body() body?: SubscriptionCreationAttributes
  ): Promise<PublicSubscriptionAttributes> {
    const subscription = await Subscription.subscribe(body);
    return subscription;
  }
  
  @Post('/')
  public static async unsubscribe(
    @Request() req?: ExpressRequest,
    @Body() body?: SubscriptionCreationAttributes
  ): Promise<void> {
    await Subscription.unsubscribe(body);
  }
  
}