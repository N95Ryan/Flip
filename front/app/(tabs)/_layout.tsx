import { Ionicons } from "@expo/vector-icons";
import { BottomTabBar, type BottomTabBarButtonProps } from "expo-router/js-tabs";
import { PlatformPressable } from "expo-router/react-navigation";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Theme } from "@/constants/theme";

const ICON_SIZE = 22;
const ICON_COLOR = Theme.navbar.iconColor;

type IoniconName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(outline: IoniconName, filled: IoniconName) {
  return ({ focused }: { focused: boolean }) => (
    <Ionicons
      name={focused ? filled : outline}
      size={ICON_SIZE}
      color={ICON_COLOR}
      style={{
        opacity: focused ? Theme.navbar.iconActiveOpacity : Theme.navbar.iconInactiveOpacity,
      }}
    />
  );
}

function TabBarButton({ children, style, ...props }: BottomTabBarButtonProps) {
  return (
    <PlatformPressable {...props} pressOpacity={0.7} style={style}>
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
      safeAreaInsets={{ top: 0, bottom: 0, left: 0, right: 0 }}
      screenOptions={{
        headerShown: false,
        lazy: false,
        animation: Platform.OS === "web" ? "none" : "shift",
        tabBarStyle: {
          backgroundColor: Theme.navbar.backgroundColor,
          borderRadius: 40,
          height: Theme.navbar.height,
          borderTopWidth: 0,
          elevation: Theme.navbar.elevation,
          shadowColor: Theme.navbar.shadowColor,
          shadowOffset: Theme.navbar.shadowOffset,
          shadowOpacity: Theme.navbar.shadowOpacity,
          shadowRadius: Theme.navbar.shadowRadius,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          paddingVertical: 6,
        },
        tabBarIconStyle: {
          marginBottom: 3,
        },
        tabBarActiveTintColor: ICON_COLOR,
        tabBarInactiveTintColor: ICON_COLOR,
        tabBarLabelStyle: {
          fontSize: Theme.navbar.labelFontSize,
          fontWeight: "500",
          letterSpacing: Theme.navbar.labelLetterSpacing,
        },
        tabBarButton: renderTabBarButton,
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: tabIcon("book-outline", "book"),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: tabIcon("journal-outline", "journal"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: tabIcon("person-outline", "person"),
        }}
      />
    </Tabs>
  );
}