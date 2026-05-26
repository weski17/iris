import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Spacing, Typography, BorderRadius } from '../theme/colors';
import { useColors, useApi } from '../hooks';
import { ModelInfo } from '../types';

export const HomeScreen: React.FC = () => {
  const colors = useColors();
  const { isOnline, modelInfo, isLoading, error, refetch } = useApi();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Status Card */}
      <View
        style={[
          styles.statusCard,
          {
            backgroundColor: colors.card,
            borderColor: isOnline ? colors.success : colors.error,
          },
        ]}
      >
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isOnline ? colors.success : colors.error,
              },
            ]}
          />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {isOnline ? 'API Connected' : 'API Offline'}
          </Text>
        </View>
        {!isOnline && error && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        )}
      </View>

      {/* Model Info Card */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading Model Info...
          </Text>
        </View>
      ) : modelInfo ? (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Model Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>
              Version
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {modelInfo.model_version}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>
              Accuracy
            </Text>
            <Text style={[styles.infoValue, { color: colors.success }]}>
              {(modelInfo.accuracy * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>
              Estimators
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {modelInfo.n_estimators}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
            Features
          </Text>
          {modelInfo.feature_names.map((feature, index) => (
            <Text
              key={index}
              style={[styles.featureItem, { color: colors.textSecondary }]}
            >
              • {feature}
            </Text>
          ))}

          <View style={[styles.divider, { marginVertical: Spacing.md }]} />

          <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
            Species
          </Text>
          {modelInfo.target_names.map((species, index) => (
            <Text
              key={index}
              style={[styles.featureItem, { color: colors.textSecondary }]}
            >
              • {species}
            </Text>
          ))}

          <Text
            style={[styles.trainingDate, { color: colors.textTertiary }]}
          >
            Trained: {new Date(modelInfo.training_date).toLocaleDateString()}
          </Text>
        </View>
      ) : null}

      {/* Quick Links */}
      <View style={styles.quickLinksContainer}>
        <Text
          style={[
            styles.quickLinksTitle,
            { color: colors.text, marginBottom: Spacing.md },
          ]}
        >
          Quick Links
        </Text>
        <View
          style={[
            styles.linkCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>
            📊 Swagger API Docs
          </Text>
          <Text
            style={[
              styles.linkDescription,
              { color: colors.textTertiary },
            ]}
          >
            http://localhost:8080/swagger-ui/
          </Text>
        </View>
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
  statusCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginTop: Spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: Spacing.md,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  featureItem: {
    fontSize: 13,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.md,
  },
  trainingDate: {
    fontSize: 12,
    marginTop: Spacing.md,
  },
  quickLinksContainer: {
    marginBottom: Spacing.xl,
  },
  quickLinksTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  linkDescription: {
    fontSize: 12,
  },
});
