import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import strings from '../../locales/en.json';
import { signUpWithEmail } from '../../services/auth';
import { userService } from '../../services/api';
import type { UserCreateDto } from '../../models/dto/User.dto';
import {
  AuthContainer,
  AuthCard,
  FormInput,
  PickerInput,
  PrimaryButton,
  SecondaryButton,
  PasswordStrengthIndicator,
} from '../../components/auth';
import { authStyles } from '../../styles/auth.styles';
import { COUNTRY_OPTIONS, UNIT_SYSTEM_OPTIONS, LANGUAGE_OPTIONS } from '../../constants/options';

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  country?: string;
  unitSystem?: string;
  language?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('US');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [language, setLanguage] = useState('en');
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

    // Validate country
    if (!country) {
      newErrors.country = strings.validation.countryRequired;
    }

    // Validate unit system
    if (!unitSystem) {
      newErrors.unitSystem = strings.validation.unitSystemRequired;
    }

    // Validate language
    if (!language) {
      newErrors.language = strings.validation.languageRequired;
    }

    setErrors(newErrors);

    // If no errors, proceed with registration
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      let authUserId: string | null = null;
      
      try {
        console.log('[RegisterPage] Pre-check: Verifying email is not already registered...');
        // PRE-CHECK: Verify email doesn't exist in database before creating Supabase Auth user
        const emailCheck = await userService.checkEmail(email.trim());
        if (emailCheck.exists) {
          throw new Error('EMAIL_EXISTS');
        }
        console.log('[RegisterPage] Email is available');

        console.log('[RegisterPage] Step 1: Creating Supabase Auth user...');
        // Step 1: Create Supabase Auth user
        const result = await signUpWithEmail(email, password, { name: name.trim() });
        console.log('[RegisterPage] Supabase Auth user created:', result.user?.id);
        
        if (!result.user) {
          throw new Error('Failed to create authentication account');
        }

        authUserId = result.user.id; // Store for potential rollback

        console.log('[RegisterPage] Step 2: Creating user record in database...');
        // Step 2: Create user record in database
        const userData: UserCreateDto = {
          authID: result.user.id,  // Link to Supabase Auth user - matches database column
          email: email.trim(),
          name: name.trim(),
          country: country,
          unitSystem: unitSystem,
          language: language,
          onBoardingComplete: false,  // New users haven't completed onboarding yet
        };
        console.log('[RegisterPage] User data to be saved:', { ...userData, authID: userData.authID.substring(0, 8) + '...' });

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
        
        // ROLLBACK: If we created a Supabase Auth user but database creation failed, delete the auth user
        if (authUserId) {
          try {
            console.log('[RegisterPage] Rolling back: Deleting Supabase Auth user...');
            const { supabase } = await import('../services/auth');
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.id === authUserId) {
              // If we're logged in as this user, sign out first
              await supabase.auth.signOut();
            }
            // Note: Supabase Auth user deletion requires admin privileges
            // The orphaned auth user will need to be cleaned up manually or via backend
            console.log('[RegisterPage] Auth user rollback attempted. Manual cleanup may be required.');
          } catch (rollbackError) {
            console.error('[RegisterPage] Rollback failed:', rollbackError);
          }
        }
        
        let errorMessage = error.message || strings.alerts.registrationFailed.messageDefault;
        
        // Provide more specific error messages
        if (error.message === 'EMAIL_EXISTS') {
          errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
        } else if (error.message?.includes('Network Error') || error.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Please make sure the backend server is running.';
        } else if (error.response?.status === 409 || error.response?.status === 400) {
          // Check if it's a duplicate key/email error
          const responseMessage = error.response?.data?.message || '';
          if (responseMessage.includes('duplicate key') || responseMessage.includes('already exists') || responseMessage.includes('User_email_key')) {
            errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
          } else {
            errorMessage = error.response?.data?.message || 'Invalid request. Please check your information.';
          }
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

          <PickerInput
            label={strings.register.countryLabel}
            value={country}
            onValueChange={(value) => {
              setCountry(value);
              if (errors.country) {
                setErrors({ ...errors, country: undefined });
              }
            }}
            items={COUNTRY_OPTIONS}
            error={errors.country}
            disabled={loading}
          />

          <PickerInput
            label={strings.register.unitSystemLabel}
            value={unitSystem}
            onValueChange={(value) => {
              setUnitSystem(value);
              if (errors.unitSystem) {
                setErrors({ ...errors, unitSystem: undefined });
              }
            }}
            items={UNIT_SYSTEM_OPTIONS}
            error={errors.unitSystem}
            disabled={loading}
          />

          <PickerInput
            label={strings.register.languageLabel}
            value={language}
            onValueChange={(value) => {
              setLanguage(value);
              if (errors.language) {
                setErrors({ ...errors, language: undefined });
              }
            }}
            items={LANGUAGE_OPTIONS}
            error={errors.language}
            disabled={loading}
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