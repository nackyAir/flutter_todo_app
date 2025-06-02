import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

type AuthMode = 'signin' | 'signup' | 'emaillink' | 'reset';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { 
    sendEmailLink, 
    signInWithLink, 
    signInWithPassword,
    signUpWithPassword,
    resetPassword,
    user, 
    loading 
  } = useAuth();
  const router = useRouter();

  // ユーザーがログイン済みの場合、ホーム画面にリダイレクト
  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  // ディープリンクを監視してメールリンク認証を処理
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      try {
        const savedEmail = await AsyncStorage.getItem('emailForSignIn');
        if (savedEmail && url) {
          setIsLoading(true);
          await signInWithLink(savedEmail, url);
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Deep link auth error:', error);
        Alert.alert('認証エラー', '認証に失敗しました。もう一度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };

    // 初期URLをチェック
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // URLの変更を監視
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, []);

  const validateEmail = (email: string) => {
    return email.includes('@') && email.length > 0;
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handlePasswordSignIn = async () => {
    if (!validateEmail(email)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください。');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('エラー', 'パスワードを入力してください。');
      return;
    }

    try {
      setIsLoading(true);
      await signInWithPassword(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Password sign in error:', error);
      let errorMessage = 'ログインに失敗しました。';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'このメールアドレスのユーザーは見つかりませんでした。';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'パスワードが間違っています。';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '無効なメールアドレスです。';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'このアカウントは無効になっています。';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'メールアドレスまたはパスワードが間違っています。';
      }
      
      Alert.alert('ログインエラー', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSignUp = async () => {
    if (!validateEmail(email)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください。');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください。');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません。');
      return;
    }

    try {
      setIsLoading(true);
      await signUpWithPassword(email, password);
      Alert.alert('アカウント作成完了', 'アカウントが作成されました。');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Password sign up error:', error);
      let errorMessage = 'アカウント作成に失敗しました。';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています。';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '無効なメールアドレスです。';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'パスワードが弱すぎます。より強いパスワードを設定してください。';
      }
      
      Alert.alert('アカウント作成エラー', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLink = async () => {
    if (!validateEmail(email)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください。');
      return;
    }

    try {
      setIsLoading(true);
      await sendEmailLink(email);
      setEmailSent(true);
      Alert.alert(
        '認証メール送信完了',
        `${email} にログインリンクを送信しました。メールボックスをご確認ください。`
      );
    } catch (error: any) {
      console.error('Send email error:', error);
      Alert.alert('エラー', '認証メールの送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!validateEmail(email)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください。');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email);
      Alert.alert(
        'パスワードリセット',
        `${email} にパスワードリセット用のメールを送信しました。`
      );
      setAuthMode('signin');
    } catch (error: any) {
      console.error('Password reset error:', error);
      Alert.alert('エラー', 'パスワードリセットメールの送信に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailSent(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchAuthMode = (mode: AuthMode) => {
    resetForm();
    setAuthMode(mode);
  };

  const getAuthModeConfig = () => {
    switch (authMode) {
      case 'signin':
        return {
          title: 'ログイン',
          subtitle: 'アカウントにサインインしてください',
          primaryButton: 'ログイン',
          primaryAction: handlePasswordSignIn,
          icon: 'log-in-outline' as const,
        };
      case 'signup':
        return {
          title: 'アカウント作成',
          subtitle: '新しいアカウントを作成しましょう',
          primaryButton: 'アカウント作成',
          primaryAction: handlePasswordSignUp,
          icon: 'person-add-outline' as const,
        };
      case 'emaillink':
        return {
          title: 'メールでログイン',
          subtitle: 'メールアドレスにログインリンクを送信します',
          primaryButton: emailSent ? 'メール再送信' : 'ログインリンクを送信',
          primaryAction: handleEmailLink,
          icon: 'mail-outline' as const,
        };
      case 'reset':
        return {
          title: 'パスワードリセット',
          subtitle: 'パスワードをリセットするためのメールを送信します',
          primaryButton: 'リセットメールを送信',
          primaryAction: handlePasswordReset,
          icon: 'refresh-outline' as const,
        };
    }
  };

  const config = getAuthModeConfig();

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>認証状態を確認中...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* ヘッダー */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name={config.icon} size={32} color="#3B82F6" />
              </View>
              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.subtitle}>{config.subtitle}</Text>
            </View>

            {/* フォームエリア */}
            <View style={styles.formContainer}>
              {/* メールアドレス入力 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>メールアドレス</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color="#6B7280" />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* パスワード入力（メールリンク以外） */}
              {authMode !== 'emaillink' && authMode !== 'reset' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>パスワード</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="6文字以上のパスワード"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                        size={18} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* パスワード確認（サインアップ時のみ） */}
              {authMode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>パスワード確認</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                    <TextInput
                      style={styles.textInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="パスワードを再入力"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                        size={18} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* メインアクションボタン */}
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.disabledButton]}
                onPress={config.primaryAction}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {config.primaryButton}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* パスワードを忘れた場合（ログイン時のみ） */}
              {authMode === 'signin' && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => switchAuthMode('reset')}
                  disabled={isLoading}
                >
                  <Text style={styles.linkText}>パスワードを忘れた場合</Text>
                </TouchableOpacity>
              )}

              {/* 区切り線 */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>または</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* 認証方法切り替えボタン */}
              <View style={styles.authModeButtons}>
                {authMode !== 'signin' && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => switchAuthMode('signin')}
                    disabled={isLoading}
                  >
                    <Ionicons name="log-in-outline" size={18} color="#3B82F6" />
                    <Text style={styles.secondaryButtonText}>ログイン</Text>
                  </TouchableOpacity>
                )}

                {authMode !== 'signup' && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => switchAuthMode('signup')}
                    disabled={isLoading}
                  >
                    <Ionicons name="person-add-outline" size={18} color="#3B82F6" />
                    <Text style={styles.secondaryButtonText}>アカウント作成</Text>
                  </TouchableOpacity>
                )}

                {authMode !== 'emaillink' && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => switchAuthMode('emaillink')}
                    disabled={isLoading}
                  >
                    <Ionicons name="mail-outline" size={18} color="#3B82F6" />
                    <Text style={styles.secondaryButtonText}>メールリンク</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* メールリンク送信済みメッセージ */}
              {emailSent && authMode === 'emaillink' && (
                <View style={styles.emailSentContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  <Text style={styles.emailSentText}>
                    メールを送信しました！
                  </Text>
                  <Text style={styles.emailSentSubtext}>
                    メール内のリンクをタップしてログインしてください
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 12,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
  },
  primaryButton: {
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    overflow: 'hidden',
  },
  buttonContent: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 12,
    fontWeight: '500',
  },
  authModeButtons: {
    gap: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  emailSentContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  emailSentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginTop: 6,
  },
  emailSentSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
}); 