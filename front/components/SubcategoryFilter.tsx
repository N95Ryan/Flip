import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { SubcategoryFilterValue } from '@/types/technique';
import { SUBCATEGORY_FILTERS } from '@/types/technique';

interface SubcategoryFilterProps {
  selected: SubcategoryFilterValue;
  onSelect: (value: SubcategoryFilterValue) => void;
}

export function SubcategoryFilter({ selected, onSelect }: SubcategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {SUBCATEGORY_FILTERS.map((filter) => {
        const isActive = selected === filter.value;

        return (
          <Pressable
            key={filter.value}
            onPress={() => onSelect(filter.value)}
            style={[styles.pill, isActive && styles.pillActive]}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8E0D0',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pillActive: {
    backgroundColor: '#34344A',
    borderColor: '#34344A',
  },
  pillText: {
    color: '#84714F',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
