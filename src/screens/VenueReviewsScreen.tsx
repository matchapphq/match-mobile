import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useStore } from '../store/useStore';

interface Review {
    id: string;
    userName: string;
    userAvatar?: string;
    userInitials?: string;
    rating: number;
    date: string;
    content: string;
    photos?: string[];
    helpfulCount: number;
    isHelpful?: boolean;
}

interface RatingDistribution {
    stars: number;
    percentage: number;
}

const VenueReviewsScreen = ({ navigation, route }: { navigation: any; route: any }) => {
    const { colors, themeMode } = useStore();
    const insets = useSafeAreaInsets();
    const venueName: string = route?.params?.venueName || 'Bar';
    const venueRating: number = route?.params?.venueRating || 4.8;
    const venueReviewCount: number = route?.params?.venueReviewCount || 120;
    
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);

    const ratingDistribution: RatingDistribution[] = [
        { stars: 5, percentage: 85 },
        { stars: 4, percentage: 10 },
        { stars: 3, percentage: 3 },
        { stars: 2, percentage: 1 },
        { stars: 1, percentage: 1 },
    ];

    const mockReviews: Review[] = [
        {
            id: '1',
            userName: 'Thomas Dubois',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            rating: 5.0,
            date: 'Il y a 2 jours',
            content: "Ambiance incroyable pour le match PSG-OM ! Les écrans sont immenses et le son est top. Le service était rapide malgré le monde. Je recommande vivement pour les soirs de match.",
            photos: [
                'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=200&h=200&fit=crop',
            ],
            helpfulCount: 12,
        },
        {
            id: '2',
            userName: 'Léa Jackson',
            userInitials: 'LJ',
            rating: 4.5,
            date: 'Il y a 1 semaine',
            content: "Super spot pour l'happy hour. Les prix sont corrects pour le quartier et les planches à partager sont généreuses. Un peu bruyant mais c'est normal pour un sports bar.",
            helpfulCount: 8,
        },
        {
            id: '3',
            userName: 'Marc Simon',
            userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
            rating: 5.0,
            date: 'Il y a 2 semaines',
            content: "Le staff est au top ! On a pu réserver une table devant l'écran principal pour la finale. Je reviendrai sans hésiter.",
            helpfulCount: 24,
            isHelpful: true,
        },
        {
            id: '4',
            userName: 'Sophie Petit',
            userInitials: 'SP',
            rating: 4.0,
            date: 'Il y a 3 semaines',
            content: "Bonne ambiance générale. La bière est fraîche et les burgers sont bons. Seul bémol, il faut arriver tôt pour avoir une place assise.",
            helpfulCount: 3,
        },
    ];

    useEffect(() => {
        setTimeout(() => {
            setReviews(mockReviews);
            setIsLoading(false);
        }, 500);
    }, []);

    const handleBack = () => {
        navigation.goBack();
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <MaterialIcons key={`full-${i}`} name="star" size={14} color={colors.primary} />
            );
        }
        if (hasHalfStar) {
            stars.push(
                <MaterialIcons key="half" name="star-half" size={14} color={colors.primary} />
            );
        }
        return stars;
    };

    const renderRatingBar = (item: RatingDistribution) => (
        <View key={item.stars} style={styles.ratingBarRow}>
            <Text style={[styles.ratingBarLabel, { color: colors.textMuted }]}>{item.stars}</Text>
            <View style={[styles.ratingBarTrack, { backgroundColor: themeMode === 'light' ? '#e5e7eb' : '#1c1c21' }]}>
                <View 
                    style={[
                        styles.ratingBarFill, 
                        { 
                            width: `${item.percentage}%`,
                            backgroundColor: item.percentage > 0 ? colors.primary : colors.textMuted,
                        }
                    ]} 
                />
            </View>
        </View>
    );

    const renderReviewCard = (review: Review) => (
        <View 
            key={review.id} 
            style={[
                styles.reviewCard, 
                { 
                    backgroundColor: themeMode === 'light' ? '#fff' : '#1c1c21',
                    borderColor: 'rgba(255,255,255,0.05)',
                }
            ]}
        >
            {/* Header */}
            <View style={styles.reviewHeader}>
                <View style={styles.reviewUser}>
                    <View style={[styles.avatar, { backgroundColor: '#27272a', borderColor: 'rgba(255,255,255,0.1)' }]}>
                        {review.userAvatar ? (
                            <Image source={{ uri: review.userAvatar }} style={styles.avatarImage} />
                        ) : (
                            <Text style={[styles.avatarText, { color: colors.textMuted }]}>{review.userInitials}</Text>
                        )}
                    </View>
                    <View>
                        <Text style={[styles.userName, { color: colors.text }]}>{review.userName}</Text>
                        <Text style={[styles.reviewDate, { color: colors.textMuted }]}>{review.date}</Text>
                    </View>
                </View>
                <View style={[styles.ratingBadge, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <Text style={[styles.ratingBadgeText, { color: colors.text }]}>{(typeof review.rating === 'number' ? review.rating : (Number(review.rating) || 0)).toFixed(1)}</Text>
                    <MaterialIcons name="star" size={10} color={colors.primary} />
                </View>
            </View>

            {/* Content */}
            <Text style={[styles.reviewContent, { color: themeMode === 'light' ? '#374151' : '#d4d4d8' }]}>
                {review.content}
            </Text>

            {/* Photos */}
            {review.photos && review.photos.length > 0 && (
                <View style={styles.photoGrid}>
                    {review.photos.map((photo, index) => (
                        <TouchableOpacity key={index} style={styles.photoContainer} activeOpacity={0.8}>
                            <Image source={{ uri: photo }} style={styles.photo} />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Actions */}
            <View style={styles.reviewActions}>
                <TouchableOpacity 
                    style={styles.helpfulButton}
                    activeOpacity={0.7}
                >
                    <MaterialIcons 
                        name={review.isHelpful ? "thumb-up" : "thumb-up-off-alt"} 
                        size={18} 
                        color={review.isHelpful ? colors.primary : colors.textMuted} 
                    />
                    <Text style={[
                        styles.helpfulText, 
                        { 
                            color: review.isHelpful ? colors.primary : colors.textMuted,
                            fontWeight: review.isHelpful ? '700' : '500',
                        }
                    ]}>
                        Utile ({review.helpfulCount})
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerState, { backgroundColor: colors.background }]}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.stateText, { color: colors.textSecondary }]}>Chargement des avis...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} />
            
            {/* Sticky Header */}
            <View style={[
                styles.header, 
                { 
                    paddingTop: insets.top,
                    backgroundColor: themeMode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(11,11,15,0.8)',
                    borderBottomColor: 'rgba(255,255,255,0.05)',
                }
            ]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={[styles.headerButton, { backgroundColor: themeMode === 'light' ? '#f1f5f9' : '#1c1c21' }]} 
                        onPress={handleBack}
                    >
                        <MaterialIcons name="arrow-back" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{venueName.toUpperCase()}</Text>
                    <TouchableOpacity 
                        style={[styles.headerButton, { backgroundColor: themeMode === 'light' ? '#f1f5f9' : '#1c1c21' }]}
                    >
                        <MaterialIcons name="filter-list" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Rating Summary */}
                <View style={styles.ratingSummary}>
                    <View style={styles.ratingOverview}>
                        {/* Left: Big Rating */}
                        <View style={styles.ratingLeft}>
                            <Text style={[styles.bigRating, { color: colors.text }]}>{(typeof venueRating === 'number' ? venueRating : (Number(venueRating) || 0)).toFixed(1)}</Text>
                            <View style={styles.starsRow}>
                                {renderStars(venueRating)}
                            </View>
                            <Text style={[styles.reviewCount, { color: colors.textMuted }]}>
                                {venueReviewCount} AVIS
                            </Text>
                        </View>

                        {/* Right: Distribution Bars */}
                        <View style={styles.ratingRight}>
                            {ratingDistribution.map(renderRatingBar)}
                        </View>
                    </View>
                </View>

                {/* Reviews List */}
                <View style={styles.reviewsSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Derniers avis</Text>
                    <View style={styles.reviewsList}>
                        {reviews.map(renderReviewCard)}
                    </View>
                </View>
            </ScrollView>

            {/* Floating Write Review Button */}
            <TouchableOpacity 
                style={[styles.writeReviewButton, { bottom: insets.bottom + 24 }]}
                activeOpacity={0.9}
            >
                <MaterialIcons name="edit" size={20} color="#fff" />
                <Text style={styles.writeReviewText}>Laisser un avis</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16,
    },
    stateText: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    header: {
        borderBottomWidth: 1,
        zIndex: 40,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    scrollView: {
        flex: 1,
    },
    ratingSummary: {
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    ratingOverview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
    },
    ratingLeft: {
        alignItems: 'center',
    },
    bigRating: {
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: -2,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginVertical: 4,
    },
    reviewCount: {
        fontSize: 10,
        fontWeight: '500',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    ratingRight: {
        flex: 1,
        gap: 6,
    },
    ratingBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ratingBarLabel: {
        fontSize: 10,
        fontWeight: '700',
        width: 8,
    },
    ratingBarTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    ratingBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    reviewsSection: {
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 24,
    },
    reviewsList: {
        gap: 24,
    },
    reviewCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
    },
    reviewDate: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 2,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    reviewContent: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12,
    },
    photoGrid: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    photoContainer: {
        width: 64,
        height: 64,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#27272a',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    reviewActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    helpfulButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    helpfulText: {
        fontSize: 12,
    },
    writeReviewButton: {
        position: 'absolute',
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingLeft: 16,
        paddingRight: 20,
        paddingVertical: 14,
        borderRadius: 999,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    writeReviewText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});

export default VenueReviewsScreen;
