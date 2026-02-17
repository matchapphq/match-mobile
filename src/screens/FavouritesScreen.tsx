import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { mobileApi, SearchResult } from '../services/mobileApi';
import { useStore } from '../store/useStore';

type FilterTab = 'all' | 'bars' | 'restaurants';

const FavouritesScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { colors, themeMode, favouriteVenueIds, toggleFavourite, fetchFavourites } = useStore();

    const [venues, setVenues] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

    const loadFavourites = useCallback(async () => {
        try {
            const data = await mobileApi.fetchFavoriteVenues();
            setVenues(data);
        } catch (error) {
            console.warn('Failed to load favourites', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Load favourites when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            fetchFavourites();
            loadFavourites();
        }, [loadFavourites, fetchFavourites])
    );

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchFavourites();
        await loadFavourites();
    };

    const handleRemoveFavourite = async (venueId: string) => {
        await toggleFavourite(venueId);
        // Remove from local list immediately
        setVenues(prev => prev.filter(v => v.id !== venueId));
    };

    // Filter venues based on active tab
    const filteredVenues = venues.filter(venue => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'bars') {
            return venue.tag?.toLowerCase().includes('bar') || 
                   venue.tag?.toLowerCase().includes('pub') ||
                   !venue.tag?.toLowerCase().includes('restaurant');
        }
        if (activeFilter === 'restaurants') {
            return venue.tag?.toLowerCase().includes('restaurant');
        }
        return true;
    });

    const barCount = venues.filter(v => 
        v.tag?.toLowerCase().includes('bar') || 
        v.tag?.toLowerCase().includes('pub') ||
        !v.tag?.toLowerCase().includes('restaurant')
    ).length;
    const restaurantCount = venues.filter(v => 
        v.tag?.toLowerCase().includes('restaurant')
    ).length;

    const renderFilterTabs = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
            style={styles.filterScroll}
        >
            <TouchableOpacity
                style={[
                    styles.filterPill,
                    activeFilter === 'all'
                        ? [styles.filterPillActive, { backgroundColor: colors.primary }]
                        : { backgroundColor: themeMode === 'light' ? '#fff' : colors.surface, borderColor: colors.border },
                ]}
                onPress={() => setActiveFilter('all')}
                activeOpacity={0.8}
            >
                <Text
                    style={[
                        styles.filterPillText,
                        activeFilter === 'all'
                            ? styles.filterPillTextActive
                            : { color: colors.textMuted },
                    ]}
                >
                    Tous ({venues.length})
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.filterPill,
                    activeFilter === 'bars'
                        ? [styles.filterPillActive, { backgroundColor: colors.primary }]
                        : { backgroundColor: themeMode === 'light' ? '#fff' : colors.surface, borderColor: colors.border },
                ]}
                onPress={() => setActiveFilter('bars')}
                activeOpacity={0.8}
            >
                <Text
                    style={[
                        styles.filterPillText,
                        activeFilter === 'bars'
                            ? styles.filterPillTextActive
                            : { color: colors.textMuted },
                    ]}
                >
                    Bars ({barCount})
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.filterPill,
                    activeFilter === 'restaurants'
                        ? [styles.filterPillActive, { backgroundColor: colors.primary }]
                        : { backgroundColor: themeMode === 'light' ? '#fff' : colors.surface, borderColor: colors.border },
                ]}
                onPress={() => setActiveFilter('restaurants')}
                activeOpacity={0.8}
            >
                <Text
                    style={[
                        styles.filterPillText,
                        activeFilter === 'restaurants'
                            ? styles.filterPillTextActive
                            : { color: colors.textMuted },
                    ]}
                >
                    Restaurants ({restaurantCount})
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderVenueCard = (venue: SearchResult) => {
        const isFav = favouriteVenueIds.has(venue.id);

        return (
            <TouchableOpacity
                key={venue.id}
                style={[
                    styles.venueCard,
                    {
                        backgroundColor: themeMode === 'light' ? '#fff' : colors.surface,
                        borderColor: colors.border,
                    },
                ]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('VenueProfile', { venueId: venue.id })}
            >
                <View style={[styles.venueImageContainer, { backgroundColor: colors.surfaceAlt }]}>
                    {venue.image ? (
                        <Image source={{ uri: venue.image }} style={styles.venueImage} />
                    ) : (
                        <MaterialIcons name="sports-bar" size={40} color={colors.textMuted} />
                    )}
                    {venue.isLive && (
                        <View style={styles.openBadge}>
                            <Text style={styles.openBadgeText}>OUVERT</Text>
                        </View>
                    )}
                </View>

                <View style={styles.venueInfo}>
                    <View style={styles.venueTitleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.venueName, { color: colors.text }]} numberOfLines={1}>
                                {venue.name}
                            </Text>
                            <View style={styles.venueLocationRow}>
                                <MaterialIcons name="location-on" size={14} color={colors.textMuted} />
                                <Text style={[styles.venueLocationText, { color: colors.textMuted }]}>
                                    {venue.distance}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleRemoveFavourite(venue.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons
                                name={isFav ? 'favorite' : 'favorite-border'}
                                size={22}
                                color={colors.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tagsRow}>
                        {venue.tag && (
                            <View
                                style={[
                                    styles.tagChip,
                                    {
                                        backgroundColor: 'rgba(59,130,246,0.1)',
                                        borderColor: 'rgba(59,130,246,0.1)',
                                    },
                                ]}
                            >
                                <Text style={[styles.tagChipText, { color: '#3b82f6' }]}>
                                    {venue.tag}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.venueBottomRow}>
                        <View style={styles.ratingRow}>
                            <MaterialIcons name="star" size={14} color="#facc15" />
                            <Text style={[styles.ratingText, { color: colors.text }]}>
                                {venue.rating.toFixed(1)}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.reserveButton, { backgroundColor: colors.primary }]}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('VenueProfile', { venueId: venue.id })}
                        >
                            <Text style={styles.reserveButtonText}>Réserver</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === 'light' ? 'dark-content' : 'light-content'} />

            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + 8,
                        backgroundColor: themeMode === 'light'
                            ? 'rgba(248,247,245,0.9)'
                            : 'rgba(11,11,15,0.9)',
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[styles.headerButton, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.goBack?.()}
                >
                    <MaterialIcons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Mes Favoris</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator color={colors.primary} />
                    <Text style={[styles.stateText, { color: colors.textMuted }]}>
                        Chargement des favoris...
                    </Text>
                </View>
            ) : venues.length === 0 ? (
                <View style={styles.centerState}>
                    <MaterialIcons name="favorite-border" size={64} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        Aucun favori
                    </Text>
                    <Text style={[styles.stateText, { color: colors.textMuted }]}>
                        Ajoutez des bars et restaurants à vos favoris pour les retrouver ici.
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {/* Filter Tabs */}
                    <View style={styles.filterSection}>
                        {renderFilterTabs()}
                    </View>

                    {/* Venue Cards */}
                    <View style={styles.venueList}>
                        {filteredVenues.map(renderVenueCard)}
                        {filteredVenues.length === 0 && (
                            <Text style={[styles.stateText, { color: colors.textMuted, marginTop: 32 }]}>
                                Aucun résultat pour ce filtre.
                            </Text>
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    centerState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    stateText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
    },
    filterSection: {
        paddingTop: 16,
        paddingBottom: 8,
    },
    filterScroll: {
        paddingHorizontal: 0,
    },
    filterContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterPillActive: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    filterPillText: {
        fontSize: 13,
        fontWeight: '600',
    },
    filterPillTextActive: {
        color: '#fff',
    },
    venueList: {
        paddingHorizontal: 16,
        gap: 12,
        paddingTop: 8,
    },
    venueCard: {
        flexDirection: 'row',
        gap: 12,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    venueImageContainer: {
        width: 96,
        height: 96,
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    venueImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    openBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: 'rgba(34,197,94,0.9)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    openBadgeText: {
        fontSize: 8,
        fontWeight: '700',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    venueInfo: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    venueTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
    },
    venueName: {
        fontSize: 15,
        fontWeight: '700',
        lineHeight: 20,
    },
    venueLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    venueLocationText: {
        fontSize: 12,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
    },
    tagChip: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        borderWidth: 1,
    },
    tagChipText: {
        fontSize: 10,
        fontWeight: '600',
    },
    venueBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '600',
    },
    reserveButton: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    reserveButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
});

export default FavouritesScreen;
