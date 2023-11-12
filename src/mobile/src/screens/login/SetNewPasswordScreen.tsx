import React from 'react';

import { ScreenComponent } from '../types';

import {
  Button,
  Text,
  TextInput,
  View,
} from '~/components';
import { StorageContext } from '~/core';
import { strings } from '~/locales';

export function SetNewPasswordScreen({
  route: _route,
  navigation, 
}: ScreenComponent<'setNewPassword'>) {

  const { 
    api: { updateCredential }, 
    setStoredValue,
  } = React.useContext(StorageContext);

  const [success, setSuccess] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [message, setMessage] = React.useState('');

  const handlePasswordReset = React.useCallback(async () => {
    try {
      if (password !== confirmPassword) {
        setMessage(strings.passwordsDoNotMatch);
        return;
      }
      const { data, error } = await updateCredential({ password });
      if (error) {
        setMessage(error.message);
        return;
      }
      if (data.success) {
        setSuccess(true);
        setMessage(strings.successYouMayNowLogin);
        setStoredValue('userData');
      }
    } catch (error) {
      console.error(error);
    }
  }, [confirmPassword, password, setStoredValue, updateCredential]);
  
  return (
    <View p={ 24 } gap={ 12 }>
      {!success && (
        <React.Fragment>
          <TextInput
            value={ password }
            onChangeText={ setPassword }
            placeholder={ strings.password }
            secureTextEntry />
          <TextInput
            value={ confirmPassword }
            onChangeText={ setConfirmPassword }
            placeholder={ strings.confirmPassword }
            secureTextEntry />
          <Button
            onPress={ handlePasswordReset }
            contained>
            {strings.resetPassword}
          </Button>
        </React.Fragment>
      )}
      {message && <Text textCenter>{ message }</Text>}
      {success && (<Button onPress={ () => navigation?.replace('login', {}) } contained>{strings.login}</Button>)}
    </View>
  );
}