import React from 'react';

import { formatDistance } from 'date-fns';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import ViewShot from 'react-native-view-shot';

import { 
  InteractionType,
  PublicSummaryAttributes,
  ReadingFormat,
} from '~/api';
import {
  Button,
  Divider,
  Icon,
  Markdown,
  ReadingFormatSelector,
  Text,
  View,
} from '~/components';
import {
  Bookmark,
  DialogContext,
  MediaContext,
  SessionContext,
} from '~/contexts';
import { useInAppBrowser, useTheme } from '~/hooks';

type Props = {
  summary: PublicSummaryAttributes;
  tickIntervalMs?: number;
  initialFormat?: ReadingFormat;
  keywords?: string[];
  onFormatChange?: (format?: ReadingFormat) => void;
  onReferSearch?: (prefilter: string) => void;
  onInteract?: (interaction: InteractionType, content?: string, metadata?: Record<string, unknown>, alternateAction?: () => void) => void;
};

type RenderAction = {
  text: string;
  startIcon?: string;
  onPress: () => void;
};

type RenderActionsProps = {
  actions: RenderAction[];
  theme: ReturnType<typeof useTheme>;
};

function RenderActions({ actions, theme }: RenderActionsProps) {
  return (
    <View>
      <View col justifyCenter p={ 8 } mb={ 8 }>
        {actions.map((action) => (
          <Button 
            key={ action.text }
            col
            mv={ 4 }
            p={ 8 }
            alignCenter
            justifyCenter
            rounded
            shadowed
            bg={ theme.colors.primary }
            caption
            color="white"
            startIcon={ action.startIcon }
            onPress={ action.onPress }>
            {action.text}
          </Button>
        ))}
      </View>
    </View>
  );
}

