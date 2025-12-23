import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import strings from '../locales/en.json';
import { signUpWithEmail } from '../services/auth';
import { userService } from '../services/api';
import type { UserCreateDto } from '../models/dto/User.dto';
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
    console.log('[RegisterPage] Starting registration process...');
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
        console.log('[RegisterPage] Step 1: Creating Supabase Auth user...');
        // Step 1: Create Supabase Auth user
        const result = await signUpWithEmail(email, password, { name: name.trim() });
        console.log('[RegisterPage] Supabase Auth user created:', result.user?.id);
        
        if (!result.user) {
          throw new Error('Failed to create authentication account');
        }

        console.log('[RegisterPage] Step 2: Creating user record in database...');
        // Step 2: Create user record in database
        const userData: UserCreateDto = {
          authUid: result.user.id,  // Link to Supabase Auth user
          email: email.trim(),
          name: name.trim(),
          country: 'US', // Default value - should be updated with actual user input
          unitSystem: 'metric', // Default value - should be updated with actual user input
          language: 'en', // Default value - should be updated with actual user input
        };
        console.log('[RegisterPage] User data to be saved:', { ...userData, authUid: userData.authUid.substring(0, 8) + '...' });

        const createdUser = await userService.create(userData);
        console.log('[RegisterPage] User created in database:', createdUser.userId);
        
        // Check if email confirmation is required
        if (result.user && !result.session) {
          console.log('[RegisterPage] Email confirmation required');
          // Email confirmation required
          Alert.alert(
            strings.alerts.verifyEmail.title,
            strings.alerts.verifyEmail.message,
            [{ text: strings.alerts.verifyEmail.button, onPress: () => router.back() }]
          );
        } else {
          console.log('[RegisterPage] Registration successful, auto-signed in');
          // Auto-signed in (confirmation disabled)
          Alert.alert(
            strings.alerts.registrationSuccess.title,
            strings.alerts.registrationSuccess.message,
            [{ text: strings.alerts.registrationSuccess.button, onPress: () => router.replace('/(tabs)') }]
          );
        }
      } catch (error: any) {
        console.error('[RegisterPage] Registration failed:', error);
        console.error('[RegisterPage] Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        let errorMessage = error.message || strings.alerts.registrationFailed.messageDefault;
        
        // Provide more specific error messages
        if (error.message?.includes('Network Error') || error.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Please make sure the backend server is running.';
        } else if (error.response?.status === 409) {
          errorMessage = 'An account with this email already exists.';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        Alert.alert(
          strings.alerts.registrationFailed.title,
          errorMessage
        );
      } finally {
        setLoading(false);
        console.log('[RegisterPage] Registration process completed');
      }
    } else {
      console.log('[RegisterPage] Validation errors:', newErrors);
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