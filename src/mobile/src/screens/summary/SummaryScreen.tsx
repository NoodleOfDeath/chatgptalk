import React from 'react';

import {
  InteractionResponse,
  InteractionType,
  ReadingFormat,
} from '~/api';
import {
  Screen,
  Summary,
  View,
} from '~/components';
import { SessionContext } from '~/contexts';
import { useSummaryClient } from '~/hooks';
import { ScreenProps } from '~/screens';

export function SummaryScreen({
  route,
  navigation,
}: ScreenProps<'summary'>) {
  const { preferences: { bookmarkedSummaries, favoritedSummaries } } = React.useContext(SessionContext);
  const { handleInteraction } = useSummaryClient();

  const [format, setFormat] = React.useState(route?.params?.initialFormat);
  const [interactions, setInteractions] = React.useState<InteractionResponse | undefined>(route?.params?.summary.interactions);

  const summary = React.useMemo(() => route?.params?.summary, [route]);

  React.useEffect(() => {
    navigation?.setOptions({ headerShown: true, headerTitle: summary?.title });
  }, [navigation, summary]);
  
  const handleFormatChange = React.useCallback(async (newFormat?: ReadingFormat) => {
    if (!summary || !newFormat || newFormat === format) {
      return;
    }
    const { data: interactions, error } = await handleInteraction(summary, InteractionType.Read, undefined, { format: newFormat });
    if (error) {
      console.error(error);
    } 
    if (interactions) {
      setInteractions(interactions);
    }
    setFormat(newFormat);
  }, [format, handleInteraction, summary]);
  
  const handleReferSearch = React.useCallback((prefilter: string) => {
    navigation?.push('search', { prefilter });
  }, [navigation]);

  return (
    <Screen>
      <View mt={ 10 } mh={ 16 }>
        {summary && (
          <Summary
            summary={ summary }
            format={ format }
            collapsible={ false }
            bookmarked={ Boolean(bookmarkedSummaries?.[summary.id]) }
            favorited={ Boolean(favoritedSummaries?.[summary.id]) }
            onFormatChange={ (format) => handleFormatChange(format) }
            onReferSearch={ handleReferSearch }
            onInteract={ (...e) => handleInteraction(summary, ...e) }
            realtimeInteractions={ interactions } />
        )}
      </View>
    </Screen>
  );
}
