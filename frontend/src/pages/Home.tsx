import { useState, useEffect } from 'react';
import { apiService, PredictResponse, ModelInfo } from '../services/api';
import { Slider } from '../components/Slider';

export function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);

  const [sepalLength, setSepalLength] = useState(5.5);
  const [sepalWidth, setSepalWidth] = useState(3.5);
  const [petalLength, setPetalLength] = useState(3.0);
  const [petalWidth, setPetalWidth] = useState(1.5);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      await apiService.health();
      setApiStatus('connected');
      const info = await apiService.modelInfo();
      setModelInfo(info);
      setError(null);
    } catch (err) {
      setApiStatus('disconnected');
      setError('Could not connect to API');
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.predict({
        sepal_length: sepalLength,
        sepal_width: sepalWidth,
        petal_length: petalLength,
        petal_width: petalWidth,
      });
      setPrediction(response);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const speciesColor: Record<string, string> = {
    setosa: 'bg-red-100 text-red-800',
    versicolor: 'bg-blue-100 text-blue-800',
    virginica: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ios-gray to-white">
      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🌸 Iris Classifier</h1>
          <p className="text-sm text-gray-600 mt-1">ML-powered Iris flower classification</p>
        </div>

        {/* API Status */}
        <div className={`mb-6 p-3 rounded-lg text-sm font-medium ${
          apiStatus === 'connected' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {apiStatus === 'connected' ? '✓ Connected' : '✗ Disconnected'}
        </div>

        {/* Model Info */}
        {modelInfo && (
          <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Model Info</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Accuracy: <span className="font-medium text-gray-900">{(modelInfo.accuracy * 100).toFixed(1)}%</span></p>
              <p>Training Date: <span className="font-medium text-gray-900">{new Date(modelInfo.training_date).toLocaleDateString()}</span></p>
            </div>
          </div>
        )}

        {/* Sliders */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Flower Measurements (cm)</h2>
          <Slider
            label="Sepal Length"
            value={sepalLength}
            min={4}
            max={8}
            step={0.1}
            onChange={setSepalLength}
          />
          <Slider
            label="Sepal Width"
            value={sepalWidth}
            min={2}
            max={4.5}
            step={0.1}
            onChange={setSepalWidth}
          />
          <Slider
            label="Petal Length"
            value={petalLength}
            min={1}
            max={7}
            step={0.1}
            onChange={setPetalLength}
          />
          <Slider
            label="Petal Width"
            value={petalWidth}
            min={0.1}
            max={2.5}
            step={0.1}
            onChange={setPetalWidth}
          />
        </div>

        {/* Predict Button */}
        <button
          onClick={handlePredict}
          disabled={loading || apiStatus === 'disconnected'}
          className="w-full bg-ios-blue hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition mb-6"
        >
          {loading ? 'Predicting...' : 'Predict'}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Results */}
        {prediction && (
          <div className="bg-white rounded-lg p-5 border border-gray-200 space-y-4">
            <h2 className="font-semibold text-gray-900">Prediction Result</h2>

            <div className={`p-3 rounded-lg ${speciesColor[prediction.species] || 'bg-gray-100'}`}>
              <p className="text-xs font-medium opacity-75">Species</p>
              <p className="text-2xl font-bold capitalize">{prediction.species}</p>
              <p className="text-xs font-medium opacity-75 mt-1">
                Confidence: {(prediction.confidence * 100).toFixed(1)}%
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Probabilities</p>
              {Object.entries(prediction.probabilities).map(([species, prob]) => (
                <div key={species} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 w-20 capitalize">{species}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ios-blue"
                      style={{ width: `${prob * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-900 w-12 text-right">
                    {(prob * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Iris Classification API v0.1.0</p>
        </div>
      </div>
    </div>
  );
}
