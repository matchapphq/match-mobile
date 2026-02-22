import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Alert, Linking, Platform } from 'react-native';

const SUPPORT_EMAIL = 'support@matchapp.fr';
const SUPPORT_SUBJECT = '[Support Match] Demande d’assistance';

type OpenSupportEmailParams = {
  userEmail?: string;
};

export async function openSupportEmail(
  params: OpenSupportEmailParams = {}
): Promise<void> {
  const appVersion =
    Constants.expoConfig?.version ||
    Application.nativeApplicationVersion ||
    'unknown';
  const buildVersion = Application.nativeBuildVersion || 'unknown';
  const osName = Device.osName || Platform.OS;
  const osVersion = Device.osVersion || String(Platform.Version);
  const model = Device.modelName || 'unknown';
  const brand = Device.brand || 'unknown';
  const deviceName = Device.deviceName || 'unknown';

  const body = [
    "Bonjour l'équipe Match,",
    '',
    "J'ai besoin d'aide concernant :",
    '',
    '---',
    'NE PAS MODIFIER LA PARTIE SUIVANTE (identification appareil)',
    `Utilisateur: ${params.userEmail || 'unknown'}`,
    `Plateforme: ${Platform.OS}`,
    `OS: ${osName}`,
    `Version OS: ${osVersion}`,
    `Appareil: ${brand} ${model}`,
    `Nom appareil: ${deviceName}`,
    `Version app: ${appVersion}`,
    `Build app: ${buildVersion}`,
    `App ownership: ${Constants.appOwnership || 'unknown'}`,
    `Date: ${new Date().toISOString()}`,
    '---',
  ].join('\n');

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    SUPPORT_SUBJECT
  )}&body=${encodeURIComponent(body)}`;

  try {
    const canOpen = await Linking.canOpenURL(mailto);
    if (!canOpen) {
      Alert.alert(
        'Email indisponible',
        "Aucune application mail n'est configurée sur cet appareil."
      );
      return;
    }
    await Linking.openURL(mailto);
  } catch {
    Alert.alert('Erreur', "Impossible d'ouvrir l'application email.");
  }
}

export function openLiveChatFallback(userEmail?: string): void {
  Alert.alert(
    'Chat en direct',
    "Le chat en direct arrive bientôt. Tu peux nous écrire par email en attendant.",
    [
      {
        text: 'Envoyer un mail',
        onPress: () => {
          void openSupportEmail({ userEmail });
        },
      },
      { text: 'Annuler', style: 'cancel' },
    ]
  );
}
