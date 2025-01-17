import React from 'react';

import {
  MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs';
import {
  EventMapBase,
  NavigationState,
  RouteConfig,
} from '@react-navigation/native';

import { StorageContext } from '../../core';

import {
  SYSTEM_FONT,
  Screen,
  View,
} from '~/components';
import { useTheme } from '~/hooks';
import { strings } from '~/locales';
import {
  LiveFeedTab,
  OldNewsTab,
  RoutingParams,
  ScreenComponent,
  TopStoriesTab,
  YourNewsTab,
} from '~/screens';

const Tab = createMaterialTopTabNavigator();

export function HomeScreen({ 
  route: _route,
  navigation: _navigation,
}: ScreenComponent<'home'>) {
  
  const theme = useTheme();
  const { followCount } = React.useContext(StorageContext);

  const tabs = React.useMemo(() => {
    const tabs: RouteConfig<
      RoutingParams,
      keyof RoutingParams,
      NavigationState,
      MaterialTopTabNavigationOptions,
      EventMapBase
    >[] = [
      {
        component: OldNewsTab,
        name: 'oldNews',
        options: { title: strings.oldNews },
      },
    ];
    if (followCount > 0) {
      tabs.push(
        {
          component: YourNewsTab,
          name: 'yourNews',
          options: { title: strings.yourNews },
        }
      );
    }
    tabs.push(
      {
        component: TopStoriesTab,
        name: 'topStories',
        options: { title: strings.topStories },
      }
    );
    return tabs;
  }, [followCount]);

  return (
    <Screen>
      <View flex={ 1 }>
        <Tab.Navigator 
          screenOptions={ {
            tabBarAllowFontScaling: true,
            tabBarLabelStyle: { fontFamily: SYSTEM_FONT },
            tabBarScrollEnabled: true,
            tabBarStyle: { backgroundColor: theme.navContainerTheme.colors.background },
          } }
          initialRouteName={ followCount > 0 ? 'yourNews' : 'topStories' }>
          { tabs.map((tab) => (
            <Tab.Screen
              key={ String(tab.name) }
              { ...tab }
              name={ tab.name }
              options={ { ...tab.options } } />
          )) }
        </Tab.Navigator>
      </View>
    </Screen>
  );

}
