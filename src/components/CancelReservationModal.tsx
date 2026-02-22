import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useStore } from '../store/useStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = 500;

export type CancelReservationData = {
  id: string;
  match: string;
  venue: string;
  time: string;
  image: string;
};

type CancelReservationModalProps = {
  visible: boolean;
  reservation: CancelReservationData | null;
  onClose: () => void;
  onConfirmCancel: () => void;
  primaryColor?: string;
};

const CancelReservationModal: React.FC<CancelReservationModalProps> = ({
  visible,
  reservation,
  onClose,
  onConfirmCancel,
  primaryColor = COLORS.primary,
}) => {
  const { colors } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animation values before showing
      slideAnim.setValue(MODAL_HEIGHT);
      backdropAnim.setValue(0);
      setModalVisible(true);
      
      // Small delay to ensure modal is mounted before animating
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(backdropAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 25,
            stiffness: 200,
            mass: 0.8,
            useNativeDriver: true,
          }),
        ]).start();
      }, 10);
    } else if (modalVisible) {
      // Animate out then hide modal
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: MODAL_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible]);

  const handleOverlayPress = () => {
    onClose();
  };

  if (!modalVisible) return null;

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop - tap to dismiss */}
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: backdropAnim,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Modal Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {/* Handle bar */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.warningIcon}>
              <MaterialIcons name="warning" size={32} color="#ef4444" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Annuler la réservation ?</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Cette action est irréversible. Êtes-vous sûr de ne plus vouloir venir ?
            </Text>
          </View>

          {/* Content */}
          {reservation && (
            <View style={styles.content}>
              {/* Match Reminder Card */}
              <View>
                <Text style={[styles.reminderLabel, { color: colors.text }]}>Rappel du match</Text>
                <View style={[styles.reminderCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <View style={styles.reminderInfo}>
                    <Text style={[styles.reminderMatch, { color: colors.text }]}>{reservation.match}</Text>
                    <View style={styles.reminderLocation}>
                      <MaterialIcons name="location-on" size={14} color="#baa89c" />
                      <Text style={[styles.reminderLocationText, { color: colors.textMuted }]}>
                        {reservation.venue} • {reservation.time}
                      </Text>
                    </View>
                  </View>
                  <Image source={{ uri: reservation.image }} style={styles.reminderImage} />
                </View>
              </View>

              {/* Cancel Conditions */}
              <View style={styles.conditionsCard}>
                <MaterialIcons name="info" size={20} color="#fb923c" style={{ marginTop: 2 }} />
                <View style={styles.conditionsContent}>
                  <Text style={styles.conditionsTitle}>Conditions d'annulation</Text>
                  <Text style={styles.conditionsText}>
                    Toute annulation moins de 2h avant le début du match peut entraîner des frais
                    de non-présentation selon la politique de l'établissement.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.keepButton, { backgroundColor: primaryColor }]}
              onPress={onClose}
              activeOpacity={0.9}
            >
              <Text style={styles.keepButtonText}>Garder ma réservation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirmCancel}
              activeOpacity={0.9}
            >
              <Text style={styles.confirmButtonText}>Confirmer l'annulation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  warningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  reminderLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  reminderInfo: {
    flex: 1,
    gap: 4,
  },
  reminderMatch: {
    fontSize: 16,
    fontWeight: '700',
  },
  reminderLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reminderLocationText: {
    fontSize: 12,
  },
  reminderImage: {
    width: 80,
    height: 56,
    borderRadius: 8,
  },
  conditionsCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(249, 115, 22, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.1)',
  },
  conditionsContent: {
    flex: 1,
    gap: 4,
  },
  conditionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fed7aa',
  },
  conditionsText: {
    fontSize: 12,
    color: '#a1a1aa',
    lineHeight: 18,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
    gap: 12,
  },
  keepButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  keepButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b0b0f',
  },
  confirmButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f87171',
  },
});

export default CancelReservationModal;
