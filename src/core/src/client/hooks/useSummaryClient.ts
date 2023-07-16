import React from 'react';

import { Bookmark, SessionContext } from '../contexts';

import {
  API,
  InteractionType,
  PublicSummaryGroup,
} from '~/api';
import { getUserAgent } from '~/utils';

export function useSummaryClient() {

  const { 
    readSummary,
    setPreference,
    withHeaders,
  } = React.useContext(SessionContext);
  
  const getSummaries = React.useCallback(async (args: Parameters<typeof API.getSummaries>[0]) => {
    return await withHeaders(API.getSummaries)(args);
  }, [withHeaders]);

  const getSummary = React.useCallback(async (id: number, locale?: string) => {
    return await getSummaries({ ids: [id], locale });
  }, [getSummaries]);
  
  const getTopStories = React.useCallback(async (args: Parameters<typeof API.getTopStories>[0]) => {
    return await withHeaders(API.getTopStories)(args);
  }, [withHeaders]);
  
  const interactWithSummary = React.useCallback(
    async (summary: PublicSummaryGroup, type: InteractionType, content?: string, metadata?: Record<string, unknown>) => {
      return await withHeaders(API.interactWithSummary)(summary.id, type, { content, metadata });
    },
    [withHeaders] 
  );

  const handleInteraction = React.useCallback(async (
    summary: PublicSummaryGroup, 
    interaction: InteractionType, 
    content?: string, 
    metadata?: Record<string, unknown>,
    alternateAction?: (() => Promise<void>) | (() => void)
  ) => {
    if (alternateAction) {
      // pass
      try {
        await alternateAction();
      } catch (e) {
        console.error(e);
      }
    }
    const payload: Record<string, unknown> = { 
      ...metadata, 
      content,
      userAgent: getUserAgent(),
    };
    if (interaction === InteractionType.Read) {
      readSummary(summary);
    }
    return await interactWithSummary(summary, interaction, content, payload);
  }, [interactWithSummary, readSummary]);

  const getRecaps = React.useCallback(async (
    filter?: string,
    page = 0, 
    pageSize = 10
  ) => {
    return await withHeaders(API.getRecaps)({ page, pageSize });
  }, [withHeaders]);

  const subscribe = React.useCallback(async (args: Parameters<typeof API.subscribe>[0]) => {
    return await withHeaders(API.unsubscribe)(args);
  }, [withHeaders]);

  const unsubscribe = React.useCallback(async (args: Parameters<typeof API.unsubscribe>[0]) => {
    return await withHeaders(API.unsubscribe)(args);
  }, [withHeaders]);

  return {
    getRecaps,
    getSummaries,
    getSummary,
    getTopStories,
    handleInteraction,
    interactWithSummary,
    subscribeToRecap: subscribe,
    unsubscribeFromRecap: unsubscribe,
  };

}