export function Summary({
  summary,
  tickIntervalMs = 60_000,
  initialFormat,
  keywords = [],
  onFormatChange,
  onReferSearch,
  onInteract,
}: Props) {
  const { openURL } = useInAppBrowser();
  const theme = useTheme();
  const {
    preferences: {
      preferredReadingFormat, 
      bookmarkedSummaries, 
      favoritedSummaries,
      readSummaries,
    }, setPreference, 
  } = React.useContext(SessionContext);
  const {
    showShareFab, setShowFeedbackDialog, setShowShareFab, 
  } = React.useContext(DialogContext);
  const {
    firstResponder, readText, cancelTts, 
  } = React.useContext(MediaContext);
  
  const viewshot = React.useRef<ViewShot | null>(null);

  const [lastTick, setLastTick] = React.useState(new Date());

  const [format, setFormat] = React.useState<ReadingFormat | undefined>(initialFormat);

  const isRead = React.useMemo(() => Boolean(readSummaries?.[summary.id]) && !initialFormat &&!showShareFab, [initialFormat, readSummaries, showShareFab, summary.id]);
  const bookmarked = React.useMemo(() => Boolean(bookmarkedSummaries?.[summary.id]), [bookmarkedSummaries, summary]);
  const favorited = React.useMemo(() => Boolean(favoritedSummaries?.[summary.id]), [favoritedSummaries, summary]);
  
  const playingAudio = React.useMemo(() => firstResponder === ['summary', summary.id].join('-'), [firstResponder, summary]);

  const markdownTitle = React.useMemo(() => {
    let title = summary.title;
    for (const word of keywords) {
      title = title.replace(new RegExp(`(${word})`, 'gi'), ' _$1_ ');
    }
    return title;
  }, [keywords, summary.title]);

  const timeAgo = React.useMemo(() => {
    const originalTime = formatDistance(new Date(summary.originalDate ?? 0), lastTick, { addSuffix: true }).replace(/about /, '');
    const generatedTime = formatDistance(new Date(summary.createdAt ?? 0), lastTick, { addSuffix: true }).replace(/about /, '');
    return new Date(summary.originalDate ?? 0).valueOf() > 0 && originalTime !== generatedTime ? 
      (
        <React.Fragment>
          <Text>{originalTime}</Text>
          <Text>
            {`(generated ${generatedTime})`}
          </Text>
        </React.Fragment>
      ) : 
      (<Text>{new Date(summary.originalDate ?? 0).valueOf() > 0 ? generatedTime : `generated ${generatedTime}`}</Text>);
  }, [summary.createdAt, summary.originalDate, lastTick]);

  const content = React.useMemo(() => {
    if (!format || !summary) {
      return;
    }
    let content: string = summary.shortSummary;
    if (format === 'bullets') {
      content = summary.bullets.join('\n');
    }
    for (const word of keywords) {
      content = content.replace(new RegExp(`(${word})`, 'gi'), ' _$1_ ');
    }
    return content;
  }, [format, keywords, summary]);

  // update time ago every `tickIntervalMs` milliseconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastTick(new Date());
    }, tickIntervalMs);
    return () => clearInterval(interval);
  }, [tickIntervalMs]);

  const handleFormatChange = React.useCallback((newFormat?: ReadingFormat) => {
    onFormatChange?.(newFormat);
    setTimeout(() => {
      setPreference('readSummaries', (prev) => ({
        ...prev,
        [summary.id]: new Bookmark(summary),
      }));
    }, 1000);
    if (!initialFormat) {
      return;
    }
    setFormat(newFormat);
  }, [initialFormat, onFormatChange, setPreference, summary]);

  const handlePlayAudio = React.useCallback(async (text: string) => {
    if (firstResponder) {
      cancelTts();
      if (firstResponder === ['summary', summary.id].join('-')) {
        return;
      }
    }
    onInteract?.(InteractionType.Listen, text);
    try {
      await readText(text, ['summary', summary.id].join('-'));
    } catch (e) {
      console.error(e);
    }
  }, [cancelTts, onInteract, firstResponder, readText, summary]);

  const renderLeftActions = React.useCallback(() => {
    const actions = [{
      onPress: () => setPreference('readSummaries', (prev) => {
        onInteract?.(InteractionType.Read, 'mark-read-unread', { isRead: !isRead });
        const newBookmarks = { ...prev };
        if (isRead) {
          delete newBookmarks[summary.id];
        } else {
          newBookmarks[summary.id] = new Bookmark(summary);
        }
        return (prev = newBookmarks);
      }),
      startIcon: isRead ? 'email-mark-as-unread' : 'email-open',
      text: isRead ? 'Mark as Unread' : 'Mark as Read',
    }, {
      onPress: () => 
        onInteract?.(InteractionType.Bookmark, undefined, undefined, () => {
          if (!bookmarked) {
            setPreference('readSummaries', (prev) => {
              const state = { ...prev };
              delete state[summary.id];
              return (prev = state);
            });
          }
        }),
      startIcon: bookmarked ? 'bookmark' : 'bookmark-outline',
      text: 'Read Later',
    }];
    return (
      <RenderActions actions={ actions } theme={ theme } />
    );
  }, [bookmarked, isRead, onInteract, setPreference, summary, theme]);
  
  const renderRightActions = React.useCallback(() => {
    const actions = [{
      onPress: () => {
        onInteract?.(InteractionType.Hide, undefined, undefined, () => {
          setPreference('removedSummaries', (prev) => ({
            ...prev,
            [summary.id]: new Bookmark(summary),
          }));
        });
      },
      startIcon: 'eye-off',
      text: 'Hide',
    }, {
      onPress: () => { 
        onInteract?.(InteractionType.Feedback, undefined, undefined, () => {
          setShowFeedbackDialog(true, { summary });
        });
      },
      startIcon: 'bug',
      text: 'Report a Bug',
    }];
    return (
      <RenderActions actions={ actions } theme={ theme } />
    );
  }, [theme, onInteract, setPreference, summary, setShowFeedbackDialog]);
  
  return (
    <ViewShot ref={ viewshot }>
      <GestureHandlerRootView>
        <Swipeable 
          renderLeftActions={ renderLeftActions }
          renderRightActions={ renderRightActions }>
          <View outlined rounded style={ theme.components.card } inactive={ isRead }>
            <View row justifySpaced alignCenter mb={ 8 }>
              <Button 
                startIcon={ summary.categoryAttributes?.icon && <Icon name={ summary.categoryAttributes?.icon } color="text" mr={ 8 } /> }
                onPress={ () => onReferSearch?.(`cat:${summary.category}`) } />
              <Button 
                row
                alignCenter
                underline
                onPress={ () => onReferSearch?.(`src:${summary.outletAttributes?.name}`) }>
                {summary.outletAttributes?.displayName}
              </Button>
              <Button 
                underline
                onPress={ () => onInteract?.(InteractionType.Read, 'original source', { url: summary.url }, () => openURL(summary.url)) }>
                View original source
              </Button>
            </View>
            <View onPress={ () => handleFormatChange(preferredReadingFormat ?? ReadingFormat.Summary) }>
              <Text numberOfLines={ isRead ? 1 : 10 } ellipsizeMode='tail'>
                <Markdown
                  styles={ {
                    em: { 
                      backgroundColor: 'yellow',
                      color: 'black',
                    }, 
                  } }>
                  {markdownTitle}
                </Markdown>
              </Text>
            </View>
            <Divider />
            <View row justifySpaced alignCenter>
              <View col>
                {timeAgo}
              </View>
              <View>
                <View row alignCenter justifyEnd>
                  <Button
                    alignCenter
                    mh={ 4 }
                    subtitle2
                    color='text'
                    startIcon={ favorited ? 'heart' : 'heart-outline' }
                    onPress={ () => onInteract?.(InteractionType.Favorite) } />
                  <Button
                    mh={ 4 }
                    subtitle2
                    color='text'
                    startIcon='share'
                    onPress={ () => setShowShareFab(true, {
                      content, format, summary, viewshot: viewshot.current, 
                    }) } />
                  <Button
                    alignCenter
                    mh={ 4 }
                    subtitle2
                    color="text"
                    startIcon={ playingAudio ? 'stop' : 'volume-source' }
                    onPress={ () => handlePlayAudio(summary.title) } />
                </View>
              </View>
            </View>
            {initialFormat && (
              <View mt={ 4 }>
                <ReadingFormatSelector 
                  format={ format } 
                  preferredFormat={ preferredReadingFormat }
                  onChange={ handleFormatChange } />
              </View>
            )}
            {content && (
              <View mt={ 2 }>
                <Divider />
                <View row alignCenter justifyStart>
                  <Button
                    startIcon={ playingAudio ? 'stop' : 'volume-source' }
                    onPress={ () => handlePlayAudio(content) }
                    mr={ 8 } />
                </View>
                <View mt={ 8 }>
                  {content.split(/\n/).map((line, i) => (
                    <Markdown
                      key={ i }
                      styles={ {
                        em: { 
                          backgroundColor: 'yellow',
                          color: 'black',
                        }, 
                      } }>
                      {line}
                    </Markdown>
                  ))}
                </View>
              </View>
            )}
          </View>
        </Swipeable>
      </GestureHandlerRootView>
    </ViewShot>
  );
}
