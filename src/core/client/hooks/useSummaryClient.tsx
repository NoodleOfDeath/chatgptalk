import React from 'react';

import { ClientError } from './types';
import { SessionContext } from '../contexts';

import {
  API,
  InteractionType,
  PublicSummaryAttributes,
} from '~/api';

export function useSummaryClient() {

  const { userData, withHeaders } = React.useContext(SessionContext);
  
  const getSummaries = React.useCallback(async (
    filter?: string,
    ids?: number[],
    page = 0,
    pageSize = 10
  ) => {
    try {
      return await withHeaders(API.getSummaries)({
        filter, ids, page, pageSize, 
      });
    } catch (e) {
      return { data: undefined, error: new ClientError('UNKNOWN', e) };
    }
  }, [withHeaders]);
  
  const recordSummaryView = React.useCallback(async (summary: PublicSummaryAttributes, content?: string, metadata?: Record<string, unknown>) => {
    try {
      return await withHeaders(API.recordSummaryView)(summary.id, { content, metadata });
    } catch (e) {
      return { data: undefined, error: new ClientError('UNKNOWN', e) };
    }
  }, [withHeaders]);
  
  const interactWithSummary = React.useCallback(
    async (summary: PublicSummaryAttributes, type: InteractionType, content?: string, metadata?: Record<string, unknown>) => {
      if (!userData || !userData.isLoggedIn) {
        return { error: new ClientError('NOT_LOGGED_IN') };
      }
      try {
        return await withHeaders(API.interactWithSummary)(summary.id, type, {
          content, metadata, userId: userData.userId,
        });
      } catch (e) {
        return { data: undefined, error: new ClientError('UNKNOWN', e) };
      }
    },
    [userData, withHeaders]
  );

  return {
    getSummaries,
    interactWithSummary,
    recordSummaryView,
  };

}