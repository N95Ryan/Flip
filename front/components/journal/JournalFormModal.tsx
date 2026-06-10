import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { IntensityStars } from '@/components/journal/IntensityStars';
import { SerifText } from '@/components/SerifText';
import { Colors } from '@/constants/colors';
import { Theme } from '@/constants/theme';
import type { JournalEntry, JournalEntryPayload } from '@/types/journal';

type JournalFormModalProps = {
  visible: boolean;
  entry?: JournalEntry | null;
  onClose: () => void;
  onSubmit: (payload: JournalEntryPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseSessionDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function JournalFormModal({
  visible,
  entry,
  onClose,
  onSubmit,
  onDelete,
}: JournalFormModalProps) {
  const isEdit = Boolean(entry);
  const [sessionDate, setSessionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState('60');
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (entry) {
      setSessionDate(parseSessionDate(entry.session_date));
      setDuration(String(entry.duration_minutes));
      setIntensity(entry.intensity);
      setNotes(entry.notes);
    } else {
      setSessionDate(new Date());
      setDuration('60');
      setIntensity(3);
      setNotes('');
    }
    setLocalError(null);
  }, [visible, entry]);

  const handleSave = async () => {
    const durationMinutes = parseInt(duration, 10);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      setLocalError('Duration must be greater than 0 minutes.');
      return;
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (sessionDate > today) {
      setLocalError('Session date cannot be in the future.');
      return;
    }

    setSaving(true);
    setLocalError(null);
    try {
      await onSubmit({
        session_date: toDateString(sessionDate),
        duration_minutes: durationMinutes,
        intensity,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not delete entry');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <SerifText style={styles.title}>{isEdit ? 'Edit session' : 'New session'}</SerifText>

          <Text style={styles.label}>Date</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{toDateString(sessionDate)}</Text>
          </Pressable>
          {showDatePicker ? (
            <DateTimePicker
              value={sessionDate}
              mode="date"
              maximumDate={new Date()}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setSessionDate(date);
              }}
            />
          ) : null}

          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            placeholder="60"
          />

          <Text style={styles.label}>Intensity</Text>
          <IntensityStars value={intensity} onChange={setIntensity} size={28} />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="What did you work on?"
            textAlignVertical="top"
          />

          {localError ? <Text style={styles.error}>{localError}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, saving && styles.disabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </Pressable>
          </View>

          {isEdit && onDelete ? (
            <Pressable
              style={[styles.deleteButton, deleting && styles.disabled]}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Text style={styles.deleteText}>Delete session</Text>
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 8,
    maxHeight: '92%',
  },
  title: {
    fontSize: 18,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 4,
  },
  dateButton: {
    backgroundColor: Colors.background,
    borderRadius: Theme.borderRadius.input,
    padding: 14,
  },
  dateText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Theme.borderRadius.input,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  notesInput: {
    minHeight: 96,
  },
  error: {
    color: Colors.primary,
    fontSize: 13,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: Theme.borderRadius.card,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  cancelText: {
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: Theme.borderRadius.cta,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  saveText: {
    color: Colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 8,
    padding: 14,
    alignItems: 'center',
  },
  deleteText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.7,
  },
});
