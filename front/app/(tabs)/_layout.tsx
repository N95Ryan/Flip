import { AntDesign } from "@expo/vector-icons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Theme } from "@/constants/theme";

const ICON_SIZE = 22;
const ICON_COLOR = Theme.navbar.iconColor;

function TabBarButton({ children, style, ...props }: BottomTabBarButtonProps) {
  const focused = props.accessibilityState?.selected ?? false;

  return (
    <PlatformPressable
      {...props}
      pressOpacity={0.7}
      style={[style, focused && styles.tabActive]}
    >
      {children}
    </PlatformPressable>
  );
}

function renderTabBar(props: React.ComponentProps<typeof BottomTabBar>) {
  return <CustomTabBar {...props} />;
}

function renderTabBarButton(props: BottomTabBarButtonProps) {
  return <TabBarButton {...props} />;
}

function CustomTabBar(props: React.ComponentProps<typeof BottomTabBar>) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 12,
        left: 24,
        right: 24,
      }}
    >
      <BottomTabBar {...props} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        lazy: false,
        freezeOnBlur: true,
        animation: Platform.OS === "web" ? "none" : "shift",
        tabBarStyle: {
          backgroundColor: Theme.navbar.backgroundColor,
          borderRadius: 40,
          height: 64,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
        },
        tabBarActiveTintColor: ICON_COLOR,
        tabBarInactiveTintColor: ICON_COLOR,
        tabBarLabelStyle: {
          fontSize: Theme.navbar.labelFontSize,
          fontWeight: "300",
          letterSpacing: Theme.navbar.labelLetterSpacing,
        },
        tabBarButton: renderTabBarButton,
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ focused }) => (
            <AntDesign
              name="book"
              size={ICON_SIZE}
              color={ICON_COLOR}
              style={{ opacity: focused ? Theme.navbar.iconActiveOpacity : Theme.navbar.iconInactiveOpacity }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ focused }) => (
            <AntDesign
              name="edit"
              size={ICON_SIZE}
              color={ICON_COLOR}
              style={{ opacity: focused ? Theme.navbar.iconActiveOpacity : Theme.navbar.iconInactiveOpacity }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <AntDesign
              name="user"
              size={ICON_SIZE}
              color={ICON_COLOR}
              style={{ opacity: focused ? Theme.navbar.iconActiveOpacity : Theme.navbar.iconInactiveOpacity }}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabActive: {
    backgroundColor: Theme.navbar.activeBackground,
    borderRadius: Theme.navbar.activeBorderRadius,
    paddingHorizontal: Theme.navbar.activePaddingHorizontal,
    paddingVertical: Theme.navbar.activePaddingVertical,
  },
});
