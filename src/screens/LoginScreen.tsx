import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { validateEmail, validatePassword } from '../utils/validators';
import { Button } from '../components/Button';

export function LoginScreen() {
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const shake = useRef(new Animated.Value(0)).current;

  // Refs for programmatic focus control – prevents the OS from auto-jumping focus
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 8,
        bounciness: 12,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 600,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide, logoScale]);

  function triggerShake() {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0.6, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -0.4, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function onSubmit() {
    setSubmitError(null);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) {
      triggerShake();
      return;
    }
    try {
      setSubmitting(true);
      await signIn(email, password);
    } catch {
      setSubmitError('Login failed, please try again');
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  }

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] });

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.gradientBackdrop, { backgroundColor: colors.gradientFrom }]} />
      <View
        style={[
          styles.gradientBackdrop,
          styles.gradientBlob,
          { backgroundColor: colors.gradientTo },
        ]}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.logoCircle, { backgroundColor: colors.primary, transform: [{ scale: logoScale }] }]}
          >
            <Text style={styles.logoMark}>W</Text>
          </Animated.View>

          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
            <Text style={[styles.brand, { color: colors.primary }]}>WOM</Text>
            <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Sign in to explore the catalog.
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: fade, transform: [{ translateX: shakeX }] }}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.surface,
                    borderColor: emailError
                      ? colors.danger
                      : emailFocus
                      ? colors.primary
                      : colors.border,
                    shadowColor: Platform.OS === 'ios' ? (emailFocus ? colors.primary : 'transparent') : undefined,
                  },
                ]}
              >
                <TextInput
                  ref={emailRef}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (emailError) setEmailError(null);
                  }}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  importantForAutofill="no"
                  disableFullscreenUI={true}
                  style={[styles.input, { color: colors.text }]}
                  accessibilityLabel="Email"
                />
              </View>
              {emailError ? (
                <Text style={[styles.error, { color: colors.danger }]}>{emailError}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: colors.surface,
                    borderColor: passwordError
                      ? colors.danger
                      : passwordFocus
                      ? colors.primary
                      : colors.border,
                    shadowColor: Platform.OS === 'ios' ? (passwordFocus ? colors.primary : 'transparent') : undefined,
                  },
                ]}
              >
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (passwordError) setPasswordError(null);
                  }}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  disableFullscreenUI={true}
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                  style={[styles.input, styles.inputWithToggle, { color: colors.text }]}
                  accessibilityLabel="Password"
                />
                <Pressable
                  onPress={() => setShowPassword((s) => !s)}
                  style={styles.toggle}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Text style={[styles.toggleText, { color: colors.primary }]}>
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </Text>
                </Pressable>
              </View>
              {passwordError ? (
                <Text style={[styles.error, { color: colors.danger }]}>{passwordError}</Text>
              ) : null}
            </View>

            {submitError ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.dangerSoft }]}>
                <Text style={[styles.errorBannerText, { color: colors.danger }]}>{submitError}</Text>
              </View>
            ) : null}

            <Button title="Sign in" onPress={onSubmit} loading={submitting} style={styles.submit} />

            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Demo build — any valid email and 6+ char password works.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradientBackdrop: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 360,
    top: -180,
    right: -120,
    opacity: 0.18,
  },
  gradientBlob: {
    top: 'auto',
    bottom: -200,
    right: 'auto',
    left: -140,
    width: 320,
    height: 320,
    opacity: 0.14,
  },
  content: { padding: 24, paddingTop: 32, flexGrow: 1 },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logoMark: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },
  brand: { fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  title: { fontSize: 32, fontWeight: '800', marginTop: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, marginTop: 8, marginBottom: 32 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 8, fontWeight: '700', letterSpacing: 0.3 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  inputWithToggle: { paddingRight: 8 },
  toggle: { paddingHorizontal: 6, paddingVertical: 6 },
  toggleText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  error: { marginTop: 6, fontSize: 13, fontWeight: '500' },
  errorBanner: {
    marginTop: 6,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  errorBannerText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  submit: { marginTop: 16 },
  hint: { fontSize: 12, marginTop: 18, textAlign: 'center' },
});
