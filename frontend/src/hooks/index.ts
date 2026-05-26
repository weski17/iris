import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../theme/colors';
import { apiService } from '../services/api';
import { ModelInfo, HealthResponse } from '../types';

export const useColors = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
};

export const useApi = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      await apiService.health();
      setIsOnline(true);
      setError(null);
      await fetchModelInfo();
    } catch (err) {
      setIsOnline(false);
      setError('API unavailable');
    }
  };

  const fetchModelInfo = async () => {
    try {
      setIsLoading(true);
      const info = await apiService.modelInfo();
      setModelInfo(info);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOnline,
    modelInfo,
    isLoading,
    error,
    refetch: fetchModelInfo,
    checkHealth,
  };
};
