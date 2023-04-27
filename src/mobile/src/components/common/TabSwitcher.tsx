import React from 'react';
import { Animated, LayoutRectangle } from 'react-native';

import {
  ScrollView,
  Surface,
  Text,
  View,
  ViewProps,
} from '~/components';
import { useStyles, useTheme } from '~/hooks';

type Props = {
  titles?: React.ReactNode[];
  tabHeight?: number;
  children?: React.ReactNode | React.ReactNode[];
  activeTab?: number;
  onTabChange?: (tab: number) => void;
} & ViewProps;

export function TabSwitcher({
  activeTab = 0,
  tabHeight = 36,
  children,
  onTabChange,
  titles, 
  ...props
}: Props) {
  
  const theme = useTheme();
  const style = useStyles(props);
  const views = React.useMemo(() => Array.isArray(children) ? children : children ? [children] : undefined, [children]);

  const [switcherLayout, setSwitcherLayout] = React.useState<LayoutRectangle>();
  const translateX = React.useRef(new Animated.Value(0)).current;

  const fontSize = React.useMemo(() => {
    return (tabHeight ? tabHeight / 2 : style.fontSize ?? 16) ?? style.fontSize ?? 16;
  }, [style.fontSize, tabHeight]);

  const handleSlide = React.useCallback((tab: number) => {
    Animated.spring(translateX, {
      toValue: tab * Math.ceil(100 / (titles?.length ?? 1)),
      useNativeDriver: true,
    }).start();
  }, [translateX, titles?.length]);
  
  React.useEffect(() => {
    handleSlide(activeTab);
  }, [activeTab, handleSlide]);

  return (
    <Animated.View style={ { flex: 1 } }>
      <View gap={ 16 }>
        <Surface 
          row
          alignCenter
          justifyCenter
          height={ tabHeight ?? 48 }
          onLayout={ (event) => setSwitcherLayout(event.nativeEvent.layout) }
          style={ style }>
          <Animated.View
            style={ {
              backgroundColor: theme.colors.primary,
              borderRadius: 4,
              bottom: -4,
              height: 5,
              left: 0,
              position: 'absolute',
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, (switcherLayout?.width || 0) - (titles?.length ?? 1) - 1],
                  }),
                },
              ],
              width: `${100 / (titles?.length ?? 1)}%`,
            } } />
          {titles?.map((title, i) => (
            <Text
              key={ i }
              onPress={ () => {
                onTabChange?.(i);
              } }
              row
              fontSize={ fontSize }
              textCenter 
              color={ theme.colors.text }>
              {title}
            </Text>
          ))}
        </Surface>
        {views && views.length > 0 && (
          <ScrollView>
            <Animated.View>
              {activeTab < views.length && views[activeTab]}
            </Animated.View>
          </ScrollView>
        )}
      </View>
    </Animated.View>
  );

}