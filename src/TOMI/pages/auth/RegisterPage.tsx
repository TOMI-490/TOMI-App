import React, { useState, useMemo } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { createAuthStyles } from '../../styles/auth.styles';
import { createAuthScreenShellStyles } from '../../styles/authScreenShell.styles';
import { COUNTRY_OPTIONS, UNIT_SYSTEM_OPTIONS, LANGUAGE_OPTIONS } from '../../constants/options';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { colors: T } = useTheme();
  const authStyles = useMemo(() => createAuthStyles(T), [T]);
  const shell = useMemo(() => createAuthScreenShellStyles(T), [T]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('US');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [language, setLanguage] = useState('en');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleRegister = async () => {
    const newErrors: ValidationErrors = {};

    if (!name.trim()) {
      newErrors.name = strings.validation.nameRequired;
    }

    if (!email.trim()) {
      newErrors.email = strings.validation.emailRequired;
    } else if (!validateEmail(email)) {
      newErrors.email = strings.validation.emailInvalid;
    }

    if (!password.trim()) {
      newErrors.password = strings.validation.passwordRequired;
    } else if (password.length < 6) {
      newErrors.password = strings.validation.passwordTooShort;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = strings.validation.confirmPasswordRequired;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = strings.validation.passwordsDoNotMatch;
    }

    if (!country) {
      newErrors.country = strings.validation.countryRequired;
    }

    if (!unitSystem) {
      newErrors.unitSystem = strings.validation.unitSystemRequired;
    }

    if (!language) {
      newErrors.language = strings.validation.languageRequired;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      let authUserId: string | null = null;

      try {
        const emailCheck = await userService.checkEmail(email.trim());
        if (emailCheck.exists) {
          throw new Error('EMAIL_EXISTS');
        }

        const result = await signUpWithEmail(email, password, { name: name.trim() });

        if (!result.user) {
          throw new Error('Failed to create authentication account');
        }

        authUserId = result.user.id;

        const userData: UserCreateDto = {
          authID: result.user.id,
          email: email.trim(),
          name: name.trim(),
          country: country,
          unitSystem: unitSystem,
          language: language,
          onBoardingComplete: false,
        };

        await userService.create(userData);

        if (result.user && !result.session) {
          Alert.alert(
            strings.alerts.verifyEmail.title,
            strings.alerts.verifyEmail.message,
            [{ text: strings.alerts.verifyEmail.button, onPress: () => router.back() }]
          );
        } else {
          Alert.alert(
            strings.alerts.registrationSuccess.title,
            strings.alerts.registrationSuccess.message,
            [{ text: strings.alerts.registrationSuccess.button, onPress: () => router.replace('/(tabs)') }]
          );
        }
      } catch (error: any) {
      if (authUserId) {
          try {
            const { supabase } = await import('../../services/auth');
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.id === authUserId) {
              await supabase.auth.signOut();
            }
          } catch {
            /* ignore */
          }
        }

        let errorMessage = error.message || strings.alerts.registrationFailed.messageDefault;

        if (error.message === 'EMAIL_EXISTS') {
          errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
        } else if (error.message?.includes('Network Error') || error.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Please make sure the backend server is running.';
        } else if (error.response?.status === 409 || error.response?.status === 400) {
          const responseMessage = error.response?.data?.message || '';
          if (
            responseMessage.includes('duplicate key') ||
            responseMessage.includes('already exists') ||
            responseMessage.includes('User_email_key')
          ) {
            errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
          } else {
            errorMessage = error.response?.data?.message || 'Invalid request. Please check your information.';
          }
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        Alert.alert(strings.alerts.registrationFailed.title, errorMessage);
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
      <View style={shell.pageWrap}>
        <View style={shell.cardStack}>
          <View style={shell.floatOrb1} pointerEvents="none" />
          <View style={shell.floatOrb2} pointerEvents="none" />
          <View style={shell.floatOrb3} pointerEvents="none" />

          <View style={shell.cardElevated}>
            <AuthCard>
              <View style={shell.heroCompact}>
                <View style={shell.companionPill}>
                  <MaterialCommunityIcons name="heart-pulse" size={14} color={T.success} style={{ marginRight: 6 }} />
                  <Text style={shell.companionPillText}>{strings.register.companionBadge}</Text>
                </View>

                <Text style={shell.titleRegister}>{strings.register.title}</Text>
                <Text style={shell.subtitle}>{strings.register.welcomeSubtitle}</Text>
                <View style={shell.accentBar} />
              </View>

              <View style={shell.formBlock}>
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

              <View style={authStyles.footerDivider} />

              <View style={authStyles.bottomSection}>
                <Text style={authStyles.hintText}>{strings.register.haveAccount}</Text>
                <SecondaryButton title={strings.register.secondaryButton} onPress={handleGoToLogin} />
              </View>
            </AuthCard>
          </View>
        </View>
      </View>
    </AuthContainer>
  );
}
