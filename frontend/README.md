# Iris Classifier - React Native Frontend

iOS-styled React Native App für die Iris-Klassifikation. Läuft auf iOS, Android und Web.

## Features

✅ **3 Hauptbildschirme:**
- 📊 **Home** — API-Status, Modell-Metadaten
- 🌸 **Predict** — Vier Slider für die Features, Live-Summary
- 📈 **Result** — Klassifikations-Ergebnis mit Wahrscheinlichkeitsverteilung

✅ **Design:**
- iOS Human Interface Guidelines
- SF Symbols & Native Colors
- Dark Mode Support
- Adaptive Layout

✅ **Features:**
- Echtzeit-Slider-Eingabe
- Input-Validierung
- Error Handling
- Loading States
- REST-API Integration (Axios)

## Setup

### 1. Node.js & npm installieren

```bash
# macOS / brew
brew install node

# Oder von nodejs.org
```

### 2. Dependencies installieren

```bash
cd frontend
npm install
```

### 3. Konfiguration

Stelle sicher, dass die API läuft:
```bash
# Terminal 1: Python API
python ml/train.py  # Modell trainieren
cd api && cargo run --release  # Rust API starten
# API läuft auf http://127.0.0.1:8080
```

### 4. App starten

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (Browser)
npm run web

# Oder allgemein
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Dashboard
│   │   ├── PredictScreen.tsx   # Slider Input
│   │   └── ResultScreen.tsx    # Ergebnis-Anzeige
│   ├── navigation/
│   │   └── Navigation.tsx      # Tab Navigator
│   ├── services/
│   │   └── api.ts              # REST-Client
│   ├── components/
│   │   └── ConfidenceBar.tsx   # Wiederverwendbare Komponenten
│   ├── hooks/
│   │   └── index.ts            # Custom Hooks (useColors, useApi)
│   ├── types/
│   │   └── index.ts            # TypeScript Interfaces
│   ├── theme/
│   │   └── colors.ts           # Design System
│   └── App.tsx                 # Entry Point
├── package.json
├── tsconfig.json
├── app.json                     # Expo Config
└── README.md
```

## Bildschirme

### 📊 Home Screen
- API Connection Status (Echtzeit-Ping)
- Model Accuracy & Version
- Feature Names
- Training Date
- Quick Links

### 🌸 Predict Screen
- **4 Slider** für Features:
  - Sepal Length (4.0 - 8.0 cm)
  - Sepal Width (2.0 - 4.5 cm)
  - Petal Length (1.0 - 7.0 cm)
  - Petal Width (0.1 - 2.5 cm)
- **Summary Card** mit aktuellen Werten
- **Classify Button** → API-Call
- **Reset Button**

### 📈 Result Screen
- **Species Card** mit Emoji
- **Description** des Flower Type
- **Confidence Badge** (z.B. "98% Confident")
- **Probability Distribution** als Balkendiagramme
- **Metadata** (Timestamp, Date)
- **Back Button** → zurück zu Predict

## API Integration

### Health Check (Auto)
```typescript
GET /health
// Response: { status, timestamp, version }
```

### Prediction
```typescript
POST /predict
// Request: { sepal_length, sepal_width, petal_length, petal_width }
// Response: { species, confidence, probabilities, timestamp }
```

### Model Info (Auto)
```typescript
GET /model/info
// Response: { accuracy, features, targets, n_estimators, ... }
```

## Dark Mode

App unterstützt automatisch Dark/Light Mode basierend auf System-Einstellung:
- Light Mode: Weiß/Blau
- Dark Mode: Schwarz/Hellblau

Ändert sich automatisch wenn User System-Einstellung ändert.

## Debugging

### Expo DevTools öffnen
```bash
# Nach npm start
Drücke 'j' für Expo DevTools

# iOS Simulator: Cmd+D
# Android Emulator: Cmd+M
```

### Network Requests debuggen
```bash
# Activiere Network Logging in Expo DevTools
```

### API-URL konfigurieren

Ändere in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://your-api:8080';
```

Für echte Devices (kein Localhost):
```typescript
const API_BASE_URL = 'http://192.168.1.100:8080';  // Deine lokale IP
```

## Build für Production

### iOS App Build
```bash
eas build --platform ios
```

### Android App Build
```bash
eas build --platform android
```

Erfordert Expo Account: https://expo.dev

## Troubleshooting

### "Cannot connect to API"
```
✅ Stelle sicher, dass die Rust API läuft (cargo run)
✅ Überprüfe die API_BASE_URL in src/services/api.ts
✅ Für echte Devices: Nutze lokale IP statt localhost
```

### "Module not found"
```bash
rm -rf node_modules
npm install
```

### "Clear Expo Cache"
```bash
expo start -c
```

### Emulator starten (macOS)
```bash
# iOS Simulator
open -a Simulator

# Android Emulator
emulator -avd Pixel_6_API_31
```

## Performance

- **Lazy Loading** für Screens
- **Memoization** für Komponenten (React.memo)
- **Optimized Sliders** mit minimalem Re-render
- **Async API Calls** mit Loading States

## Design System

### Colors (Theme)
```typescript
Colors.light.primary      // #007AFF (iOS Blue)
Colors.light.success      // #34C759 (iOS Green)
Colors.light.error        // #FF3B30 (iOS Red)
```

### Spacing
```typescript
Spacing.xs  = 4
Spacing.sm  = 8
Spacing.md  = 12
Spacing.lg  = 16
Spacing.xl  = 24
```

### Typography
```typescript
Typography.title          // 32px, 700 weight
Typography.headline       // 28px, 700 weight
Typography.body           // 16px, 400 weight
```

## Next Steps

1. ✅ **TEIL 1** – ML-Modell
2. ✅ **TEIL 2** – REST API (Rust)
3. ✅ **TEIL 3** – Frontend (React Native)
4. 🔜 **TEIL 4** – Docker & Kubernetes
5. 🔜 **TEIL 5** – CI/CD (Jenkins + ArgoCD)
6. 🔜 **TEIL 6** – Monitoring (Prometheus + Grafana)
