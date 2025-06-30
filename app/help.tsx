import { useAlert } from '@/components/ui/AlertProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Typography';
import { Spacing } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CircleHelp as HelpCircle,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FAQItem {
  question: string;
  answer: string;
}

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'bug' | 'feature' | 'general' | 'account';
}

const faqData: FAQItem[] = [
  {
    question: 'How do I start a new quest?',
    answer:
      'You can start a new quest by tapping on any available quest card on the home page or explore tab. Each quest will guide you through the steps to complete it.',
  },
  {
    question: 'What are achievements and how do I earn them?',
    answer:
      'Achievements are special rewards you earn by completing quests and maintaining streaks. Check your Progress tab to see all available achievements and your progress.',
  },
  {
    question: 'How do I change my notification preferences?',
    answer:
      'Go to your Profile page and tap on the Notifications card. You can enable/disable different types of notifications and adjust the frequency.',
  },
  {
    question: 'Can I delete my account?',
    answer:
      'Yes, you can delete your account from the Profile page. This action is permanent and will remove all your data including quest history and achievements.',
  },
  {
    question: 'How do quests work?',
    answer:
      'Quests are daily challenges designed to help you grow and improve. Complete them to earn points, maintain streaks, and unlock achievements.',
  },
  {
    question: 'What if I miss a day?',
    answer:
      "Don't worry! You can always start fresh. While you'll lose your current streak, you can start a new one by completing quests consistently.",
  },
];

const categoryOptions = [
  {
    value: 'bug',
    label: 'Bug Report',
    description: 'Report an issue or problem',
  },
  {
    value: 'feature',
    label: 'Feature Request',
    description: 'Suggest a new feature',
  },
  {
    value: 'general',
    label: 'General Question',
    description: 'Ask a general question',
  },
  {
    value: 'account',
    label: 'Account Issue',
    description: 'Help with account problems',
  },
];

