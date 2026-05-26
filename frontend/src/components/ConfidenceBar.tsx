import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Spacing, BorderRadius } from '../theme/colors';
import { useColors } from '../hooks';

interface ConfidenceBarProps {
  confidence: number;
  species: string;
  color?: string;
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  confidence,
  species,
  color = '#007AFF',
}) => {
  const colors = useColors();
  const percentage = Math.round(confidence * 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>{species}</Text>
        <Text style={[styles.percentage, { color: colors.primary }]}>
          {percentage}%
        </Text>
      </View>
      <View
        style={[
          styles.barBackground,
          { backgroundColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.barFill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

interface SliderInputProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onValueChange,
  min = 0,
  max = 10,
  step = 0.1,
}) => {
  const colors = useColors();
  const [displayValue, setDisplayValue] = React.useState(value.toString());

  const handleManualChange = (text: string) => {
    setDisplayValue(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= min && num <= max) {
      onValueChange(num);
    }
  };

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={[styles.sliderLabel, { color: colors.text }]}>
          {label}
        </Text>
        <Text style={[styles.sliderValue, { color: colors.primary }]}>
          {value.toFixed(1)} cm
        </Text>
      </View>
      <View
        style={[
          styles.rangeInput,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.rangeText, { color: colors.textTertiary }]}>
          {min}
        </Text>
        <View
          style={[
            styles.trackBar,
            {
              backgroundColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.trackFill,
              {
                width: `${((value - min) / (max - min)) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.rangeText, { color: colors.textTertiary }]}>
          {max}
        </Text>
      </View>
      <View style={styles.sliderInputRow}>
        {Array.from({ length: 5 }, (_, i) => {
          const val = min + (i * (max - min)) / 4;
          return (
            <Text
              key={i}
              style={[styles.tickLabel, { color: colors.textTertiary }]}
            >
              {val.toFixed(1)}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  barBackground: {
    height: 6,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  sliderContainer: {
    marginBottom: Spacing.lg,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  rangeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 24,
  },
  trackBar: {
    flex: 1,
    height: 4,
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  sliderInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  tickLabel: {
    fontSize: 10,
    fontWeight: '400',
  },
});
