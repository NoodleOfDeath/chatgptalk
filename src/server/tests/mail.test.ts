import 'dotenv/config';
import {
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

import { MailService } from '../src/services';

jest.setTimeout(30_000);

describe('tests mail service', () => {
  
  test('mail', async () => {
    await new MailService().sendMail({
      from: process.env.MAIL_REPLY_TO,
      subject: 'test',
      text: 'test',
      to: 'thom@readless.ai',
    });
    expect(true).toBe(true);
  });

});