import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Spacing, Typography, BorderRadius } from '../theme/colors';
import { useColors } from '../hooks';
import { SliderInput } from '../components/ConfidenceBar';
import { apiService } from '../services/api';
import { PredictRequest, PredictResponse } from '../types';

interface PredictScreenProps {
  onPredictionSuccess?: (result: PredictResponse) => void;
}

export const PredictScreen: React.FC<PredictScreenProps> = ({
  onPredictionSuccess,
}) => {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);

  const [features, setFeatures] = useState({
    sepal_length: 5.5,
    sepal_width: 3.0,
    petal_length: 3.5,
    petal_width: 1.0,
  });

  const handleSliderChange = (
    key: keyof typeof features,
    value: number
  ) => {
    setFeatures(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePredict = async () => {
    try {
      setIsLoading(true);

      const request: PredictRequest = {
        sepal_length: features.sepal_length,
        sepal_width: features.sepal_width,
        petal_length: features.petal_length,
        petal_width: features.petal_width,
      };

      const result = await apiService.predict(request);
      onPredictionSuccess?.(result);
    } catch (error: any) {
      Alert.alert('Prediction Failed', error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFeatures({
      sepal_length: 5.5,
      sepal_width: 3.0,
      petal_length: 3.5,
      petal_width: 1.0,
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Iris Classifier
        </Text>
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
          Adjust the sliders to predict the iris species
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <SliderInput
          label="Sepal Length"
          value={features.sepal_length}
          onValueChange={value => handleSliderChange('sepal_length', value)}
          min={4.0}
          max={8.0}
        />

        <SliderInput
          label="Sepal Width"
          value={features.sepal_width}
          onValueChange={value => handleSliderChange('sepal_width', value)}
          min={2.0}
          max={4.5}
        />

        <SliderInput
          label="Petal Length"
          value={features.petal_length}
          onValueChange={value => handleSliderChange('petal_length', value)}
          min={1.0}
          max={7.0}
        />

        <SliderInput
          label="Petal Width"
          value={features.petal_width}
          onValueChange={value => handleSliderChange('petal_width', value)}
          min={0.1}
          max={2.5}
        />
      </View>

      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          Current Values
        </Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>
              Sepal Length
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {features.sepal_length.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>
              Sepal Width
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {features.sepal_width.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>
              Petal Length
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {features.petal_length.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>
              Petal Width
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {features.petal_width.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleReset}
          disabled={isLoading}
          style={[
            styles.secondaryButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: isLoading ? 0.5 : 1,
            },
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
            Reset
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePredict}
          disabled={isLoading}
          style={[
            styles.primaryButton,
            {
              backgroundColor: colors.primary,
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Classify 🌸</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
