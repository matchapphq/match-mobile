import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue, Dimensions } from 'react-native';
import { useStore } from '../store/useStore';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}) => {
  const { colors } = useStore();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceAlt,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const VenueCardSkeleton = () => {
  const { colors } = useStore();
  return (
    <View style={[styles.venueCard, { borderColor: colors.border, backgroundColor: colors.surfaceAlt + '40' }]}>
      <Skeleton width={100} height={100} borderRadius={12} />
      <View style={styles.venueInfo}>
        <View style={styles.rowBetween}>
          <Skeleton width="60%" height={20} />
          <Skeleton width={20} height={20} borderRadius={10} />
        </View>
        <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="30%" height={12} style={{ marginTop: 8 }} />
        <View style={styles.rowGap}>
          <Skeleton width={60} height={24} borderRadius={4} />
          <Skeleton width={60} height={24} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

export const MatchCardSkeleton = () => {
  const { colors } = useStore();
  return (
    <View style={[styles.matchCard, { borderColor: colors.border, backgroundColor: colors.surfaceAlt + '40' }]}>
      <View style={styles.matchHeader}>
        <View>
          <Skeleton width={80} height={12} />
          <Skeleton width={100} height={14} style={{ marginTop: 4 }} />
        </View>
        <Skeleton width={120} height={32} borderRadius={8} />
      </View>
      <View style={styles.teamsRow}>
        <View style={styles.teamCol}>
          <Skeleton width={68} height={68} borderRadius={34} />
          <Skeleton width={60} height={14} style={{ marginTop: 8 }} />
        </View>
        <Skeleton width={30} height={24} />
        <View style={styles.teamCol}>
          <Skeleton width={68} height={68} borderRadius={34} />
          <Skeleton width={60} height={14} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
};

export const MatchListItemSkeleton = () => {
  const { colors } = useStore();
  return (
    <View style={[styles.matchListItem, { borderColor: colors.border, backgroundColor: colors.surfaceAlt + '40' }]}>
      <View style={styles.timeColumnSkeleton}>
        <Skeleton width={40} height={20} />
        <Skeleton width={30} height={10} style={{ marginTop: 4 }} />
      </View>
      <View style={[styles.verticalDivider, { backgroundColor: colors.divider }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width="40%" height={10} />
        <View style={styles.rowGap}>
          <Skeleton width={24} height={24} borderRadius={12} />
          <Skeleton width="60%" height={16} />
        </View>
      </View>
      <Skeleton width={20} height={20} borderRadius={10} />
    </View>
  );
};

export const ReservationCardSkeleton = () => {
  const { colors } = useStore();
  return (
    <View style={[styles.reservationCard, { borderColor: colors.border, backgroundColor: colors.surfaceAlt + '40' }]}>
      <View style={styles.rowGapLarge}>
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width={60} height={12} />
          <Skeleton width="80%" height={20} />
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
        </View>
        <Skeleton width={80} height={80} borderRadius={8} />
      </View>
      <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
        <Skeleton width="45%" height={32} borderRadius={8} />
        <Skeleton width="45%" height={32} borderRadius={8} />
      </View>
    </View>
  );
};

export const VenueProfileSkeleton = () => {
  const { colors } = useStore();
  const { height: screenHeight } = Dimensions.get('window');
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Skeleton width="100%" height={320} borderRadius={0} />
      <View style={{ padding: 20, marginTop: -32 }}>
        <Skeleton width="70%" height={36} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={16} style={{ marginBottom: 24 }} />
        
        <View style={[styles.rowGap, { marginBottom: 32 }]}>
          <Skeleton width={100} height={56} borderRadius={16} />
          <Skeleton width={100} height={56} borderRadius={16} />
          <Skeleton width={100} height={56} borderRadius={16} />
        </View>

        <Skeleton width={150} height={24} style={{ marginBottom: 16 }} />
        <MatchListItemSkeleton />
        <MatchListItemSkeleton />
      </View>
    </View>
  );
};

export const MatchDetailSkeleton = () => {
  const { colors } = useStore();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Skeleton width="100%" height="45%" borderRadius={0} />
      <View style={{ padding: 16, marginTop: -30 }}>
        <Skeleton width="100%" height={180} borderRadius={24} style={{ marginBottom: 32 }} />
        <Skeleton width={150} height={24} style={{ marginBottom: 16 }} />
        <View style={styles.rowGap}>
          <Skeleton width={260} height={300} borderRadius={24} />
          <Skeleton width={260} height={300} borderRadius={24} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  venueCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  venueInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  matchCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  matchListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 20,
    marginBottom: 12,
  },
  reservationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  timeColumnSkeleton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  verticalDivider: {
    width: 1,
    height: 40,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  teamCol: {
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowGap: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  rowGapLarge: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
});

export default Skeleton;
