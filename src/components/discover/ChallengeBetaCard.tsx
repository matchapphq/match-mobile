import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { getImageUrl } from '../../services/api';

const { width } = Dimensions.get('window');

export interface TopPlayer {
    id: string;
    name: string;
    buts: number;
    avatar_url?: string;
}

interface ChallengeBetaCardProps {
    rank: number;
    buts: number;
    progressText: string;
    topPlayers: TopPlayer[];
    onPressRanking?: () => void;
    onAction?: (action: 'refer' | 'scan' | 'review') => void;
}

const ChallengeBetaCard: React.FC<ChallengeBetaCardProps> = ({
    rank,
    buts,
    progressText,
    topPlayers,
    onPressRanking,
    onAction
}) => {
    // If buts is 0, show empty state
    if (buts === 0) {
        return (
            <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPressRanking}>
                <LinearGradient
                    colors={['#00FF00', '#004400', '#050508']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="trophy" size={40} color="#00FF00" />
                        <Text style={styles.emptyTitle}>Rejoins le challenge !</Text>
                        <Text style={styles.emptySubtitle}>Gagne des buts et débloque des rewards exclusifs.</Text>
                        <View style={styles.startButton}>
                            <Text style={styles.startButtonText}>Commencer</Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#00FF00', '#050508']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.8 }}
                style={styles.gradient}
            >
                {/* Stadium Light Effect */}
                <View style={styles.stadiumLight} />
                
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>🏆 CHALLENGE BÊTA MATCH</Text>
                </View>

                <View style={styles.content}>
                    {/* Left (40%): User Stats */}
                    <View style={styles.leftSection}>
                        <View style={styles.rankCircle}>
                            <Text style={styles.rankText}>#{rank}</Text>
                        </View>
                        <Text style={styles.butsCount}>{buts}</Text>
                        <Text style={styles.butsLabel}>BUTS</Text>
                        
                        <View style={styles.progressWrapper}>
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: '85%' }]} />
                            </View>
                            <Text style={styles.progressText}>{progressText}</Text>
                        </View>
                    </View>

                    {/* Center (40%): Mini Leaderboard */}
                    <View style={styles.centerSection}>
                        <View style={styles.miniLeaderboard}>
                            {topPlayers.slice(0, 3).map((player, index) => (
                                <View key={player.id} style={styles.leaderboardRow}>
                                    <View style={styles.miniAvatar}>
                                        {player.avatar_url ? (
                                            <Image source={{ uri: getImageUrl(player.avatar_url) }} style={styles.avatarImg} />
                                        ) : (
                                            <View style={styles.avatarInitial}><Text style={styles.initialText}>{player.name[0]}</Text></View>
                                        )}
                                    </View>
                                    <View style={styles.playerInfo}>
                                        <Text style={styles.miniName} numberOfLines={1}>{player.name}</Text>
                                        <Text style={styles.miniButs}>{player.buts}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                        <View style={styles.scrollDots}>
                            <View style={[styles.dot, styles.activeDot]} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>
                    </View>

                    {/* Right (20%): Action Pills */}
                    <View style={styles.rightSection}>
                        <TouchableOpacity style={styles.pill} onPress={() => onAction?.('refer')}>
                            <Text style={styles.pillText}>Parrainer</Text>
                            <Text style={styles.pillBonus}>+10</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pill} onPress={() => onAction?.('scan')}>
                            <Text style={styles.pillText}>Scanner QR</Text>
                            <Text style={styles.pillBonus}>+10</Text>
                        </TouchableOpacity>
                        <Text style={styles.rulesHint}>1/jour/lieu</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.footerLink} onPress={onPressRanking}>
                    <Text style={styles.footerLinkText}>Voir classement complet →</Text>
                </TouchableOpacity>

                <Text style={styles.fraudNote}>Actions vérifiées - Pas de fraude</Text>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width - 32,
        alignSelf: 'center',
        borderRadius: 20,
        overflow: 'hidden',
        marginVertical: 12,
        backgroundColor: '#050508',
        shadowColor: '#00FF00',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    },
    gradient: {
        padding: 16,
        paddingBottom: 8,
    },
    stadiumLight: {
        position: 'absolute',
        top: -50,
        left: '25%',
        width: width,
        height: 150,
        backgroundColor: 'rgba(0, 255, 0, 0.08)',
        borderRadius: 100,
        transform: [{ scaleX: 2 }, { rotate: '-15deg' }],
    },
    header: {
        marginBottom: 16,
    },
    headerTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    leftSection: {
        width: '40%',
    },
    rankCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 255, 0, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#00FF00',
        marginBottom: 4,
    },
    rankText: {
        color: '#00FF00',
        fontSize: 14,
        fontWeight: '900',
    },
    butsCount: {
        color: 'white',
        fontSize: 32,
        fontWeight: '900',
        lineHeight: 38,
    },
    butsLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10,
        fontWeight: '700',
        marginTop: -4,
    },
    progressWrapper: {
        marginTop: 12,
    },
    progressTrack: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        width: '90%',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#00FF00',
    },
    progressText: {
        color: '#00FF00',
        fontSize: 8,
        fontWeight: 'bold',
        marginTop: 4,
    },
    centerSection: {
        width: '40%',
        paddingHorizontal: 8,
    },
    miniLeaderboard: {
        gap: 8,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    miniAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    avatarInitial: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    initialText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    playerInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    miniName: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 10,
        fontWeight: '600',
        maxWidth: '65%',
    },
    miniButs: {
        color: '#00FF00',
        fontSize: 10,
        fontWeight: '800',
    },
    scrollDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
        marginTop: 8,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    activeDot: {
        backgroundColor: '#00FF00',
    },
    rightSection: {
        width: '20%',
        gap: 6,
    },
    pill: {
        backgroundColor: 'rgba(0, 255, 0, 0.15)',
        borderRadius: 100,
        paddingVertical: 4,
        paddingHorizontal: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 0, 0.3)',
    },
    pillText: {
        color: 'white',
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    pillBonus: {
        color: '#00FF00',
        fontSize: 8,
        fontWeight: '900',
    },
    rulesHint: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 7,
        textAlign: 'center',
        marginTop: 2,
    },
    footerLink: {
        marginTop: 16,
        alignSelf: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#00FF00',
        paddingBottom: 2,
    },
    footerLinkText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    fraudNote: {
        color: 'rgba(255, 255, 255, 0.2)',
        fontSize: 7,
        textAlign: 'center',
        marginTop: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    emptyTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
    },
    emptySubtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    startButton: {
        backgroundColor: '#00FF00',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 100,
    },
    startButtonText: {
        color: '#050508',
        fontSize: 14,
        fontWeight: 'bold',
    }
});

export default ChallengeBetaCard;
