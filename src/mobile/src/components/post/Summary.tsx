import React from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { formatDistance } from 'date-fns';
import ms from 'ms';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { List } from 'react-native-paper';
import { State } from 'react-native-track-player';
import ViewShot from 'react-native-view-shot';

import { 
  InteractionType,
  PublicSummaryAttributes,
  ReadingFormat,
} from '~/api';
import {
  ActivityIndicator,
  AnalyticsView,
  Button,
  CollapsedView,
  Divider,
  Highlighter,
  Icon,
  Image,
  Menu,
  MeterDial,
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
import {
  useInAppBrowser,
  useNavigation,
  useServiceClient,
  useShare,
  useTheme,
} from '~/hooks';
import {
  getFnsLocale,
  getLocale,
  strings,
} from '~/locales';
import { fixedSentiment } from '~/utils';

type Props = {
  summary: PublicSummaryAttributes;
  tickInterval?: string;
  selected?: boolean;
  initialFormat?: ReadingFormat;
  keywords?: string[];
  compact?: boolean;
  swipeable?: boolean;
  disableInteractions?: boolean;
  onFormatChange?: (format?: ReadingFormat) => void;
  onInteract?: (interaction: InteractionType, content?: string, metadata?: Record<string, unknown>, alternateAction?: () => void) => void;
};

type RenderAction = {
  text: string;
  startIcon?: string;
  onPress: () => void;
};

type RenderActionsProps = {
  actions: RenderAction[];
  side?: 'left' | 'right';
};

function RenderActions({ actions }: RenderActionsProps) {
  return (
    <View>
      <View col justifyCenter p={ 8 } mb={ 8 } gap={ 8 }>
        {actions.map((action) => (
          <Button 
            key={ action.text }
            elevated
            flexGrow={ 1 }
            flex={ 1 }
            p={ 8 }
            alignCenter
            justifyCenter
            caption
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
  tickInterval = '2m',
  selected,
  initialFormat,
  keywords = [],
  compact = false,
  swipeable = true,
  disableInteractions = false,
  onFormatChange,
  onInteract,
}: Props) {

  const { openURL } = useInAppBrowser();
  const { openOutlet, openCategory } = useNavigation();
  const { copyToClipboard } = useShare({ onInteract });
  const { localizeSummary } = useServiceClient();

  const theme = useTheme();

  const {
    preferences: {
      compactMode,
      showShortSummary,
      preferredReadingFormat, 
      bookmarkedSummaries,
      readSummaries,
      readSources,
    }, setPreference, 
  } = React.useContext(SessionContext);

  const {
    showShareDialog, setShowFeedbackDialog, setShowShareDialog, 
  } = React.useContext(DialogContext);
  const {
    trackState, queueSummary, currentTrack, stopAndClearTracks,
  } = React.useContext(MediaContext);
  
  const viewshot = React.useRef<ViewShot | null>(null);

  const [lastTick, setLastTick] = React.useState(new Date());
  const [isRead, setIsRead] = React.useState(!disableInteractions && Boolean(readSummaries?.[summary.id]) && !initialFormat &&!showShareDialog);
  const [sourceIsRead, setSourceIsRead] = React.useState(!disableInteractions && Boolean(readSources?.[summary.id]) && !initialFormat &&!showShareDialog);

  const [format, setFormat] = React.useState<ReadingFormat | undefined>(initialFormat);
  const [translations, setTranslations] = React.useState<Record<string, string> | undefined>(summary.translations && summary.translations.length > 0 ? Object.fromEntries((summary.translations).map((t) => [t.attribute, t.value])) : undefined);
  const [showTranslations, setShowTranslations] = React.useState(Boolean(translations));
  const [isLocalizing, setIsLocalizing] = React.useState(false);

  const localizedStrings = React.useMemo(() => {
    return showTranslations && translations ? translations : {
      bullets: summary.bullets.join('\n'),
      shortSummary: summary.shortSummary,
      summary: summary.summary,
      title: summary.title,
    };
  }, [showTranslations, summary.bullets, summary.shortSummary, summary.summary, summary.title, translations]);

  const bookmarked = React.useMemo(() => Boolean(bookmarkedSummaries?.[summary.id]), [bookmarkedSummaries, summary]);
  
  const playingAudio = React.useMemo(() => trackState === State.Playing && currentTrack?.id === ['summary', summary.id].join('-'), [currentTrack?.id, summary.id, trackState]);

  const timeAgo = React.useMemo(() => {
    return formatDistance(new Date(summary.originalDate ?? 0), lastTick, { addSuffix: true, locale: getFnsLocale() });
  }, [summary.originalDate, lastTick]);
  
  const content = React.useMemo(() => {
    if (!format) {
      return;
    }
    let content = localizedStrings.summary;
    if (format === 'bullets') {
      content = localizedStrings.bullets.replace(/•\s*/g, '');
    }
    return content;
  }, [format, localizedStrings.bullets, localizedStrings.summary]);

  // update time ago every `tickIntervalMs` milliseconds
  useFocusEffect(React.useCallback(() => {
    const interval = setInterval(() => {
      setLastTick(new Date());
    }, ms(tickInterval));
    return () => clearInterval(interval);
  }, [tickInterval]));

  const handleFormatChange = React.useCallback((newFormat?: ReadingFormat) => {
    if (!initialFormat) {
      onFormatChange?.(newFormat);
      setIsRead(true);
      return;
    }
    setFormat(newFormat);
  }, [initialFormat, onFormatChange]);

  const handleLocalizeSummary = React.useCallback(async () => {
    setIsLocalizing(true);
    const { data: localizedSummaries, error } = await localizeSummary(summary, getLocale());
    if (!localizedSummaries || error) {
      console.log(error);
      setIsLocalizing(false);
      return;
    }
    setTranslations(Object.fromEntries(localizedSummaries.rows.map((row) => [row.attribute, row.value])));
    setIsLocalizing(false);
    setShowTranslations(true);
  }, [localizeSummary, summary]);
  
  const handlePlayAudio = React.useCallback(async () => {
    if (trackState === State.Playing && currentTrack?.id === ['summary', summary.id].join('-')) {
      await stopAndClearTracks();
      return;
    }
    queueSummary(summary);
  }, [trackState, currentTrack?.id, summary, queueSummary, stopAndClearTracks]);
  
  const renderRightActions = React.useCallback(() => {
    const actions = [{
      onPress: () => {
        setPreference('readSummaries', (prev) => {
          onInteract?.(InteractionType.Read, 'mark-read-unread', { isRead: !prev?.[summary.id] });
          const newBookmarks = { ...prev };
          if (newBookmarks[summary.id]) {
            delete newBookmarks[summary.id];
          } else {
            newBookmarks[summary.id] = new Bookmark(true);
          }
          setIsRead((prev) => !prev);
          return (prev = newBookmarks);
        });
        setPreference('readSources', (prev) => {
          onInteract?.(InteractionType.Read, 'mark-source-unread', { isRead: !prev?.[summary.id] });
          const newBookmarks = { ...prev };
          if (newBookmarks[summary.id]) {
            delete newBookmarks[summary.id];
          } else {
            newBookmarks[summary.id] = new Bookmark(true);
          }
          setSourceIsRead((prev) => !prev);
          return (prev = newBookmarks);
        });
      },
      startIcon: isRead ? 'email-mark-as-unread' : 'email-open',
      text: isRead ? strings.summary.markAsUnRead : strings.summary.markAsRead,
    }, {
      onPress: () => {
        onInteract?.(InteractionType.Hide, undefined, undefined, () => {
          setPreference('removedSummaries', (prev) => ({
            ...prev,
            [summary.id]: new Bookmark(true),
          }));
        });
      },
      startIcon: 'eye-off',
      text: strings.summary.hide,
    }, {
      onPress: () => { 
        onInteract?.(InteractionType.Feedback, undefined, undefined, () => {
          setShowFeedbackDialog(true, { summary });
        });
      },
      startIcon: 'bug',
      text: strings.summary.reportAtBug,
    }];
    return (
      <RenderActions actions={ actions } />
    );
  }, [isRead, setPreference, onInteract, summary, setShowFeedbackDialog]);
  
  return (
    <GestureHandlerRootView>
      <Swipeable 
        enabled={ swipeable && !initialFormat && !disableInteractions }
        renderRightActions={ renderRightActions }>
        <ViewShot ref={ viewshot }>
          <View 
            elevated
            style={ theme.components.card }
            inactive={ isRead } 
            onPress={ !initialFormat ? () => handleFormatChange(preferredReadingFormat ?? ReadingFormat.Summary) : undefined }>
            <View col>
              <View row>
                {!initialFormat && !showShareDialog && selected && (
                  <View
                    width={ 12 }
                    ml={ -12 }
                    mr={ 12 }
                    mb={ -12 }
                    mt={ -12 }
                    bg={ theme.colors.primary } />
                )}
                <View col gap={ 6 }>
                  <View 
                    mt={ -12 }
                    mh={ -12 }
                    pv={ initialFormat ? 12 : 6 }
                    ph={ 12 }
                    flexGrow
                    elevated
                    zIndex={ 2 }
                    inactive={ isRead }>
                    <View row alignCenter gap={ 12 }>
                      <Text 
                        italic
                        onPress={ () => openOutlet(summary.outlet) }>
                        {summary.outlet.displayName}
                      </Text>
                      <View row gap={ 6 }>
                        <Text 
                          bold 
                          caption
                          color={ isRead ? theme.colors.textDisabled : theme.colors.text }>
                          {timeAgo}
                        </Text>
                      </View>
                      <Text caption>{ fixedSentiment(summary.sentiment) }</Text>
                      <MeterDial 
                        value={ summary.sentiment }
                        width={ 40 } />
                    </View>
                  </View>
                  <View>
                    <View row gap={ 12 }>
                      {!(compact || compactMode) && summary.imageUrl && (
                        <View
                          justifyCenter
                          flexGrow
                          maxWidth={ 120 }
                          width={ '30%' }>
                          <Menu
                            width={ 300 }
                            autoAnchor={ (
                              <View
                                mt={ -6 }
                                mb={ 18 }
                                ml={ -12 }
                                minHeight={ 100 }
                                height="100%"
                                flexGrow>
                                <Image
                                  bg='red'
                                  col
                                  fill
                                  source={ { uri: summary.imageUrl } } />
                              </View>
                            ) }>
                            <View
                              gap={ 6 }>
                              <Text caption>{strings.summary.thisIsNotARealImage}</Text>
                              <View
                                mh={ -12 }
                                mb={ -12 }>
                                <Image
                                  source={ { uri: summary.imageUrl } }  
                                  aspectRatio={ 1 } />
                              </View>
                            </View>
                          </Menu>
                        </View>
                      )}
                      <View col>
                        <View row alignCenter>
                          {showShareDialog || keywords.length === 0 ? (
                            <Text 
                              bold
                              justifyCenter
                              subtitle1
                              color={ isRead ? theme.colors.textDisabled : theme.colors.text }>
                              {(compact || compactMode && showShortSummary) ? localizedStrings.shortSummary : localizedStrings.title}
                            </Text>
                          ) : (
                            <Highlighter
                              bold
                              subtitle1
                              justifyCenter
                              highlightStyle={ { backgroundColor: 'yellow', color: theme.colors.textDark } }
                              searchWords={ keywords }
                              textToHighlight={ localizedStrings.title } />
                          )}
                        </View>
                        {!/^en/i.test(getLocale()) && !translations && (
                          !isLocalizing ? (
                            <Text
                              subscript 
                              bold
                              underline
                              onPress={ () => handleLocalizeSummary() }>
                              {strings.summary.translate}
                            </Text>
                          )
                            : (
                              <View row>
                                <ActivityIndicator animating />
                              </View>
                            )
                        )}
                        {!/^en/i.test(getLocale()) && translations && (
                          <Text
                            subscript 
                            bold
                            underline
                            onPress={ () => setShowTranslations((prev) => !prev) }>
                            {showTranslations ? strings.summary.showOriginalText : strings.summary.showTranslatedText}
                          </Text>
                        )}
                        {!(compact || compactMode) && showShortSummary === true && (
                          <View row>
                            <Divider />
                            {(showShareDialog || keywords.length === 0) ? <Text>{localizedStrings.shortSummary}</Text> : (
                              <Highlighter 
                                highlightStyle={ { backgroundColor: 'yellow', color: theme.colors.textDark } }
                                searchWords={ keywords }
                                textToHighlight={ localizedStrings.shortSummary ?? '' } />
                            )}
                          </View>
                        )}
                        {!(compact || compactMode) && (
                          <View 
                            row
                            alignCenter
                            gap={ 12 }
                            mh={ -12 }
                            pv={ 6 }
                            ph={ 12 }>
                            <Button 
                              elevated
                              alignCenter
                              p={ 4 }
                              startIcon={ summary.category.icon && <Icon name={ summary.category.icon } color="text" /> }
                              onPress={ () => openCategory(summary.category) } />
                            <View row>
                              <View gap={ 0 } width="100%">
                                <Text 
                                  row
                                  numberOfLines={ 1 }
                                  underline
                                  caption
                                  color={ !initialFormat && !showShareDialog && sourceIsRead ? theme.colors.textDisabled : theme.colors.text }
                                  onPress={ () => {
                                    onInteract?.(InteractionType.Read, 'original source', { url: summary.url }, () => openURL(summary.url));
                                    setSourceIsRead(true);
                                  } }
                                  onLongPress={ () => copyToClipboard(summary.url) }>
                                  {summary.url}
                                </Text>
                              </View>
                            </View>
                            <View>
                              <View row alignCenter justifyEnd gap={ 8 }>
                                <Button
                                  elevated
                                  p={ 4 }
                                  alignCenter
                                  subtitle2
                                  color='text'
                                  startIcon={ bookmarked ? 'bookmark' : 'bookmark-outline' }
                                  onPress={ () => onInteract?.(InteractionType.Bookmark) } />
                                <Button
                                  elevated
                                  p={ 4 }
                                  subtitle2
                                  color='text'
                                  startIcon='share'
                                  onPress={ () => setShowShareDialog(true, {
                                    content, format, summary, viewshot: viewshot.current, 
                                  }) } />
                                <Button
                                  elevated
                                  p={ 4 }
                                  alignCenter
                                  subtitle2
                                  color="text"
                                  startIcon={ playingAudio ? 'stop' : 'volume-source' }
                                  onPress={ () => handlePlayAudio() } />
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              {initialFormat && (
                <CollapsedView 
                  initiallyCollapsed={ false }
                  mh={ -12 }
                  title={ (
                    <ReadingFormatSelector
                      mv={ -12 }
                      elevated={ false }
                      format={ format } 
                      preferredFormat={ preferredReadingFormat }
                      onChange={ handleFormatChange } />
                  ) }>
                  {content && (
                    <View gap={ 12 }>
                      <View gap={ -20 }>
                        {content.split('\n').map((content, i) => (                         
                          <List.Item
                            key={ `${content}-${i}` }
                            style={ { padding:0 } }
                            titleStyle={ { margin: 0, padding: 0 } }
                            left={ (props) => format === 'bullets' ? <List.Icon { ...props } icon="circle" /> : undefined }
                            title={ showShareDialog || keywords.length === 0 ? (
                              <Text>{content}</Text>
                            ) : (
                              <Highlighter 
                                highlightStyle={ { backgroundColor: 'yellow', color: theme.colors.textDark } }
                                searchWords={ keywords }
                                textToHighlight={ content } />
                            ) } />
                        ))}
                      </View>
                    </View>
                  )}
                </CollapsedView>
              )}
              {initialFormat && summary.sentiment && (
                <AnalyticsView
                  sentiment={ summary.sentiment }
                  sentiments={ Object.values(summary.sentiments ?? []) } />
              )}
            </View>
          </View>
        </ViewShot>
      </Swipeable>
    </GestureHandlerRootView>
  );
}
