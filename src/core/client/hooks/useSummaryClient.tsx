import React from 'react';
import { Share } from 'react-native';

import { BASE_DOMAIN } from '@env';

import { ClientError } from './types';
import { Bookmark, SessionContext } from '../contexts';

import {
  API,
  InteractionType,
  PublicSummaryAttributes,
} from '~/api';

export function useSummaryClient() {

  const {
    setPreference, userData, withHeaders, 
  } = React.useContext(SessionContext);
  
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

  const getSummary = React.useCallback(async (id: number) => {
    try {
      return await getSummaries(undefined, [id], 0, 1);
    } catch (e) {
      return { data: undefined, error: new ClientError('UNKNOWN', e) };
    }
  }, [getSummaries]);
  
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

  const handleInteraction = React.useCallback(async (
    summary: PublicSummaryAttributes, 
    interaction: InteractionType, 
    content?: string, 
    metadata?: Record<string, unknown>
  ) => {
    const payload: Record<string, unknown> = { ...metadata, content };
    if (interaction === InteractionType.Bookmark) {
      setPreference('bookmarkedSummaries', (prev) => {
        const bookmarks = { ...prev };
        payload.value = String(!bookmarks[summary.id]);
        if (bookmarks[summary.id]) {
          delete bookmarks[summary.id];
        } else {
          bookmarks[summary.id] = new Bookmark(summary);
        }
        return (prev = bookmarks);
      });
    } else if (interaction === InteractionType.Favorite) {
      setPreference('favoritedSummaries', (prev) => {
        const favorites = { ...prev };
        payload.value = String(!favorites[summary.id]);
        if (favorites[summary.id]) {
          delete favorites[summary.id];
        } else {
          favorites[summary.id] = new Bookmark(summary);
        }
        return (prev = favorites);
      });
    } else if (interaction === InteractionType.Share) {
      const message = `${summary.title} ${BASE_DOMAIN}/read/?s=${summary.id}`;
      const url = `${BASE_DOMAIN}/read/?s=${summary.id}`;
      payload.value = url;
      await Share.share({ message, url });
    } else if (interaction === InteractionType.View) {
      // pass
    } else {
      return { data: undefined, error: new ClientError('UNKNOWN') };
    }
    return await interactWithSummary(summary, interaction, [payload, content].join(' || '), metadata);
  }, [interactWithSummary, setPreference]);

  return {
    getSummaries,
    getSummary,
    handleInteraction,
    interactWithSummary,
  };

}