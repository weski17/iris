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

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface Species {
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export const SPECIES_MAP: Record<string, Species> = {
  setosa: {
    name: 'Setosa',
    emoji: '🌸',
    description: 'Small and delicate petals',
    color: '#FF6B9D',
  },
  versicolor: {
    name: 'Versicolor',
    emoji: '🌺',
    description: 'Medium-sized flowers',
    color: '#FFD93D',
  },
  virginica: {
    name: 'Virginica',
    emoji: '🌷',
    description: 'Larger flowers',
    color: '#6BCB77',
  },
};
