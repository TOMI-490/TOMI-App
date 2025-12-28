import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import strings from '../locales/en.json';
import { resetPasswordForEmail } from '../services/auth';
import {
  AuthContainer,
  AuthCard,
  FormInput,
  PrimaryButton,
  SecondaryButton,
} from '../components/auth';
import { authStyles } from '../styles/auth.styles';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetLink = async () => {
    // Validate email
    if (!email.trim()) {
      setError(strings.validation.emailRequired);
      return;
    }
    
    if (!validateEmail(email)) {
      setError(strings.validation.emailInvalid);
      return;
    }

    setLoading(true);
    try {
      await resetPasswordForEmail(email.trim());
      Alert.alert(
        strings.alerts.resetEmailSent.title,
        strings.alerts.resetEmailSent.message,
        [
          {
            text: strings.alerts.resetEmailSent.button,
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        strings.alerts.resetEmailFailed.title,
        error.message || strings.alerts.resetEmailFailed.messageDefault
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <AuthContainer>
      <AuthCard>
        <View style={authStyles.headerSection}>
          <Text style={authStyles.title}>{strings.forgotPassword.title}</Text>
          <Text style={authStyles.subtitle}>{strings.forgotPassword.subtitle}</Text>
        </View>

        <View style={authStyles.formContainer}>
          <FormInput
            label={strings.forgotPassword.emailLabel}
            placeholder={strings.forgotPassword.emailPlaceholder}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) {
                setError('');
              }
            }}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <PrimaryButton
            title={strings.forgotPassword.primaryButton}
            onPress={handleSendResetLink}
            loading={loading}
            disabled={loading}
          />
        </View>

        <View style={authStyles.bottomSection}>
          <SecondaryButton
            title={strings.forgotPassword.backToLogin}
            onPress={handleBackToLogin}
          />
        </View>
      </AuthCard>
    </AuthContainer>
  );
}
