import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const getAuthProviders = () => {
    if (!user?.providerData) return [];
    
    return user.providerData.map(provider => {
      switch (provider.providerId) {
        case 'password':
          return 'メール＋パスワード';
        case 'emailLink':
          return 'メールリンク';
        default:
          return provider.providerId;
      }
    });
  };

  const handleSignOut = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('エラー', 'ログアウトに失敗しました。');
            }
          },
        },
      ]
    );
  };

  const profileSections = [
    {
      title: 'アカウント情報',
      items: [
        {
          icon: 'mail-outline',
          label: 'メールアドレス',
          value: user?.email || '',
          type: 'text'
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'メール認証状態',
          value: user?.emailVerified ? '認証済み' : '未認証',
          type: user?.emailVerified ? 'success' : 'warning'
        },
        {
          icon: 'key-outline',
          label: '認証方法',
          value: getAuthProviders().join(', ') || '不明',
          type: 'text'
        }
      ]
    },
    {
      title: 'システム情報',
      items: [
        {
          icon: 'finger-print-outline',
          label: 'ユーザーID',
          value: user?.uid || '',
          type: 'mono'
        },
        {
          icon: 'calendar-outline',
          label: 'アカウント作成日',
          value: user?.metadata?.creationTime 
            ? new Date(user.metadata.creationTime).toLocaleString('ja-JP')
            : '不明',
          type: 'text'
        },
        {
          icon: 'time-outline',
          label: '最終ログイン',
          value: user?.metadata?.lastSignInTime 
            ? new Date(user.metadata.lastSignInTime).toLocaleString('ja-JP')
            : '不明',
          type: 'text'
        }
      ]
    }
  ];

  const renderValue = (item: any) => {
    let textStyle;
    
    switch (item.type) {
      case 'success':
        textStyle = [styles.itemValue, styles.successText];
        break;
      case 'warning':
        textStyle = [styles.itemValue, styles.warningText];
        break;
      case 'mono':
        textStyle = [styles.itemValue, styles.monoText];
        break;
      default:
        textStyle = styles.itemValue;
    }

    return (
      <Text style={textStyle} numberOfLines={2}>
        {item.value}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={32} color="#3B82F6" />
            </View>
            <Text style={styles.title}>プロフィール</Text>
            <Text style={styles.emailHeader}>{user?.email?.split('@')[0]}</Text>
          </View>
        </View>

        {/* コンテンツ */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {profileSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={[
                    styles.itemContainer,
                    itemIndex < section.items.length - 1 && styles.itemBorder
                  ]}>
                    <View style={styles.itemLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons 
                          name={item.icon as any} 
                          size={18} 
                          color="#6B7280" 
                        />
                      </View>
                      <Text style={styles.itemLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.itemRight}>
                      {renderValue(item)}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* ログアウトボタン */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.signOutButton} 
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.signOutButtonText}>ログアウト</Text>
            </TouchableOpacity>
          </View>

          {/* ボトムスペース */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  emailHeader: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  itemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemValue: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    fontWeight: '500',
  },
  successText: {
    color: '#059669',
    fontWeight: '600',
  },
  warningText: {
    color: '#D97706',
    fontWeight: '600',
  },
  monoText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#6B7280',
  },
  actionSection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 40,
  },
});
