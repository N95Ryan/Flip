import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JournalCard } from '@/components/journal/JournalCard';
import { JournalFormModal } from '@/components/journal/JournalFormModal';
import { PremiumGate } from '@/components/PremiumGate';
import { SerifText } from '@/components/SerifText';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import { useJournal } from '@/hooks/useJournal';
import { useAuthStore } from '@/store/authStore';
import type { JournalEntry } from '@/types/journal';

export default function JournalScreen() {
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const isPremium = user?.subscription_status === 'active';

  const { entries, loading, error, fetchEntries, createEntry, updateEntry, deleteEntry } =
    useJournal();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshUser().catch(() => {});
      if (user?.subscription_status === 'active') {
        fetchEntries({ silent: entries.length > 0 }).catch(() => {});
      }
    }, [refreshUser, fetchEntries, user?.subscription_status, entries.length]),
  );

  const openCreate = () => {
    setEditingEntry(null);
    setModalVisible(true);
  };

  const openEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setModalVisible(true);
  };

  const confirmSwipeDelete = (entry: JournalEntry) => {
    Alert.alert('Delete session', 'Remove this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteEntry(entry.id).catch((err) => {
            Alert.alert('Journal', err instanceof Error ? err.message : 'Delete failed');
          });
        },
      },
    ]);
  };

  const renderRightActions = (entry: JournalEntry) => (
    <RectButton style={styles.deleteAction} onPress={() => confirmSwipeDelete(entry)}>
      <Ionicons name="trash-outline" size={22} color={Colors.surface} />
      <Text style={styles.deleteActionText}>Delete</Text>
    </RectButton>
  );

  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <PremiumGate />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SerifText style={styles.title}>Training journal</SerifText>
        <Text style={styles.subtitle}>Log your sessions and track progress</Text>
      </View>

      {loading && entries.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : error && entries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => fetchEntries()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
              <JournalCard entry={item} onPress={() => openEdit(item)} />
            </Swipeable>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No sessions yet</Text>
              <Text style={styles.emptyText}>Tap + to log your first training session.</Text>
            </View>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={openCreate}>
        <Ionicons name="add" size={28} color={Colors.surface} />
      </Pressable>

      <JournalFormModal
        visible={modalVisible}
        entry={editingEntry}
        onClose={() => setModalVisible(false)}
        onSubmit={async (payload) => {
          if (editingEntry) {
            await updateEntry(editingEntry.id, payload);
          } else {
            await createEntry(payload);
          }
        }}
        onDelete={
          editingEntry
            ? () => deleteEntry(editingEntry.id)
            : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
  },
  separator: {
    height: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorText: {
    color: Colors.primary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  retryText: {
    color: Colors.surface,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  deleteAction: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    borderRadius: Theme.borderRadius.card,
    marginLeft: 8,
    gap: 4,
  },
  deleteActionText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});
