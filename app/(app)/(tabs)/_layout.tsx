import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../../src/theme/tokens';
import { Compass, Search, Users, User } from 'lucide-react-native';

export type TabKey = 'index' | 'search' | 'rooms' | 'profile';

interface TabsLayoutProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  children: React.ReactNode;
}

export function TabsLayout({ activeTab, onTabChange, children }: TabsLayoutProps) {
  const tabs: Array<{ key: TabKey; label: string; icon: (focused: boolean) => React.ReactNode }> = [
    {
      key: 'index',
      label: 'Khám phá',
      icon: (focused) => (
        <Compass
          size={22}
          color={focused ? colors.primary : colors.textMuted}
          strokeWidth={focused ? 2.5 : 2}
        />
      ),
    },
    {
      key: 'search',
      label: 'Tìm kiếm',
      icon: (focused) => (
        <Search
          size={22}
          color={focused ? colors.primary : colors.textMuted}
          strokeWidth={focused ? 2.5 : 2}
        />
      ),
    },
    {
      key: 'rooms',
      label: 'Phòng',
      icon: (focused) => (
        <Users
          size={22}
          color={focused ? colors.primary : colors.textMuted}
          strokeWidth={focused ? 2.5 : 2}
        />
      ),
    },
    {
      key: 'profile',
      label: 'Tôi',
      icon: (focused) => (
        <User
          size={22}
          color={focused ? colors.primary : colors.textMuted}
          strokeWidth={focused ? 2.5 : 2}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.screenContent}>{children}</View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isFocused = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              style={styles.tabItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                {tab.icon(isFocused)}
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    flex: 1,
  },
  tabBar: {
    height: 68,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 8,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minWidth: 44,
  },
  iconWrap: {
    width: 38,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    marginBottom: 2,
  },
  iconWrapActive: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    ...typography.captionMedium,
    fontSize: 11,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
