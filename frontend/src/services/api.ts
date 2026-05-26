import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface PredictRequest {
  sepal_length: number;
  sepal_width: number;
  petal_length: number;
  petal_width: number;
}

export interface PredictResponse {
  species: string;
  confidence: number;
  probabilities: {
    setosa: number;
    versicolor: number;
    virginica: number;
  };
  timestamp: string;
}

export interface ModelInfo {
  model_version: string;
  accuracy: number;
  training_date: string;
  feature_names: string[];
  target_names: string[];
  n_estimators: number;
}

export const apiService = {
  async health() {
    return api.get('/health');
  },

  async predict(data: PredictRequest): Promise<PredictResponse> {
    const response = await api.post('/predict', data);
    return response.data;
  },

  async modelInfo(): Promise<ModelInfo> {
    const response = await api.get('/model/info');
    return response.data;
  }
};