export default function HelpScreen() {
  const colors = useThemeColors();
  const { showSuccess, showError } = useAlert();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general',
  });

  const handleBack = () => {
    router.back();
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleContactSubmit = async () => {
    if (
      !contactForm.name.trim() ||
      !contactForm.email.trim() ||
      !contactForm.message.trim()
    ) {
      showError('Error', 'Please fill in all required fields');
      return;
    }

    if (!contactForm.email.includes('@')) {
      showError('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement actual contact form submission
      // This could send to your backend, email service, or support system
      console.log('Contact form submitted:', contactForm);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showSuccess(
        'Message Sent',
        "Thank you for contacting us! We'll get back to you within 24 hours."
      );

      // Reset form
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general',
      });
    } catch (error) {
      showError('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateContactForm = (field: keyof ContactForm, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <HelpCircle size={24} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.headerText}>
            <AppText variant="h2">Help & Support</AppText>
            <AppText variant="caption" color="muted">
              Get help and contact our team
            </AppText>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'faq' && { backgroundColor: colors.primary + '20' },
          ]}
          onPress={() => setActiveTab('faq')}
        >
          <MessageCircle
            size={20}
            color={activeTab === 'faq' ? colors.primary : colors.text.secondary}
            strokeWidth={2}
          />
          <AppText
            variant="body"
            style={
              [
                styles.tabText,
                {
                  color:
                    activeTab === 'faq'
                      ? colors.primary
                      : colors.text.secondary,
                },
              ] as any
            }
          >
            FAQ
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'contact' && {
              backgroundColor: colors.primary + '20',
            },
          ]}
          onPress={() => setActiveTab('contact')}
        >
          <Mail
            size={20}
            color={
              activeTab === 'contact' ? colors.primary : colors.text.secondary
            }
            strokeWidth={2}
          />
          <AppText
            variant="body"
            style={
              [
                styles.tabText,
                {
                  color:
                    activeTab === 'contact'
                      ? colors.primary
                      : colors.text.secondary,
                },
              ] as any
            }
          >
            Contact
          </AppText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'faq' ? (
          <View style={styles.faqContainer}>
            <AppText variant="h3" style={styles.sectionTitle}>
              Frequently Asked Questions
            </AppText>
            {faqData.map((faq, index) => (
              <Card key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(index)}
                  activeOpacity={0.7}
                >
                  <AppText variant="body" style={styles.faqQuestionText}>
                    {faq.question}
                  </AppText>
                  {expandedFAQ === index ? (
                    <ChevronDown
                      size={20}
                      color={colors.text.secondary}
                      strokeWidth={2}
                    />
                  ) : (
                    <ChevronRight
                      size={20}
                      color={colors.text.secondary}
                      strokeWidth={2}
                    />
                  )}
                </TouchableOpacity>
                {expandedFAQ === index && (
                  <View style={styles.faqAnswer}>
                    <AppText variant="body" color="secondary">
                      {faq.answer}
                    </AppText>
                  </View>
                )}
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.contactContainer}>
            <AppText variant="h3" style={styles.sectionTitle}>
              Contact Us
            </AppText>
            <AppText
              variant="body"
              color="secondary"
              style={styles.contactDescription}
            >
              Have a question or need help? Send us a message and we'll get back
              to you as soon as possible.
            </AppText>

            <Card style={styles.contactForm}>
              {/* Category Selection */}
              <View style={styles.formSection}>
                <AppText variant="body" style={styles.formLabel}>
                  Category *
                </AppText>
                <View style={styles.categoryOptions}>
                  {categoryOptions.map((category) => (
                    <TouchableOpacity
                      key={category.value}
                      style={[
                        styles.categoryOption,
                        { borderColor: colors.border },
                        contactForm.category === category.value && {
                          backgroundColor: colors.primary + '20',
                          borderColor: colors.primary,
                        },
                      ]}
                      onPress={() =>
                        updateContactForm('category', category.value)
                      }
                    >
                      <AppText
                        variant="body"
                        style={
                          [
                            styles.categoryLabel,
                            {
                              color:
                                contactForm.category === category.value
                                  ? colors.primary
                                  : colors.text.primary,
                            },
                          ] as any
                        }
                      >
                        {category.label}
                      </AppText>
                      <AppText
                        variant="caption"
                        style={
                          [
                            styles.categoryDescription,
                            {
                              color:
                                contactForm.category === category.value
                                  ? colors.primary
                                  : colors.text.muted,
                            },
                          ] as any
                        }
                      >
                        {category.description}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Name */}
              <View style={styles.formSection}>
                <AppText variant="body" style={styles.formLabel}>
                  Name *
                </AppText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: colors.border,
                      color: colors.text.primary,
                      backgroundColor: colors.background,
                    },
                  ]}
                  placeholder="Your name"
                  placeholderTextColor={colors.text.muted}
                  value={contactForm.name}
                  onChangeText={(text) => updateContactForm('name', text)}
                />
              </View>

              {/* Email */}
              <View style={styles.formSection}>
                <AppText variant="body" style={styles.formLabel}>
                  Email *
                </AppText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: colors.border,
                      color: colors.text.primary,
                      backgroundColor: colors.background,
                    },
                  ]}
                  placeholder="your.email@example.com"
                  placeholderTextColor={colors.text.muted}
                  value={contactForm.email}
                  onChangeText={(text) => updateContactForm('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Subject */}
              <View style={styles.formSection}>
                <AppText variant="body" style={styles.formLabel}>
                  Subject
                </AppText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      borderColor: colors.border,
                      color: colors.text.primary,
                      backgroundColor: colors.background,
                    },
                  ]}
                  placeholder="Brief description of your issue"
                  placeholderTextColor={colors.text.muted}
                  value={contactForm.subject}
                  onChangeText={(text) => updateContactForm('subject', text)}
                />
              </View>

              {/* Message */}
              <View style={styles.formSection}>
                <AppText variant="body" style={styles.formLabel}>
                  Message *
                </AppText>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      borderColor: colors.border,
                      color: colors.text.primary,
                      backgroundColor: colors.background,
                    },
                  ]}
                  placeholder="Please describe your issue or question in detail..."
                  placeholderTextColor={colors.text.muted}
                  value={contactForm.message}
                  onChangeText={(text) => updateContactForm('message', text)}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              {/* Submit Button */}
              <Button
                title={isSubmitting ? 'Sending...' : 'Send Message'}
                onPress={handleContactSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.submitButton}
              >
                {!isSubmitting && (
                  <View style={styles.submitButtonContent}>
                    <Send size={18} color="white" strokeWidth={2} />
                    <AppText variant="body" style={styles.submitButtonText}>
                      Send Message
                    </AppText>
                  </View>
                )}
              </Button>
            </Card>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    gap: Spacing.xs,
  },
  tabText: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  faqContainer: {
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  faqCard: {
    marginBottom: Spacing.sm,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  faqQuestionText: {
    flex: 1,
    marginRight: Spacing.md,
    fontWeight: '600',
  },
  faqAnswer: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  contactContainer: {
    gap: Spacing.lg,
  },
  contactDescription: {
    marginBottom: Spacing.lg,
  },
  contactForm: {
    gap: Spacing.lg,
  },
  formSection: {
    gap: Spacing.sm,
  },
  formLabel: {
    fontWeight: '600',
  },
  categoryOptions: {
    gap: Spacing.sm,
  },
  categoryOption: {
    padding: Spacing.md,
    borderWidth: 2,
    borderRadius: 12,
  },
  categoryLabel: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  categoryDescription: {
    fontSize: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  bottomPadding: {
    height: Spacing.xl,
  },
});
