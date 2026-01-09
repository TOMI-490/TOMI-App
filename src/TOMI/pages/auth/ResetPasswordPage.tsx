import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import strings from '../../locales/en.json';
import { updatePassword } from '../../services/auth';
import {
  AuthContainer,
  AuthCard,
  FormInput,
  PrimaryButton,
  SecondaryButton,
  PasswordStrengthIndicator,
} from '../../components/auth';
import { authStyles } from '../../styles/auth.styles';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    // Validate password
    if (!password.trim()) {
      newErrors.password = strings.validation.passwordRequired;
    } else if (password.length < 6) {
      newErrors.password = strings.validation.passwordTooShort;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = strings.validation.confirmPasswordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = strings.validation.passwordsDoNotMatch;
    }

    setErrors(newErrors);

    // If no errors, proceed with password reset
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        await updatePassword(password);
        Alert.alert(
          strings.alerts.passwordResetSuccess.title,
          strings.alerts.passwordResetSuccess.message,
          [
            {
              text: strings.alerts.passwordResetSuccess.button,
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      } catch (error: any) {
        Alert.alert(
          strings.alerts.passwordResetFailed.title,
          error.message || strings.alerts.passwordResetFailed.messageDefault
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <AuthContainer>
      <AuthCard>
        <View style={authStyles.headerSection}>
          <Text style={authStyles.title}>{strings.resetPassword.title}</Text>
          <Text style={authStyles.subtitle}>{strings.resetPassword.subtitle}</Text>
        </View>

        <View style={authStyles.formContainer}>
          <FormInput
            label={strings.resetPassword.passwordLabel}
            placeholder={strings.resetPassword.passwordPlaceholder}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <PasswordStrengthIndicator password={password} />

          <FormInput
            label={strings.resetPassword.confirmPasswordLabel}
            placeholder={strings.resetPassword.confirmPasswordPlaceholder}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: undefined });
              }
            }}
            error={errors.confirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <PrimaryButton
            title={strings.resetPassword.primaryButton}
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
          />
        </View>

        <View style={authStyles.bottomSection}>
          <SecondaryButton
            title={strings.resetPassword.backToLogin}
            onPress={handleBackToLogin}
          />
        </View>
      </AuthCard>
    </AuthContainer>
  );
}
