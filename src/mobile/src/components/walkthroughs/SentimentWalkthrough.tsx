import React from 'react';

import { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { Ellipse, Svg } from 'react-native-svg';

import {
  Button,
  Chip,
  Divider,
  Markdown,
  MeterDial,
  Pulse,
  ScrollView,
  Summary,
  Text,
  View,
  Walkthrough,
  WalkthroughStep,
} from '~/components';
import { Bookmark, SessionContext } from '~/contexts';
import { useInAppBrowser, useTheme } from '~/hooks';
import { strings } from '~/locales';

export function SentimentWalkthrough(props: SheetProps) {
  
  const { setPreference } = React.useContext(SessionContext);
  const { openURL } = useInAppBrowser();
  const theme = useTheme();

  const onDone = React.useCallback(async () => {
    setPreference('viewedFeatures', (prev) => {
      const state = { ...prev };
      state[props.sheetId] = new Bookmark(true);
      return (prev = state);
    });
    await SheetManager.hide(props.sheetId);
  }, [props.sheetId, setPreference]);
  
  const steps: WalkthroughStep[] = React.useMemo(() => [
    {
      artwork: 'https://readless.nyc3.cdn.digitaloceanspaces.com/img/guides/walkthrough-sentiment.png',
      body: (
        <View gap={ 12 }>
          <Markdown subtitle1 textCenter system contained>
            {strings.walkthroughs_sentiment_tooMuchSentiment}
          </Markdown>
          <Markdown subtitle1 textCenter system contained>
            {strings.walkthroughs_sentiment_insteadOfRemoving}
          </Markdown>
        </View>
      ),
      title: strings.walkthroughs_sentiment_whatMakesNews,
    },
    {
      body: (
        <View gap={ 12 }>
          <View elevated p={ 12 } beveled>
            <View flexRow flexWrap="wrap" justifyCenter gap={ 3 }>
              <Text bold>&quot;</Text>
              <Text h5>
                I absolutely
              </Text>
              <Text h5 bold underline color="green">loved</Text>
              <Text h5>the new movie, it was a</Text>
              <Text h5 bold underline color="green">captivating</Text>
              <Text h5>and emotional experience!</Text>
              <Text h5 bold underline color="green">
                UwU
                <Text h5 bold>&quot;</Text>
              </Text>
            </View>
          </View>
          <Markdown subtitle1 textCenter system contained>
            {strings.walkthroughs_sentiment_whatIsSentimentAnalysisDescription1}
          </Markdown>
          <Markdown subtitle1 textCenter system contained>
            {strings.walkthroughs_sentiment_whatIsSentimentAnalysisDescription2}
          </Markdown>
        </View>
      ),
      title: strings.walkthroughs_sentiment_whatIsSentimentAnalysis,
    },
    {
      body: (
        <View gap={ 12 }>
          <Markdown subtitle1 textCenter system contained>{strings.walkthroughs_sentiment_whatIsSentimentUsedForDescriptionP1}</Markdown>
          <View elevated p={ 12 } beveled>
            <View flexRow flexWrap="wrap" justifyCenter gap={ 3 }>
              <Text h5 bold>&quot;</Text>
              <Text h5>
                The customer service was
              </Text>
              <Text h5 bold underline color="red">terrible</Text>
              <Text h5>my child was</Text>
              <Text h5 bold underline color="red">not happy</Text>
              <Text h5 bold underline color="red">
                😡
                <Text h5 bold>&quot;</Text>
              </Text>
            </View>
          </View>
          <Markdown subtitle1 textCenter system contained>{strings.walkthroughs_sentiment_whatIsSentimentUsedForDescriptionP2}</Markdown>
        </View>
      ),
      title: strings.walkthroughs_sentiment_whatIsSentimentUsedFor,
    },
    {
      artwork: (
        <View itemsCenter>
          <View itemsCenter flexRow>
            <View itemsCenter left={ 18 }>
              <Text h4 color="red" system>-1</Text>
              <Text 
                textCenter
                system
                color="red">
                {strings.summary_veryNegative}
              </Text>
            </View>
            <MeterDial value={ 0.3 } />
            <View itemsCenter right={ 18 }>
              <Text h4 color="green" system>+1</Text>
              <Text 
                textCenter
                system
                color="green">
                {strings.summary_veryPositive}
              </Text>
            </View>
          </View>
          <View itemsCenter>
            <Text h4 system>+0</Text>
            <Text textCenter system>{strings.summary_neutral}</Text>
          </View>
        </View>
      ),
      body: (
        <View gap={ 12 }>
          <Markdown subtitle1 textCenter system contained>
            {strings.walkthroughs_sentiment_howIsSentimetMeasuredDescription1}
          </Markdown>
          <Markdown subtitle1 textCenter system contained>
            {strings.walkthroughs_sentiment_howIsSentimetMeasuredDescription2}
          </Markdown>
        </View>
      ),
      title: strings.walkthroughs_sentiment_howIsSentimetMeasured,
    },
    {
      body: (
        <View gap={ 12 }>
          <Markdown
            textCenter
            subtitle1 
            contained
            highlightStyle={ {
              color: theme.colors.link, fontWeight: '500', textDecorationLine: 'underline', 
            } }
            onPress={ () => openURL('https://en.wikipedia.org/wiki/Lexical_analysis') }>
            {strings.walkthroughs_sentiment_howDoWeMeasureSentimentDescription1}
          </Markdown>
          <Chip contained itemsCenter gap={ 3 }>
            <Text
              subtitle1 
              color="link"
              onPress={ () => openURL('http://corpustext.com/reference/sentiment_afinn.html') }
              underline
              bold>
              AFINN
            </Text>
            <Text subtitle1>{strings.misc_and}</Text>
            <Text
              subtitle1 
              color="link"
              onPress={ () => openURL('https://medium.com/@piocalderon/vader-sentiment-analysis-explained-f1c4f9101cd9#:~:text=VADER%20(Valence%20Aware%20Dictionary%20for,intensity%20(strength)%20of%20emotion.') }
              underline
              bold>
              VADER
            </Text>
          </Chip>
          <Markdown subtitle1 textCenter system contained>
            {strings.walkthroughs_sentiment_howDoWeMeasureSentimentDescription2}
          </Markdown>
          <Divider />
          <Markdown textCenter system>
            {strings.walkthroughs_sentiment_howDoWeMeasureSentimentDescription3}
          </Markdown>
        </View>
      ),
      title: strings.walkthroughs_sentiment_howDoWeMeasureSentiment,
    },
    {
      body: (
        <View gap={ 12 }>
          <Markdown subtitle1 textCenter system contained>
            {strings.walkthroughs_sentiment_score}
          </Markdown>
          <ScrollView scrollEnabled={ false }>
            <View
              absolute
              top={ -5 }
              right={ -10 }
              zIndex={ 20 }>
              <Pulse>
                <Svg viewBox="0 0 100 100" width={ 150 } height={ 60 }>
                  <Ellipse
                    cx={ 50 }
                    cy={ 50 }
                    rx={ 80 }
                    ry={ 30 }
                    fill="transparent"
                    stroke={ theme.colors.text }
                    strokeWidth={ 5 } />
                </Svg>
              </Pulse>
            </View>
            <Summary
              forceSentiment
              disableInteractions 
              disableNavigation />
          </ScrollView>
          <View justifyCenter gap={ 12 }>
            <Button 
              subtitle1
              contained
              onPress={ () => {
                onDone();
              } }>
              {strings.walkthroughs_sentiment_dontEnable}
            </Button>
            <Button
              subtitle1
              contained
              bg={ theme.colors.success }
              color={ 'white' }
              haptic
              onPress={ () => {
                setPreference('sentimentEnabled', true);
                onDone();
              } }>
              {strings.walkthroughs_sentiment_enable}
            </Button>
          </View>
        </View>
      ),
      title: strings.walkthroughs_sentiment_enableQuestion,
    },
  ], [theme.colors.link, theme.colors.text, theme.colors.success, openURL, onDone, setPreference]);
  
  return (
    <Walkthrough
      { ...props }
      payload={ {
        closable: true, onDone, steps, 
      } } />
  );
}