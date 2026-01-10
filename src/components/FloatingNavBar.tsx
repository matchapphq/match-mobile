import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface FloatingNavBarProps {
  onListPress: () => void;
  onSearchPress: () => void;
  onFilterPress: () => void;
  activeTab?: 'list' | 'search' | 'filter';
}

const FloatingNavBar: React.FC<FloatingNavBarProps> = ({
  onListPress,
  onSearchPress,
  onFilterPress,
  activeTab,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onListPress}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={28}
            color={activeTab === 'list' ? theme.colors.secondary : theme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearchPress}
        >
          <Ionicons
            name="search"
            size={28}
            color={activeTab === 'search' ? theme.colors.secondary : theme.colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onFilterPress}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={28}
            color={activeTab === 'filter' ? theme.colors.secondary : theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(123, 47, 254, 0.15)',
  },
  iconButton: {
    padding: 6,
  },
});

export default FloatingNavBar;
