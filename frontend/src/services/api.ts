import axios, { AxiosInstance } from 'axios';
import {
  PredictRequest,
  PredictResponse,
  ModelInfo,
  HealthResponse,
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:8080';

class IrisApiService {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async health(): Promise<HealthResponse> {
    try {
      const response = await this.client.get<HealthResponse>('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error}`);
    }
  }

  async predict(request: PredictRequest): Promise<PredictResponse> {
    try {
      const response = await this.client.post<PredictResponse>('/predict', request);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data?.error || 'Prediction failed'
        );
      }
      throw new Error('Network error during prediction');
    }
  }

  async modelInfo(): Promise<ModelInfo> {
    try {
      const response = await this.client.get<ModelInfo>('/model/info');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch model info: ${error}`);
    }
  }

  setBaseURL(url: string) {
    this.client.defaults.baseURL = url;
  }
}

export const apiService = new IrisApiService();
