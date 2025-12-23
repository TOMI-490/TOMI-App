import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import strings from '../locales/en.json';
import { signUpWithEmail } from '../services/auth';
import {
  AuthContainer,
  AuthCard,
  FormInput,
  PrimaryButton,
  SecondaryButton,
  PasswordStrengthIndicator,
} from '../components/auth';
import { authStyles } from '../styles/auth.styles';

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    const newErrors: ValidationErrors = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = strings.validation.nameRequired;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = strings.validation.emailRequired;
    } else if (!validateEmail(email)) {
      newErrors.email = strings.validation.emailInvalid;
    }

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

    // If no errors, proceed with registration
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        await signUpWithEmail(email, password);
        // On success, show confirmation and navigate
        Alert.alert(
          'Success!',
          'Your account has been created successfully. Please check your email to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } catch (error: any) {
        Alert.alert(
          'Registration Failed',
          error.message || 'Unable to create account. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoToLogin = () => {
    router.back();
  };

  return (
    <AuthContainer>
      <AuthCard>
        <View style={authStyles.headerSection}>
          <Text style={authStyles.title}>{strings.register.title}</Text>
          <Text style={authStyles.subtitle}>{strings.register.subtitle}</Text>
        </View>

        <View style={authStyles.formContainer}>
          <FormInput
            label={strings.register.nameLabel}
            placeholder={strings.register.namePlaceholder}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            error={errors.name}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!loading}
          />

          <FormInput
            label={strings.register.emailLabel}
            placeholder={strings.register.emailPlaceholder}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <FormInput
            label={strings.register.passwordLabel}
            placeholder={strings.register.passwordPlaceholder}
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
            label={strings.register.confirmPasswordLabel}
            placeholder={strings.register.confirmPasswordPlaceholder}
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
            title={strings.register.primaryButton}
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
          />
        </View>

        <View style={authStyles.bottomSection}>
          <Text style={authStyles.hintText}>{strings.register.haveAccount}</Text>
          <SecondaryButton
            title={strings.register.secondaryButton}
            onPress={handleGoToLogin}
          />
        </View>
      </AuthCard>
    </AuthContainer>
  );
}
