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
  Clock,
  Copy,
  Download,
  Facebook,
  Instagram,
  MapPin,
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
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

const { width: screenWidth } = Dimensions.get('window');

interface QuestShareModalProps {
  visible: boolean;
  onClose: () => void;
  quest: Quest;
  completionTime?: string;
  achievements?: string[];
}

export function QuestShareModal({
  visible,
  onClose,
  quest,
  completionTime = '15 min',
  achievements = [],
}: QuestShareModalProps) {
  const colors = useThemeColors();
  const { showError, showSuccess, showInfo } = useAlert();
  const [customMessage, setCustomMessage] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
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

  const defaultMessage = `Just completed "${
    quest.title
  }" on Froliik! 🎉 Another step forward in my growth journey. #FroliikQuest #PersonalGrowth #${
    quest.category.charAt(0).toUpperCase() + quest.category.slice(1)
  }`;

  const shareMessage = customMessage || defaultMessage;

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
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareMessage,
    )}&url=${encodeURIComponent('https://froliik.app')}`;

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync('', {
          dialogTitle: 'Share to Twitter',
        });
      } else {
        // Fallback for web
        window.open(twitterUrl, '_blank');
      }
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      await showError('Error', 'Failed to share to Twitter');
    }
  };

  const shareToFacebook = async () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      'https://froliik.app',
    )}&quote=${encodeURIComponent(shareMessage)}`;

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync('', {
          dialogTitle: 'Share to Facebook',
        });
      } else {
        // Fallback for web
        window.open(facebookUrl, '_blank');
      }
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      await showError('Error', 'Failed to share to Facebook');
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
      } else {
        await showInfo(
          'Instagram Sharing',
          'Instagram sharing is not available on this platform',
        );
      }
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      await showError('Error', 'Failed to share to Instagram');
    }
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(shareMessage);
      await showSuccess('Copied!', 'Share message copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      await showError('Error', 'Failed to copy to clipboard');
    }
  };

  const downloadShareCard = async () => {
    try {
      const imageUri = await generateShareCard();
      if (!imageUri) return;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUri, {
          dialogTitle: 'Save Share Card',
        });
      } else {
        await showSuccess('Download', 'Share card generated successfully');
      }
    } catch (error) {
      console.error('Error downloading share card:', error);
      await showError('Error', 'Failed to download share card');
    }
  };

  const shareGeneric = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareMessage, {
          dialogTitle: 'Share Quest Completion',
        });
      } else {
        // Fallback for web
        if (navigator.share) {
          await navigator.share({
            title: 'Quest Completed!',
            text: shareMessage,
            url: 'https://froliik.app',
          });
        } else {
          await copyToClipboard();
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
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

          {/* Share Card Preview */}
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
                    style={[styles.cardBrand, { color: categoryColor }] as any}
                  >
                    FROLIIK QUEST
                  </AppText>
                </View>

                {/* Quest Info */}
                <View style={styles.cardContent}>
                  <View
                    style={
                      [
                        styles.categoryBadge,
                        { backgroundColor: categoryColor + '20' },
                      ] as any
                    }
                  >
                    <AppText
                      variant="caption"
                      style={
                        [styles.categoryText, { color: categoryColor }] as any
                      }
                    >
                      {quest.category.toUpperCase()}
                    </AppText>
                  </View>

                  <AppText
                    variant="h3"
                    style={
                      [styles.cardTitle, { color: colors.text.primary }] as any
                    }
                  >
                    {quest.title}
                  </AppText>

                  <AppText
                    variant="body"
                    style={
                      [
                        styles.cardDescription,
                        { color: colors.text.secondary },
                      ] as any
                    }
                  >
                    {quest.description}
                  </AppText>

                  {/* Stats */}
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
                  </View>

                  {/* Achievements */}
                  {achievements.length > 0 && (
                    <View style={styles.achievements}>
                      {achievements.map((achievement, index) => (
                        <View
                          key={index}
                          style={
                            [
                              styles.achievementBadge,
                              { backgroundColor: colors.warning + '20' },
                            ] as any
                          }
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
                </View>

                {/* Card Footer */}
                <View
                  style={
                    [
                      styles.cardFooter,
                      { borderTopColor: colors.border },
                    ] as any
                  }
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

          {/* Custom Message */}
          <View style={styles.messageSection}>
            <AppText variant="h3" style={styles.sectionTitle}>
              Customize Your Message
            </AppText>
            <Card style={styles.messageCard}>
              <TextInput
                style={
                  [
                    styles.messageInput,
                    {
                      color: colors.text.primary,
                      borderColor: colors.border,
                    },
                  ] as any
                }
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

          {/* Share Options */}
          <View style={styles.shareSection}>
            <AppText variant="h3" style={styles.sectionTitle}>
              Share Options
            </AppText>

            {/* Social Media Buttons */}
            <View style={styles.socialButtons}>
              <Button
                title=""
                onPress={shareToTwitter}
                style={
                  [styles.socialButton, { backgroundColor: '#1DA1F2' }] as any
                }
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
                style={
                  [styles.socialButton, { backgroundColor: '#4267B2' }] as any
                }
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
                onPress={shareToInstagram}
                style={
                  [styles.socialButton, { backgroundColor: '#E4405F' }] as any
                }
              >
                <View style={styles.socialButtonContent}>
                  <Instagram size={20} color="white" strokeWidth={2} />
                  <AppText variant="caption" style={styles.socialButtonText}>
                    Instagram
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
                onPress={downloadShareCard}
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
  },
  achievementBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
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
    marginBottom: Spacing.lg,
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
  bottomPadding: {
    height: Spacing.xl,
  },
});
