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
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: theme.colors.text,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconButton: {
    padding: 8,
  },
});

export default FloatingNavBar;
