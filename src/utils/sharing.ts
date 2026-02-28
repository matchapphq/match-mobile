import { Share, Platform } from 'react-native';

interface ShareOptions {
  title: string;
  message: string;
  url?: string;
}

export const sharing = {
  /**
   * Share a venue with friends
   */
  shareVenue: async (venueName: string, venueId: string) => {
    const url = `https://matchapp.fr/venue/${venueId}`;
    const message = Platform.OS === 'ios' 
      ? `Rejoins-moi au ${venueName} pour voir le match ! 🍻` 
      : `Rejoins-moi au ${venueName} pour voir le match ! 🍻
${url}`;

    try {
      await Share.share({
        title: `Match au ${venueName}`,
        message,
        url, // iOS only for the dedicated URL field
      });
    } catch (error) {
      console.warn('Sharing venue failed', error);
    }
  },

  /**
   * Share a specific match
   */
  shareMatch: async (homeTeam: string, awayTeam: string, matchId: string) => {
    const url = `https://matchapp.fr/match/${matchId}`;
    const matchTitle = `${homeTeam} vs ${awayTeam}`;
    const message = Platform.OS === 'ios'
      ? `On regarde le match ${matchTitle} ensemble ? ⚽️`
      : `On regarde le match ${matchTitle} ensemble ? ⚽️
${url}`;

    try {
      await Share.share({
        title: matchTitle,
        message,
        url,
      });
    } catch (error) {
      console.warn('Sharing match failed', error);
    }
  },
};
