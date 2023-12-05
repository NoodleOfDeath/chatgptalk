import React from 'react';

import { ScreenComponent } from '../types';

import {
  Button,
  Divider,
  FetchableList,
  Screen,
  TableViewCell,
  View,
} from '~/components';
import { StorageContext } from '~/contexts';
import { strings } from '~/locales';
import { timeAgo } from '~/utils';

export function NotificationsScreen({ navigation }: ScreenComponent<'notifications'>) {

  const {
    api: { getSystemNotifications },
    notifications,
    setNotifications,
    unreadNotificationCount,
    hasReadNotification, 
    readNotification, 
    setStoredValue,
  } = React.useContext(StorageContext);

  return (
    <Screen>
      <View
        gap={ 12 }
        m={ 12 }
        flexGrow={ 1 }>
        <Button
          contained
          onPress={ () => unreadNotificationCount > 0 ?
            readNotification(...(notifications ?? [])) : setStoredValue('readNotifications', {}) }>
          {unreadNotificationCount > 0 ? strings.markAllAsRead : strings.markAllAsUnread}
        </Button>
        <View flexGrow={ 1 }>
          <FetchableList
            fallbackComponent={ <Button>{strings.youHaveNoNotifications}</Button> }
            data={ notifications }
            fetch={ getSystemNotifications }
            onFetch={ setNotifications }
            renderItem={ ({ item: notification }) => (
              <TableViewCell
                subtitle
                key={ notification.id }
                title={ notification.title }
                accessory={ 'DisclosureIndicator' }
                bold={ !hasReadNotification(notification) }
                cellIcon={ hasReadNotification(notification) ? undefined : 'circle' }
                detail={ `${timeAgo(new Date(notification.createdAt ?? ''))} - ${notification.text}` }
                onPress={ () => {
                  readNotification(notification);
                  navigation?.push('notification', { notification }); 
                } } />
            ) }
            ItemSeparatorComponent={ ({ index }) => <Divider key={ `divider-${index}` } /> }
            estimatedItemSize={ 50 } />
        </View>
      </View>
    </Screen>
  );

} 