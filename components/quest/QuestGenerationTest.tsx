import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { useQuestGeneration } from '@/hooks/useQuestGeneration';
import { useQuery } from 'convex/react';
import { CheckCircle, Clock, TestTube, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { api } from '../../convex/_generated/api';

export function QuestGenerationTest() {
  const colors = useThemeColors();
  const currentUser = useQuery(api.users.current);
  const {
    generateQuest,
    generateFirstQuest,
    isGenerating,
    formatGenerationTime,
  } = useQuestGeneration();
  const [testResults, setTestResults] = useState<any[]>([]);

  // Get user settings and quest data
  const userSettings = useQuery(
    api.userSettings.getUserSettings,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  );
  const activeQuests = useQuery(
    api.quests.getActiveSideQuests,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  );
  const questGenerationStatus = useQuery(
    api.questGeneration.getQuestGenerationStatus,
    currentUser?._id ? { userId: currentUser._id } : 'skip',
  );

  const addTestResult = (test: string, success: boolean, details?: string) => {
    setTestResults((prev) => [
      ...prev,
      {
        test,
        success,
        details,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const runAllTests = async () => {
    setTestResults([]);

    // Test 1: User Authentication
    if (currentUser?._id) {
      addTestResult('User Authentication', true, `User ID: ${currentUser._id}`);
    } else {
      addTestResult('User Authentication', false, 'No user ID found');
      return;
    }

    // Test 2: Onboarding Status
    if (currentUser?.onboardingCompleted) {
      addTestResult(
        'Onboarding Completed',
        true,
        'User has completed onboarding',
      );
    } else {
      addTestResult(
        'Onboarding Completed',
        false,
        'User has not completed onboarding',
      );
    }

    // Test 3: User Settings
    if (userSettings) {
      addTestResult('User Settings', true, 'User settings loaded successfully');
    } else {
      addTestResult('User Settings', false, 'Failed to load user settings');
    }

    // Test 4: Quest Generation Status
    if (questGenerationStatus) {
      addTestResult(
        'Quest Generation Status',
        true,
        `Can generate: ${questGenerationStatus.canGenerate}, Active quests: ${questGenerationStatus.activeQuestCount}`,
      );
    } else {
      addTestResult(
        'Quest Generation Status',
        false,
        'Failed to get quest generation status',
      );
    }

    // Test 5: Quest Generation
    try {
      const result = await generateQuest({ userId: currentUser._id });
      if (result.success) {
        addTestResult(
          'Quest Generation',
          true,
          `Generated quest ID: ${result.questId}`,
        );
      } else {
        addTestResult(
          'Quest Generation',
          false,
          result.error || 'Unknown error',
        );
      }
    } catch (error) {
      addTestResult(
        'Quest Generation',
        false,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    // Test 6: Active Quests
    if (activeQuests) {
      addTestResult(
        'Active Quests Query',
        true,
        `Found ${activeQuests.length} active quests`,
      );
    } else {
      addTestResult(
        'Active Quests Query',
        false,
        'Failed to query active quests',
      );
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Don't render in production
  if (__DEV__ === false) {
    return null;
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <TestTube size={24} color={colors.warning} />
        </View>
        <View style={styles.titleContainer}>
          <AppText variant="h3">Quest Generation Test</AppText>
          <AppText variant="body" color="secondary">
            Development testing for quest generation system
          </AppText>
        </View>
      </View>

      <View style={styles.controls}>
        <Button
          title={isGenerating ? 'Testing...' : 'Run All Tests'}
          onPress={runAllTests}
          disabled={isGenerating || !currentUser?._id}
          style={styles.testButton}
        />
        <Button
          title="Clear Results"
          onPress={clearResults}
          variant="outline"
          style={styles.clearButton}
        />
      </View>

      {/* Current Status */}
      <View style={styles.statusSection}>
        <AppText variant="h3" style={styles.statusTitle}>
          Current Status:
        </AppText>
        <View style={styles.statusItem}>
          <AppText variant="body" color="secondary">
            User ID: {currentUser?._id ? '✅' : '❌'}{' '}
            {currentUser?._id || 'Not found'}
          </AppText>
        </View>
        <View style={styles.statusItem}>
          <AppText variant="body" color="secondary">
            Onboarding: {currentUser?.onboardingCompleted ? '✅' : '❌'}{' '}
            {currentUser?.onboardingCompleted ? 'Completed' : 'Not completed'}
          </AppText>
        </View>
        <View style={styles.statusItem}>
          <AppText variant="body" color="secondary">
            Auto-Generate:{' '}
            {userSettings?.questPreferences?.autoGenerateQuests ? '✅' : '❌'}{' '}
            {userSettings?.questPreferences?.autoGenerateQuests
              ? 'Enabled'
              : 'Disabled'}
          </AppText>
        </View>
        <View style={styles.statusItem}>
          <AppText variant="body" color="secondary">
            Paused: {userSettings?.questPreferences?.paused ? '✅' : '❌'}{' '}
            {userSettings?.questPreferences?.paused ? 'Yes' : 'No'}
          </AppText>
        </View>
        <View style={styles.statusItem}>
          <AppText variant="body" color="secondary">
            Active Quests: {activeQuests ? activeQuests.length : 'Unknown'}
          </AppText>
        </View>
      </View>

      {/* Test Results */}
      {testResults.length > 0 && (
        <View style={styles.resultsSection}>
          <AppText variant="h3" style={styles.resultsTitle}>
            Test Results:
          </AppText>
          {testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                {result.success ? (
                  <CheckCircle size={16} color={colors.success} />
                ) : (
                  <XCircle size={16} color={colors.error} />
                )}
                <AppText
                  variant="body"
                  style={
                    [
                      styles.resultTest,
                      { color: result.success ? colors.success : colors.error },
                    ] as any
                  }
                >
                  {result.test}
                </AppText>
              </View>
              {result.details && (
                <AppText
                  variant="caption"
                  color="secondary"
                  style={styles.resultDetails}
                >
                  {result.details}
                </AppText>
              )}
              <View style={styles.resultTimestamp}>
                <Clock size={12} color={colors.text.muted} />
                <AppText variant="caption" color="muted">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  testButton: {
    flex: 1,
  },
  clearButton: {
    flex: 1,
  },
  statusSection: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  statusTitle: {
    marginBottom: Spacing.sm,
  },
  statusItem: {
    marginBottom: Spacing.xs,
  },
  resultsSection: {
    gap: Spacing.sm,
  },
  resultsTitle: {
    marginBottom: Spacing.sm,
  },
  resultItem: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 6,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  resultTest: {
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  resultDetails: {
    marginBottom: Spacing.xs,
  },
  resultTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
