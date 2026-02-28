import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useStore } from '../store/useStore';

/**
 * Utility for haptic feedback that handles platform checks and user preference
 */
export const hapticFeedback = {
  /**
   * Internal check to see if haptics are enabled in user settings
   */
  isEnabled: () => {
    return useStore.getState().hapticsEnabled;
  },

  /**
   * Light impact for small actions like tab selection or toggles
   */
  light: () => {
    if (Platform.OS !== 'web' && hapticFeedback.isEnabled()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * Medium impact for confirmation or significant actions
   */
  medium: () => {
    if (Platform.OS !== 'web' && hapticFeedback.isEnabled()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Heavy impact for very important actions
   */
  heavy: () => {
    if (Platform.OS !== 'web' && hapticFeedback.isEnabled()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Selection feedback for scrolling through lists or pickers
   */
  selection: () => {
    if (Platform.OS !== 'web' && hapticFeedback.isEnabled()) {
      Haptics.selectionAsync();
    }
  },

  /**
   * Success notification feedback
   */
  success: () => {
    if (Platform.OS !== 'web' && hapticFeedback.isEnabled()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /**
   * Warning notification feedback
   */
  warning: () => {
    if (Platform.OS !== 'web' && hapticFeedback.isEnabled()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  /**
   * Error notification feedback
   */
  error: () => {
    if (Platform.OS !== 'web' && hapticFeedback.isEnabled()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
};
