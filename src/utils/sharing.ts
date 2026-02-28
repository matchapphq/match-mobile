import { Share, Platform } from 'react-native';

const APP_SCHEME = 'com.matchapps.match://';

export const sharing = {
  /**
   * Share a venue with friends via deep link
   */
  shareVenue: async (venueName: string, venueId: string) => {
    const deepLink = `${APP_SCHEME}venue/${venueId}`;
    const message = Platform.OS === 'ios' 
      ? `Rejoins-moi au ${venueName} pour voir le match ! 🍻` 
      : `Rejoins-moi au ${venueName} pour voir le match ! 🍻\n${deepLink}`;

    try {
      await Share.share({
        title: `Match au ${venueName}`,
        message,
        url: deepLink, // iOS only for the dedicated URL field
      });
    } catch (error) {
      console.warn('Sharing venue failed', error);
    }
  },

  /**
   * Share a specific match via deep link
   */
  shareMatch: async (homeTeam: string, awayTeam: string, matchId: string) => {
    const deepLink = `${APP_SCHEME}match/${matchId}`;
    const matchTitle = `${homeTeam} vs ${awayTeam}`;
    const message = Platform.OS === 'ios'
      ? `On regarde le match ${matchTitle} ensemble ? ⚽️`
      : `On regarde le match ${matchTitle} ensemble ? ⚽️\n${deepLink}`;

    try {
      await Share.share({
        title: matchTitle,
        message,
        url: deepLink,
      });
    } catch (error) {
      console.warn('Sharing match failed', error);
    }
  },
};
