import React from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';

import { RecapAttributes } from '~/api';
import { 
  ChildlessViewProps,
  ContextMenu,
  ContextMenuAction,
  Divider,
  Highlighter,
  Icon,
  ScrollView,
  SummaryList,
  Text,
  TranslateToggle,
  View,
} from '~/components';
import { LayoutContext, StorageContext } from '~/contexts';
import { useNavigation, useTheme } from '~/hooks';
import { getFnsLocale, strings } from '~/locales';

export type RecapProps = ChildlessViewProps & {
  recap: RecapAttributes;
  preview?: boolean;
  expanded?: boolean;
  forceUnread?: boolean;
};

export function Recap({
  recap,
  preview,
  expanded,
  forceUnread = preview || expanded,
  ...props
}: RecapProps) {
  
  const theme = useTheme();
  const { navigation, openSummary } = useNavigation();
  const { screenHeight } = React.useContext(LayoutContext);
  
  const {
    readRecap, readRecaps, api: { getSummaries, localize }, 
  } = React.useContext(StorageContext);
  
  const [isRead, setIsRead] = React.useState(!forceUnread && recap.id in ({ ...readRecaps }));
  const [translations, setTranslations] = React.useState<{ [key in keyof RecapAttributes]?: string }>({ text: recap.text, title: recap.title });

  const bodyText = React.useMemo(() => (translations.text ?? recap.text), [recap.text, translations.text]);

  const menuActions: ContextMenuAction[] = React.useMemo(() => [
    {
      onPress: async () => {
        setIsRead((prev) => !prev);
        readRecap(recap, true);
      },
      systemIcon: isRead ? 'envelope' : 'envelope.open',
      title: isRead ? strings.markAsUnRead : strings.markAsRead,
    },
  ], [isRead, recap, readRecap]);
  
  const searchWords = React.useMemo(() => {
    if (!expanded) {
      return [];
    }
    const words: string[] = [];
    const matches = recap.text?.matchAll(/\[(\d+(?:\s*,\s*\d+)*)\]/g);
    if (matches) {
      for (const match of Array.from(matches)) {
        const [, ids] = match;
        words.push(...ids.split(/\s*,\s*/));
      }
    }
    return words;
  }, [expanded, recap.text]);

  const ids = React.useMemo(() => searchWords.map((word) => Number(word)), [searchWords]);
  
  useFocusEffect(React.useCallback(() => {
    if (expanded) {
      navigation?.setOptions({ headerTitle: format(new Date(recap.createdAt || ''), 'EEE PP', { locale: getFnsLocale() }) });
    } else {
      setIsRead(!forceUnread && recap.id in ({ ...readRecaps }));
    }
  }, [expanded, forceUnread, navigation, readRecaps, recap.createdAt, recap.id]));

  const handlePress = React.useCallback(() => {
    if (expanded) {
      return;
    }
    setIsRead((prev) => !prev);
    readRecap(recap);
    navigation?.navigate('recap', { recap });
  }, [expanded, navigation, readRecap, recap]);

  const translateToggle = React.useMemo(() => (
    <TranslateToggle 
      type="recap"
      target={ recap }
      localize={ localize }
      onLocalize={ (translations) => {
        if (!translations) {
          setTranslations({ text: recap.text, title: recap.title });
        } else {
          setTranslations(translations);
        }
      } } />
  ), [localize, recap]);

  const content = React.useMemo(() => (preview || expanded) && (
    <Highlighter
      selectable
      searchWords={ searchWords }
      propsFor={ (text) => ({ onPress: () => openSummary({ summary: Number(text) }) }) }
      highlightStyle={ {
        color: theme.colors.link,
        fontWeight: 'bold',
      } }
      replacementFor={ (_, index) => `${index}` }>
      {bodyText}
    </Highlighter>
  ), [expanded, openSummary, bodyText, preview, searchWords, theme.colors.link]);
  
  const coverCard = React.useMemo(() => (
    <View 
      { ...props }
      gap={ 3 }
      px={ 12 }
      borderRadius={ 12 }
      opacity={ isRead ? 0.5 : 1.0 }
      style={ theme.components.card }
      onPress={ handlePress }>
      <View flexRow gap={ 6 } itemsCenter>
        <View row>
          <View>
            <Text bold>
              {translations.title}
            </Text>
            {!preview && translateToggle}
            <Text
              caption
              color={ theme.colors.textSecondary }>
              { format(new Date(recap.createdAt ?? ''), 'EEEE • PP', { locale: getFnsLocale() }) }
            </Text>
          </View>
        </View> 
        {!preview && <Icon name="menu-right" size={ 24 } />}
      </View>
      {preview && (
        <ScrollView maxHeight={ screenHeight * 0.6 }>
          {content}
        </ScrollView>
      )}
    </View>
  ), [props, isRead, theme.components.card, theme.colors.textSecondary, handlePress, translations.title, preview, translateToggle, recap.createdAt, screenHeight, content]);

  return expanded ? (
    <React.Fragment>
      <SummaryList
        flex={ 1 }
        fetch={ getSummaries }
        specificIds={ ids } />
      <ScrollView flex={ 1 }>
        <View
          gap={ 6 }
          p={ 12 }
          style={ theme.components.card }>
          <Text h6 bold selectable>{translations.title}</Text>
          {translateToggle}
          <Divider />
          {content}
        </View>
      </ScrollView>
      <Divider />
    </React.Fragment>
  ) : (
    preview ? <ScrollView flex={ 1 }>{coverCard}</ScrollView> : (
      <ContextMenu 
        actions={ menuActions }
        preview={ (
          <Recap
            preview
            recap={ recap } />
        ) }>
        {coverCard}
      </ContextMenu>
    )
  );
}