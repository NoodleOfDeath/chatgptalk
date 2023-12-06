import React from 'react';
import { SafeAreaView } from 'react-native';

import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { Avatar } from 'react-native-paper';

import { RoutedScreen } from './RoutedScreen';
import { StackNavigator } from './StackNavigator';
import { HOME_STACK } from './stacks';

import { PublicCategoryAttributes, PublicPublisherAttributes } from '~/api';
import {
  Button,
  ChannelIcon,
  DrawerItem,
  DrawerSection,
} from '~/components';
import { StorageContext } from '~/contexts';
import { useNavigation, useTheme } from '~/hooks';
import { strings } from '~/locales';

function HomeDrawer() {
  return (
    <RoutedScreen navigationID='LeftDrawerNav' safeArea={ false }>
      <StackNavigator
        id='LeftDrawerNav'
        initialRouteName='home'
        screens={ HOME_STACK } />
    </RoutedScreen>
  );
}

export function LeftDrawerContent(props: DrawerContentComponentProps) {
  
  const {
    navigate,
    openCategory,
    openPublisher,
  } = useNavigation();
  const theme = useTheme();

  const {
    syncState,
    unreadBookmarkCount,
    categories,
    publishers,
    followedPublishers,
    followedCategories,
    favoritedCategories,
    favoritedPublishers,
    favoriteCategory,
    favoritePublisher,
    publisherIsFavorited,
    categoryIsFavorited,
    viewFeature,
    hasViewedFeature,
    userData,
  } = React.useContext(StorageContext);

  const isSyncingBookmarks = React.useMemo(() => {
    return syncState.bookmarks?.isFetching ?? false;
  }, [syncState.bookmarks]);

  const topPublishers = React.useMemo(() => Object.keys({ ...favoritedPublishers }).sort().map((p) => publishers?.[p]).filter(Boolean) as PublicPublisherAttributes[], [publishers, favoritedPublishers]);

  const topCategories = React.useMemo(() => Object.keys({ ...favoritedCategories }).sort().map((c) => categories?.[c]).filter(Boolean) as PublicCategoryAttributes[], [categories, favoritedCategories]);

  const favorites = React.useMemo(() => [...topPublishers, ...topCategories], [topPublishers, topCategories]);

  const sortedPublishers = React.useMemo(() => Object.keys({ ...followedPublishers }).sort().map((p) => publishers?.[p]).filter(Boolean) as PublicPublisherAttributes[], [publishers, followedPublishers]);

  const sortedCategories = React.useMemo(() => Object.keys({ ...followedCategories }).sort().map((c) => categories?.[c]).filter(Boolean) as PublicCategoryAttributes[], [categories, followedCategories]);

  const name = React.useMemo(() => userData?.profile?.email || userData?.profile?.username, [userData]);
  const initials = React.useMemo(() => name?.slice(0, 2).toUpperCase() ?? '??', [name]);

  return (
    <React.Fragment>
      <DrawerContentScrollView { ...props }>
        <DrawerSection>
          <DrawerItem 
            icon={ (props) => (
              <Button
                { ...props }
                leftIcon="bookmark"
                indicator={ unreadBookmarkCount > 0 && !hasViewedFeature('bookmarks') } />
            ) }
            right={ () => (<Button leftIcon="chevron-right" />) }
            disabled={ isSyncingBookmarks }
            label={ [strings.bookmarks, isSyncingBookmarks ? `${strings.syncing}...` : unreadBookmarkCount > 0 ? `(${unreadBookmarkCount})` : ''].filter(Boolean).join(' ') }
            onPress={ isSyncingBookmarks ? undefined : () => {
              viewFeature('bookmarks');
              navigate('bookmarks');
            } } />
        </DrawerSection>
        {favorites.length > 0 && (
          <DrawerSection
            title={ strings.favorites }
            minHeight={ 40 }>
            {topPublishers.map((publisher) => (
              <DrawerItem
                key={ publisher.name }
                label={ publisher.displayName }
                icon={ (props) => <ChannelIcon { ...props } publisher={ publisher } /> }
                onPress={ () => openPublisher(publisher) }
                right={ () => (
                  <Button 
                    leftIcon={ publisherIsFavorited(publisher) ? 'star' : 'star-outline' }
                    onPress={ () => favoritePublisher(publisher) } />
                ) } />
            ))}
            {topCategories.map((category) => (
              <DrawerItem
                key={ category.name }
                label={ category.displayName }
                icon={ (props) => <ChannelIcon { ...props } category={ category } /> }
                onPress={ () => openCategory(category) }
                right={ () => (
                  <Button 
                    leftIcon={ categoryIsFavorited(category) ? 'star' : 'star-outline' }
                    onPress={ () => favoriteCategory(category) } />
                ) } />
            ))}
          </DrawerSection>
        )}
        <DrawerSection
          title={ strings.publishersYouFollow }
          onPress={ () => navigate('publisherPicker') }
          rightIcon={ <Button leftIcon="chevron-right" /> }>
          {sortedPublishers.map((publisher) => (
            <DrawerItem
              key={ publisher.name }
              label={ publisher.displayName }
              icon={ (props) => <ChannelIcon { ...props } publisher={ publisher } /> }
              onPress={ () => openPublisher(publisher) }
              right={ () => (
                <Button 
                  leftIcon={ publisherIsFavorited(publisher) ? 'star' : 'star-outline' }
                  onPress={ () => favoritePublisher(publisher) } />
              ) } />
          )) }
        </DrawerSection>
        <DrawerSection
          title={ strings.categoriesYouFollow }
          onPress={ () => navigate('categoryPicker') }
          rightIcon={ <Button leftIcon="chevron-right" /> }>
          {sortedCategories.map((category) => (
            <DrawerItem
              key={ category.name }
              label={ category.displayName }
              icon={ (props) => <ChannelIcon { ...props } category={ category } /> }
              onPress={ () => openCategory(category) }
              right={ () => (
                <Button 
                  leftIcon={ categoryIsFavorited(category) ? 'star' : 'star-outline' }
                  onPress={ () => favoriteCategory(category) } />
              ) } />
          ))}
        </DrawerSection>
      </DrawerContentScrollView>
      <SafeAreaView>
        <DrawerSection 
          flexGrow={ 1 }
          showDivider={ false }
          bg={ theme.colors.headerBackground }
          py={ 12 }>
          <DrawerItem
            label={ name }
            icon={ (props) => (
              <Button
                indicator={
                  !hasViewedFeature('publishers') || 
                  !hasViewedFeature('categories') || 
                  !hasViewedFeature('display-preferences') ||
                  !hasViewedFeature('notifications') || 
                  !hasViewedFeature('app-review')
                } 
                leftIcon={ <Avatar.Text label={ initials } size={ 36 } /> }
                { ...props } />
            ) }
            right={ () => (<Button leftIcon="cog" />) }
            onPress={ () => navigate('settings') } />
        </DrawerSection>
      </SafeAreaView>
    </React.Fragment>
  );
}

const LeftDrawer = createDrawerNavigator();

export function LeftDrawerNavigator() {
  return (
    <LeftDrawer.Navigator 
      id="LeftDrawer"
      initialRouteName={ 'home' }
      screenOptions={ ({ route: _route }) => ({
        headerShown: false,
        swipeEnabled: false,
      }) }
      drawerContent={ (props) => <LeftDrawerContent { ...props } /> }>
      <LeftDrawer.Screen 
        name={ strings.home } 
        component={ HomeDrawer } />
    </LeftDrawer.Navigator>
  );
}