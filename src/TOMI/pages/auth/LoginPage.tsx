import React, { useState, useMemo } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import strings from '../../locales/en.json';
import { signInWithEmail } from '../../services/auth';
import {
  AuthContainer,
  AuthCard,
  FormInput,
  PrimaryButton,
  SecondaryButton,
} from '../../components/auth';
import { createAuthStyles } from '../../styles/auth.styles';
import { createAuthScreenShellStyles } from '../../styles/authScreenShell.styles';
import { createLoginPageStyles } from '../../styles/loginPage.styles';
import { useTheme } from '../../contexts/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const { colors: T } = useTheme();
  const authStyles = useMemo(() => createAuthStyles(T), [T]);
  const shell = useMemo(() => createAuthScreenShellStyles(T), [T]);
  const L = useMemo(() => createLoginPageStyles(T), [T]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleLogin = async () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = strings.validation.emailRequired;
    } else if (!validateEmail(email)) {
      newErrors.email = strings.validation.emailInvalid;
    }

    if (!password.trim()) {
      newErrors.password = strings.validation.passwordRequired;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        await signInWithEmail(email, password);
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
      <View style={shell.pageWrap}>
        <View style={shell.cardStack}>
          <View style={shell.floatOrb1} pointerEvents="none" />
          <View style={shell.floatOrb2} pointerEvents="none" />
          <View style={shell.floatOrb3} pointerEvents="none" />

          <View style={shell.cardElevated}>
            <AuthCard>
              <View style={L.hero}>
                <Text style={L.eyebrow}>{strings.login.eyebrow}</Text>
                <Text style={L.title}>{strings.login.title}</Text>
                <View style={L.accentRow}>
                  <View style={L.accentDot} />
                  <View style={L.accentBar} />
                  <View style={L.accentDot} />
                </View>
              </View>

              <View style={L.formBlock}>
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
                  style={L.forgottenRow}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Text style={authStyles.linkText}>{strings.login.forgotPassword}</Text>
                </TouchableOpacity>

                <PrimaryButton
                  title={strings.login.primaryButton}
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                />
              </View>

              <View style={authStyles.footerDivider} />

              <View style={authStyles.bottomSection}>
                <Text style={authStyles.hintText}>{strings.login.noAccount}</Text>
                <SecondaryButton title={strings.login.secondaryButton} onPress={handleCreateAccount} />
              </View>
            </AuthCard>
          </View>
        </View>
      </View>
    </AuthContainer>
  );
}
