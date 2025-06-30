import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AppText } from '@/components/ui/Typography';
import { BorderRadius, Spacing } from '@/constants/colors';
import { useAlert } from '@/hooks/useAlert';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useMutation, useQuery } from 'convex/react';
import { MapPin, Plus, Trophy, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../convex/_generated/api';

interface AddQuestModalProps {
  visible: boolean;
  onClose: () => void;
}

interface CreateQuestData {
  title: string;
  description?: string;
  difficulty_level: 'gentle' | 'moderate' | 'adventurous';
  location?: string;
  quest_giver?: string;
  reward?: string;
}

const difficultyOptions = [
  { value: 'gentle', label: 'Gentle', description: 'Easy and comfortable' },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Some challenge involved',
  },
  {
    value: 'adventurous',
    label: 'Adventurous',
    description: 'Bold and exciting',
  },
] as const;

export function AddQuestModal({ visible, onClose }: AddQuestModalProps) {
  const colors = useThemeColors();
  const { alertState, showError, showSuccess } = useAlert();
  const currentUser = useQuery(api.users.current);
  const createQuest = useMutation(api.quests.createSideQuest);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateQuestData>({
    title: '',
    description: '',
    difficulty_level: 'moderate',
    location: '',
    quest_giver: '',
    reward: '',
  });

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!currentUser?._id) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createQuest({
        userId: currentUser._id as any,
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Reset form
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Error creating quest:', err);
      setError('Failed to create quest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
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
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Plus size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <View>
                <AppText variant="h3">Create New Quest</AppText>
                <AppText variant="caption" color="muted">
                  Add a personal side quest
                </AppText>
              </View>
            </View>
            <Button
              title=""
              onPress={handleClose}
              variant="ghost"
              style={styles.closeButton}
            >
              <X size={24} color={colors.text.primary} />
            </Button>
          </View>

          {/* Form */}
          <Card style={styles.formCard}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <AppText variant="h3" style={styles.inputLabel}>
                Quest Title *
              </AppText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text.primary,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Enter your quest title"
                placeholderTextColor={colors.text.muted}
                value={title}
                onChangeText={setTitle}
                autoCapitalize="words"
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <AppText variant="h3" style={styles.inputLabel}>
                Description (Optional)
              </AppText>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    color: colors.text.primary,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Enter quest description"
                placeholderTextColor={colors.text.muted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {error ? <ErrorMessage message={error} /> : null}

            {/* Difficulty Level */}
            <View style={styles.inputGroup}>
              <AppText variant="h3" style={styles.inputLabel}>
                Difficulty Level
              </AppText>
              <View style={styles.difficultyOptions}>
                {difficultyOptions.map((option) => (
                  <Button
                    key={option.value}
                    title=""
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        difficulty_level: option.value,
                      }))
                    }
                    variant="ghost"
                    style={
                      [
                        styles.difficultyOption,
                        { borderColor: colors.border },
                        formData.difficulty_level === option.value && {
                          backgroundColor: colors.primary + '20',
                          borderColor: colors.primary,
                        },
                      ] as any
                    }
                  >
                    <View style={styles.difficultyContent}>
                      <AppText
                        variant="body"
                        style={
                          [
                            styles.difficultyLabel,
                            {
                              color:
                                formData.difficulty_level === option.value
                                  ? colors.primary
                                  : colors.text.primary,
                            },
                          ] as any
                        }
                      >
                        {option.label}
                      </AppText>
                      <AppText
                        variant="caption"
                        style={
                          [
                            styles.difficultyDescription,
                            {
                              color:
                                formData.difficulty_level === option.value
                                  ? colors.primary
                                  : colors.text.muted,
                            },
                          ] as any
                        }
                      >
                        {option.description}
                      </AppText>
                    </View>
                  </Button>
                ))}
              </View>
            </View>

            {/* Optional Fields */}
            <View style={styles.optionalSection}>
              <AppText
                variant="h3"
                style={
                  [styles.sectionTitle, { color: colors.text.secondary }] as any
                }
              >
                Optional Details
              </AppText>

              {/* Location */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelWithIcon}>
                  <MapPin size={16} color={colors.text.muted} strokeWidth={2} />
                  <AppText variant="body" style={styles.inputLabel}>
                    Location
                  </AppText>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text.primary,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Where will this quest take place?"
                  placeholderTextColor={colors.text.muted}
                  value={formData.location}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, location: text }))
                  }
                  maxLength={100}
                />
              </View>

              {/* Quest Giver */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelWithIcon}>
                  <User size={16} color={colors.text.muted} strokeWidth={2} />
                  <AppText variant="body" style={styles.inputLabel}>
                    Quest Giver
                  </AppText>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text.primary,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Who or what inspired this quest?"
                  placeholderTextColor={colors.text.muted}
                  value={formData.quest_giver}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, quest_giver: text }))
                  }
                  maxLength={100}
                />
              </View>

              {/* Reward */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelWithIcon}>
                  <Trophy size={16} color={colors.text.muted} strokeWidth={2} />
                  <AppText variant="body" style={styles.inputLabel}>
                    Reward
                  </AppText>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text.primary,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="How will you celebrate completion?"
                  placeholderTextColor={colors.text.muted}
                  value={formData.reward}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, reward: text }))
                  }
                  maxLength={200}
                />
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title={isLoading ? 'Creating...' : 'Create Quest'}
              onPress={handleSubmit}
              disabled={isLoading || !title.trim()}
              style={styles.actionButton}
            />
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>

      {/* Custom Alert Component */}
      <Alert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        onConfirm={alertState.onConfirm}
        onCancel={alertState.onCancel}
        onDismiss={alertState.onCancel}
        showCancel={alertState.showCancel}
        destructive={alertState.destructive}
      />
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
  formCard: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    marginBottom: Spacing.sm,
  },
  inputLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 48,
  },
  textArea: {
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 100,
  },
  difficultyOptions: {
    gap: Spacing.sm,
  },
  difficultyOption: {
    minHeight: 'auto',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  difficultyContent: {
    alignItems: 'center',
    width: '100%',
  },
  difficultyLabel: {
    marginBottom: Spacing.xs,
    fontFamily: 'Inter-SemiBold',
  },
  difficultyDescription: {
    textAlign: 'center',
  },
  optionalSection: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
  bottomPadding: {
    height: Spacing.xl,
  },
});
