
import React from 'react';
import { Platform } from 'react-native';

import {
  ActivityIndicator,
  Button,
  Image,
  Screen,
  Text,
  View,
} from '~/components';
import {
  useInAppBrowser,
  useNavigation,
  useThirdPartyLogin,
} from '~/hooks';
import { strings } from '~/locales';
import { ScreenComponent } from '~/screens';

export function BySigningUpBlock() {
  const { openURL } = useInAppBrowser();
  return (
    <View>
      <Text 
        caption
        textCenter>
        {strings.bySigningUpYouAgreeToOurTermsAndConditions}
      </Text>
      <View 
        justifyCenter
        flexRow
        flexWrap="wrap"
        gap={ 12 }>
        <Button
          caption
          underline
          onPress={ () => openURL('https://readless.ai/terms') }>
          {strings.termsAndConditions}
        </Button>
        <Button
          caption
          underline
          onPress={ () => openURL('https://readless.ai/privacy') }>
          {strings.privacyPolicy}
        </Button>
      </View>
    </View>
  );
}

export function LoginScreen({ route: _route }: ScreenComponent<'login'>) {

  const [message, setMessage] = React.useState<string>();

  const { navigate } = useNavigation();
  const { 
    signInWithApple,
    signInWithGoogle,
    signInWithoutAccount,
    isProcessing,
  } = useThirdPartyLogin(setMessage);

  return (
    <Screen>
      <View
        flex={ 1 }
        p={ 12 }
        gap={ 12 }>
        {isProcessing ? (
          <View
            flex={ 20 }
            itemsCenter
            justifyCenter
            bg="white">
            <ActivityIndicator animating />
            <Text>{strings.loggingIn}</Text>
          </View>
        ) : (
          <React.Fragment>
            <View
              flex={ 20 }
              itemsCenter
              justifyCenter
              bg="white">
              <Image
                native
                contain
                source={ { uri: Platform.select({ android: 'logo', ios: 'Logo' }) } }
                width={ 300 }
                height={ 300 } />
              <Text color="invertText">{strings.informationWithoutTheNoise}</Text>
            </View>
            <Text textCenter>{message}</Text>
            <View pb={ 24 } gap={ 12 }>
              <Button
                contained
                leftIcon="apple"
                gap={ 12 }
                onPress={ signInWithApple }>
                {strings.continueWithApple}
              </Button>
              <Button
                contained
                leftIcon="google"
                gap={ 12 }
                onPress={ signInWithGoogle }>
                {strings.continueWithGoogle}
              </Button>
              <Button
                contained
                leftIcon="account"
                gap={ 12 }
                onPress={ () => navigate('passwordLogin', {}) }>
                {strings.continueWithEmail}
              </Button>
              <Button
                textCenter
                onPress={ signInWithoutAccount }>
                {strings.continueWithoutAnAccount}
              </Button>
            </View>
            <BySigningUpBlock />
            <View flex={ 1 } />
          </React.Fragment>
        )}
      </View>
    </Screen>
  );
}