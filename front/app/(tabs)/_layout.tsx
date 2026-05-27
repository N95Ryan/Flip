import { AntDesign } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

type TabIconProps = {
  name: React.ComponentProps<typeof AntDesign>['name'];
  color: string;
  isActive: boolean;
};

function TabIcon({ name, color, isActive }: TabIconProps) {
  const icon = <AntDesign name={name} size={20} color={color} />;

  if (isActive) {
    return (
      <View
        style={{
          backgroundColor: '#F7F2E9',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 6,
          marginBottom: 4,
        }}
      >
        {icon}
      </View>
    );
  }

  return icon;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#34344A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#BF1A2F',
        tabBarInactiveTintColor: '#84714F',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="book" color={color} isActive={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="edit" color={color} isActive={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="user" color={color} isActive={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
