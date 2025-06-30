import { Quest } from '@/components/quest/QuestCard';
import { useAlert } from '@/components/ui/AlertProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import {
  ChartBar as BarChart3,
  Clock,
  Copy,
  Download,
  Facebook,
  Instagram,
  Link,
  Linkedin,
  MapPin,
  MessageCircle,
  Share2,
  Sparkles,
  Trophy,
  Twitter,
  X,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

const { width: screenWidth } = Dimensions.get('window');

interface EnhancedQuestShareModalProps {
  visible: boolean;
  onClose: () => void;
  quest: Quest;
  completionTime?: string;
  achievements?: string[];
  userLevel?: number;
  totalPoints?: number;
}

interface SharingAnalytics {
  platform: string;
  questId: string;
  timestamp: string;
  success: boolean;
}

export function EnhancedQuestShareModal({
  visible,
  onClose,
  quest,
  completionTime = '15 min',
  achievements = [],
  userLevel = 1,
  totalPoints = 0,
}: EnhancedQuestShareModalProps) {
  const colors = useThemeColors();
  const { showError, showSuccess, showInfo } = useAlert();
  const [customMessage, setCustomMessage] = useState('');
  const [personalComment, setPersonalComment] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [sharingAnalytics, setSharingAnalytics] = useState<SharingAnalytics[]>(
    [],
  );
  const shareCardRef = useRef<View>(null);

  const getCategoryColor = (category: Quest['category']) => {
    switch (category) {
      case 'mindfulness':
        return colors.primary;
      case 'creativity':
        return colors.accent;
      case 'connection':
        return colors.secondary;
      case 'movement':
        return colors.success;
      case 'learning':
        return colors.warning;
      case 'adventure':
        return '#8b5cf6';
      case 'productivity':
        return '#06b6d4';
      case 'community':
        return '#f59e0b';
      case 'wildcard':
        return '#ec4899';
      default:
        return colors.primary;
    }
  };

  const categoryColor = getCategoryColor(quest.category);

  const defaultMessage = `🎉 Just completed "${
    quest.title
  }" on Froliik! Another step forward in my growth journey. ${
    personalComment ? `\n\n${personalComment}` : ''
  }\n\n#FroliikQuest #PersonalGrowth #${
    quest.category.charAt(0).toUpperCase() + quest.category.slice(1)
  }`;

  const shareMessage = customMessage || defaultMessage;
  const appUrl = 'https://froliik.app';
  const deepLink = `froliik://quest/${quest.id}`;

  const trackSharing = (platform: string, success: boolean) => {
    const analytics: SharingAnalytics = {
      platform,
      questId: quest.id,
      timestamp: new Date().toISOString(),
      success,
    };
    setSharingAnalytics((prev) => [...prev, analytics]);

    // Here you would typically send this to your analytics service
    console.log('Sharing analytics:', analytics);
  };

  const generateShareCard = async () => {
    try {
      setIsGeneratingImage(true);

      if (!shareCardRef.current) {
        throw new Error('Share card reference not found');
      }

      const uri = await captureRef(shareCardRef.current, {
        format: 'png',
        quality: 1,
        width: 400,
        height: 600,
      });

      return uri;
    } catch (error) {
      console.error('Error generating share card:', error);
      await showError('Error', 'Failed to generate share card');
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const shareToTwitter = async () => {
    const twitterMessage = `${shareMessage}\n\n${appUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      twitterMessage,
    )}`;

    try {
      if (Platform.OS === 'web') {
        window.open(twitterUrl, '_blank');
        trackSharing('twitter', true);
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(twitterMessage);
          trackSharing('twitter', true);
        }
      }
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      trackSharing('twitter', false);
      await showError('Error', 'Failed to share to Twitter');
    }
  };

  const shareToFacebook = async () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      appUrl,
    )}&quote=${encodeURIComponent(shareMessage)}`;

    try {
      if (Platform.OS === 'web') {
        window.open(facebookUrl, '_blank');
        trackSharing('facebook', true);
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(shareMessage);
          trackSharing('facebook', true);
        }
      }
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      trackSharing('facebook', false);
      await showError('Error', 'Failed to share to Facebook');
    }
  };

  const shareToLinkedIn = async () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      appUrl,
    )}&summary=${encodeURIComponent(shareMessage)}`;

    try {
      if (Platform.OS === 'web') {
        window.open(linkedInUrl, '_blank');
        trackSharing('linkedin', true);
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(`${shareMessage}\n\n${appUrl}`);
          trackSharing('linkedin', true);
        }
      }
    } catch (error) {
      console.error('Error sharing to LinkedIn:', error);
      trackSharing('linkedin', false);
      await showError('Error', 'Failed to share to LinkedIn');
    }
  };

  const shareToWhatsApp = async () => {
    const whatsappMessage = `${shareMessage}\n\n${appUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      whatsappMessage,
    )}`;

    try {
      if (Platform.OS === 'web') {
        window.open(whatsappUrl, '_blank');
        trackSharing('whatsapp', true);
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(whatsappMessage);
          trackSharing('whatsapp', true);
        }
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      trackSharing('whatsapp', false);
      await showError('Error', 'Failed to share to WhatsApp');
    }
  };

  const shareToInstagram = async () => {
    try {
      const imageUri = await generateShareCard();
      if (!imageUri) return;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUri, {
          dialogTitle: 'Share to Instagram',
        });
        trackSharing('instagram', true);
      } else {
        await showInfo(
          'Instagram Sharing',
          'Instagram sharing is not available on this platform',
        );
      }
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      trackSharing('instagram', false);
      await showError('Error', 'Failed to share to Instagram');
    }
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(shareMessage);
      await showSuccess('Copied!', 'Share message copied to clipboard');
      trackSharing('clipboard', true);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      trackSharing('clipboard', false);
      await showError('Error', 'Failed to copy to clipboard');
    }
  };

  const copyDeepLink = async () => {
    try {
      await Clipboard.setStringAsync(deepLink);
      await showSuccess(
        'Deep Link Copied!',
        'Direct link to this quest copied to clipboard',
      );
      trackSharing('deeplink', true);
    } catch (error) {
      console.error('Error copying deep link:', error);
      trackSharing('deeplink', false);
      await showError('Error', 'Failed to copy deep link');
    }
  };

  const shareGeneric = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'Quest Completed!',
            text: shareMessage,
            url: appUrl,
          });
          trackSharing('native', true);
        } else {
          await copyToClipboard();
        }
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(shareMessage, {
            dialogTitle: 'Share Quest Completion',
          });
          trackSharing('native', true);
        } else {
          await copyToClipboard();
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      trackSharing('native', false);
      await showError('Error', 'Failed to share');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.success + '20' },
                ]}
              >
                <Trophy size={24} color={colors.success} strokeWidth={2} />
              </View>
              <View>
                <AppText variant="h3">Quest Completed!</AppText>
                <AppText variant="caption" color="muted">
                  Share your achievement
                </AppText>
              </View>
            </View>
            <Button
              title=""
              onPress={onClose}
              variant="ghost"
              style={styles.closeButton}
            >
              <X size={24} color={colors.text.muted} strokeWidth={2} />
            </Button>
          </View>

          {/* Enhanced Share Card Preview */}
          <View style={styles.shareCardContainer}>
            <AppText variant="h3" style={styles.sectionTitle}>
              Share Card
            </AppText>
            <View style={styles.shareCardWrapper}>
              <View
                ref={shareCardRef}
                style={[
                  styles.shareCard,
                  { backgroundColor: colors.card, borderColor: categoryColor },
                ]}
              >
                {/* Card Header */}
                <View
                  style={[
                    styles.cardHeader,
                    { backgroundColor: categoryColor + '10' },
                  ]}
                >
                  <View
                    style={[
                      styles.cardIconContainer,
                      { backgroundColor: categoryColor + '20' },
                    ]}
                  >
                    <Sparkles size={20} color={categoryColor} strokeWidth={2} />
                  </View>
                  <AppText
                    variant="caption"
                    style={[styles.cardBrand, { color: categoryColor }]}
                  >
                    FROLIIK QUEST COMPLETED
                  </AppText>
                </View>

                {/* Quest Info */}
                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: categoryColor + '20' },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={[styles.categoryText, { color: categoryColor }]}
                    >
                      {quest.category.toUpperCase()}
                    </AppText>
                  </View>

                  <AppText
                    variant="h3"
                    style={[styles.cardTitle, { color: colors.text.primary }]}
                  >
                    {quest.title}
                  </AppText>

                  <AppText
                    variant="body"
                    style={[
                      styles.cardDescription,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {quest.description}
                  </AppText>

                  {/* Enhanced Stats */}
                  <View style={styles.cardStats}>
                    <View style={styles.statItem}>
                      <Clock
                        size={14}
                        color={colors.text.muted}
                        strokeWidth={2}
                      />
                      <AppText
                        variant="caption"
                        style={{ color: colors.text.muted }}
                      >
                        {completionTime}
                      </AppText>
                    </View>
                    {quest.location && (
                      <View style={styles.statItem}>
                        <MapPin
                          size={14}
                          color={colors.text.muted}
                          strokeWidth={2}
                        />
                        <AppText
                          variant="caption"
                          style={{ color: colors.text.muted }}
                        >
                          {quest.location}
                        </AppText>
                      </View>
                    )}
                    <View style={styles.statItem}>
                      <Trophy
                        size={14}
                        color={colors.warning}
                        strokeWidth={2}
                      />
                      <AppText
                        variant="caption"
                        style={{ color: colors.warning }}
                      >
                        Level {userLevel}
                      </AppText>
                    </View>
                  </View>

                  {/* Achievements */}
                  {achievements.length > 0 && (
                    <View style={styles.achievements}>
                      {achievements.map((achievement, index) => (
                        <View
                          key={index}
                          style={[
                            styles.achievementBadge,
                            { backgroundColor: colors.warning + '20' },
                          ]}
                        >
                          <AppText
                            variant="caption"
                            style={{ color: colors.warning }}
                          >
                            {achievement}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Personal Comment */}
                  {personalComment && (
                    <View
                      style={[
                        styles.commentSection,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        style={{
                          color: colors.text.secondary,
                          fontStyle: 'italic',
                        }}
                      >
                        "{personalComment}"
                      </AppText>
                    </View>
                  )}
                </View>

                {/* Card Footer */}
                <View
                  style={[styles.cardFooter, { borderTopColor: colors.border }]}
                >
                  <AppText
                    variant="caption"
                    style={{ color: colors.text.muted }}
                  >
                    Join the journey at froliik.app
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          {/* Personal Comment */}
          <View style={styles.commentSection}>
            <AppText variant="h3" style={styles.sectionTitle}>
              Add Personal Comment
            </AppText>
            <Card style={styles.commentCard}>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    color: colors.text.primary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Share what this quest meant to you..."
                placeholderTextColor={colors.text.muted}
                value={personalComment}
                onChangeText={setPersonalComment}
                multiline
                numberOfLines={3}
                maxLength={150}
              />
              <AppText
                variant="caption"
                color="muted"
                style={styles.characterCount}
              >
                {personalComment.length}/150
              </AppText>
            </Card>
          </View>

          {/* Custom Message */}
          <View style={styles.messageSection}>
            <AppText variant="h3" style={styles.sectionTitle}>
              Customize Your Message
            </AppText>
            <Card style={styles.messageCard}>
              <TextInput
                style={[
                  styles.messageInput,
                  {
                    color: colors.text.primary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder={defaultMessage}
                placeholderTextColor={colors.text.muted}
                value={customMessage}
                onChangeText={setCustomMessage}
                multiline
                numberOfLines={4}
                maxLength={280}
              />
              <View style={styles.messageFooter}>
                <AppText variant="caption" color="muted">
                  {(customMessage || defaultMessage).length}/280
                </AppText>
                <Button
                  title="Reset"
                  onPress={() => setCustomMessage('')}
                  variant="ghost"
                  size="sm"
                  style={styles.resetButton}
                />
              </View>
            </Card>
          </View>

          {/* Enhanced Share Options */}
          <View style={styles.shareSection}>
            <AppText variant="h3" style={styles.sectionTitle}>
              Share Options
            </AppText>

            {/* Social Media Buttons */}
            <View style={styles.socialButtons}>
              <Button
                title=""
                onPress={shareToTwitter}
                style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
              >
                <View style={styles.socialButtonContent}>
                  <Twitter size={20} color="white" strokeWidth={2} />
                  <AppText variant="caption" style={styles.socialButtonText}>
                    Twitter
                  </AppText>
                </View>
              </Button>

              <Button
                title=""
                onPress={shareToFacebook}
                style={[styles.socialButton, { backgroundColor: '#4267B2' }]}
              >
                <View style={styles.socialButtonContent}>
                  <Facebook size={20} color="white" strokeWidth={2} />
                  <AppText variant="caption" style={styles.socialButtonText}>
                    Facebook
                  </AppText>
                </View>
              </Button>

              <Button
                title=""
                onPress={shareToLinkedIn}
                style={[styles.socialButton, { backgroundColor: '#0077B5' }]}
              >
                <View style={styles.socialButtonContent}>
                  <Linkedin size={20} color="white" strokeWidth={2} />
                  <AppText variant="caption" style={styles.socialButtonText}>
                    LinkedIn
                  </AppText>
                </View>
              </Button>
            </View>

            <View style={styles.socialButtons}>
              <Button
                title=""
                onPress={shareToInstagram}
                style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
              >
                <View style={styles.socialButtonContent}>
                  <Instagram size={20} color="white" strokeWidth={2} />
                  <AppText variant="caption" style={styles.socialButtonText}>
                    Instagram
                  </AppText>
                </View>
              </Button>

              <Button
                title=""
                onPress={shareToWhatsApp}
                style={[styles.socialButton, { backgroundColor: '#25D366' }]}
              >
                <View style={styles.socialButtonContent}>
                  <MessageCircle size={20} color="white" strokeWidth={2} />
                  <AppText variant="caption" style={styles.socialButtonText}>
                    WhatsApp
                  </AppText>
                </View>
              </Button>

              <Button
                title=""
                onPress={copyDeepLink}
                style={[
                  styles.socialButton,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <View style={styles.socialButtonContent}>
                  <Link size={20} color="white" strokeWidth={2} />
                  <AppText variant="caption" style={styles.socialButtonText}>
                    Deep Link
                  </AppText>
                </View>
              </Button>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title="Share"
                onPress={shareGeneric}
                variant="primary"
                style={styles.actionButton}
              >
                <View style={styles.actionButtonContent}>
                  <Share2
                    size={18}
                    color={colors.text.inverse}
                    strokeWidth={2}
                  />
                  <AppText
                    variant="body"
                    style={{ color: colors.text.inverse }}
                  >
                    Share
                  </AppText>
                </View>
              </Button>

              <Button
                title="Copy"
                onPress={copyToClipboard}
                variant="outline"
                style={styles.actionButton}
              >
                <View style={styles.actionButtonContent}>
                  <Copy size={18} color={colors.text.primary} strokeWidth={2} />
                  <AppText
                    variant="body"
                    style={{ color: colors.text.primary }}
                  >
                    Copy
                  </AppText>
                </View>
              </Button>

              <Button
                title="Download"
                onPress={async () => {
                  const imageUri = await generateShareCard();
                  if (imageUri && (await Sharing.isAvailableAsync())) {
                    await Sharing.shareAsync(imageUri);
                  }
                }}
                variant="outline"
                loading={isGeneratingImage}
                style={styles.actionButton}
              >
                <View style={styles.actionButtonContent}>
                  <Download
                    size={18}
                    color={colors.text.primary}
                    strokeWidth={2}
                  />
                  <AppText
                    variant="body"
                    style={{ color: colors.text.primary }}
                  >
                    Download
                  </AppText>
                </View>
              </Button>
            </View>
          </View>

          {/* Sharing Analytics */}
          {sharingAnalytics.length > 0 && (
            <View style={styles.analyticsSection}>
              <AppText variant="h3" style={styles.sectionTitle}>
                Sharing Activity
              </AppText>
              <Card style={styles.analyticsCard}>
                <View style={styles.analyticsHeader}>
                  <BarChart3 size={20} color={colors.primary} strokeWidth={2} />
                  <AppText variant="body">Recent Shares</AppText>
                </View>
                {sharingAnalytics.slice(-3).map((analytics, index) => (
                  <View key={index} style={styles.analyticsItem}>
                    <AppText
                      variant="caption"
                      style={{ color: colors.text.primary }}
                    >
                      {analytics.platform}
                    </AppText>
                    <AppText variant="caption" color="muted">
                      {new Date(analytics.timestamp).toLocaleTimeString()}
                    </AppText>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: analytics.success
                            ? colors.success
                            : colors.error,
                        },
                      ]}
                    />
                  </View>
                ))}
              </Card>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    minHeight: 'auto',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  shareCardContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  shareCardWrapper: {
    alignItems: 'center',
  },
  shareCard: {
    width: screenWidth * 0.8,
    maxWidth: 320,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBrand: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },
  cardDescription: {
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  cardStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  achievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  achievementBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  commentSection: {
    marginBottom: Spacing.xl,
  },
  commentCard: {
    padding: 0,
  },
  commentInput: {
    padding: Spacing.lg,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 0,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  characterCount: {
    textAlign: 'right',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  cardFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  messageSection: {
    marginBottom: Spacing.xl,
  },
  messageCard: {
    padding: 0,
  },
  messageInput: {
    padding: Spacing.lg,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    borderWidth: 0,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  resetButton: {
    minHeight: 'auto',
    paddingHorizontal: 0,
    paddingVertical: Spacing.xs,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  shareSection: {
    marginBottom: Spacing.xl,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  socialButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: BorderRadius.lg,
  },
  socialButtonContent: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  socialButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  analyticsSection: {
    marginBottom: Spacing.xl,
  },
  analyticsCard: {
    padding: Spacing.lg,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  analyticsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomPadding: {
    height: Spacing.xl,
  },
});
