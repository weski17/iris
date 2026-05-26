import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Spacing, BorderRadius } from '../theme/colors';
import { useColors } from '../hooks';
import { ConfidenceBar } from '../components/ConfidenceBar';
import { PredictResponse, SPECIES_MAP } from '../types';

interface ResultScreenProps {
  result: PredictResponse | null;
  onReset?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onReset,
}) => {
  const colors = useColors();

  if (!result) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          No prediction yet. Use the Predict tab to classify an iris flower.
        </Text>
      </View>
    );
  }

  const species = SPECIES_MAP[result.species.toLowerCase()];
  const speciesColor = species?.color || colors.primary;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Classification Result
        </Text>
      </View>

      {/* Result Card */}
      <View
        style={[
          styles.resultCard,
          { backgroundColor: colors.card, borderColor: speciesColor },
        ]}
      >
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{species?.emoji || '🌸'}</Text>
        </View>

        <Text style={[styles.speciesName, { color: colors.text }]}>
          {species?.name || result.species}
        </Text>

        {species && (
          <Text
            style={[
              styles.speciesDescription,
              { color: colors.textSecondary },
            ]}
          >
            {species.description}
          </Text>
        )}

        <View style={[styles.confidenceBadge, { backgroundColor: speciesColor }]}>
          <Text style={styles.confidenceText}>
            {Math.round(result.confidence * 100)}% Confident
          </Text>
        </View>
      </View>

      {/* Probability Distribution */}
      <View
        style={[
          styles.probabilityCard,
          { backgroundColor: colors.card },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Probability Distribution
        </Text>

        <ConfidenceBar
          species="Setosa 🌸"
          confidence={result.probabilities.setosa}
          color="#FF6B9D"
        />

        <ConfidenceBar
          species="Versicolor 🌺"
          confidence={result.probabilities.versicolor}
          color="#FFD93D"
        />

        <ConfidenceBar
          species="Virginica 🌷"
          confidence={result.probabilities.virginica}
          color="#6BCB77"
        />
      </View>

      {/* Metadata */}
      <View
        style={[
          styles.metadataCard,
          { backgroundColor: colors.card },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Details
        </Text>

        <View style={styles.metadataRow}>
          <Text style={[styles.metadataLabel, { color: colors.textTertiary }]}>
            Timestamp
          </Text>
          <Text style={[styles.metadataValue, { color: colors.text }]}>
            {new Date(result.timestamp).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.metadataRow}>
          <Text style={[styles.metadataLabel, { color: colors.textTertiary }]}>
            Date
          </Text>
          <Text style={[styles.metadataValue, { color: colors.text }]}>
            {new Date(result.timestamp).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={onReset}
        style={[
          styles.actionButton,
          { backgroundColor: colors.primary },
        ]}
      >
        <Text style={styles.actionButtonText}>← Back to Classifier</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  emojiContainer: {
    marginBottom: Spacing.lg,
  },
  emoji: {
    fontSize: 80,
  },
  speciesName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  speciesDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  confidenceBadge: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  probabilityCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  metadataCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
