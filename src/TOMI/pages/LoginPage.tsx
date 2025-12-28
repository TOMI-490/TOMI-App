import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import strings from '../locales/en.json';
import { signInWithEmail } from '../services/auth';
import {
  AuthContainer,
  AuthCard,
  FormInput,
  PrimaryButton,
  SecondaryButton,
} from '../components/auth';
import { authStyles } from '../styles/auth.styles';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    const newErrors: { email?: string; password?: string } = {};

    // Validate email
    if (!email.trim()) {
      newErrors.email = strings.validation.emailRequired;
    } else if (!validateEmail(email)) {
      newErrors.email = strings.validation.emailInvalid;
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = strings.validation.passwordRequired;
    }

    setErrors(newErrors);

    // If no errors, proceed with login
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        await signInWithEmail(email, password);
        // On success, navigate to main app
        router.replace('/(tabs)');
      } catch (error: any) {
        Alert.alert(
          strings.alerts.loginFailed.title,
          error.message || strings.alerts.loginFailed.messageDefault
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateAccount = () => {
    router.push('/(auth)/register');
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <AuthContainer>
      <AuthCard>
        <View style={authStyles.headerSection}>
          <Text style={authStyles.title}>{strings.login.title}</Text>
        </View>

        <View style={authStyles.formContainer}>
          <FormInput
            label={strings.login.emailLabel}
            placeholder={strings.login.emailPlaceholder}
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
            label={strings.login.passwordLabel}
            placeholder={strings.login.passwordPlaceholder}
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

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={{ alignSelf: 'center', marginBottom: 16 }}
          >
            <Text style={{ color: '#666', fontSize: 14 }}>
              {strings.login.forgotPassword}
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            title={strings.login.primaryButton}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          />
        </View>

        <View style={authStyles.bottomSection}>
          <Text style={authStyles.hintText}>{strings.login.noAccount}</Text>
          <SecondaryButton
            title={strings.login.secondaryButton}
            onPress={handleCreateAccount}
          />
        </View>
      </AuthCard>
    </AuthContainer>
  );
}
