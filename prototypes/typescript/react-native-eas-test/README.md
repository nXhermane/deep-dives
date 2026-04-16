# Test React Native CLI with EAS

A test project to verify that EAS (Expo Application Services) works properly with a React Native CLI project without the Expo SDK.

## 📱 About This Project

This project demonstrates the integration of EAS Build and EAS Submit with a vanilla React Native CLI application. It serves as a testing ground to ensure that modern React Native development workflows can leverage EAS services even when not using the Expo SDK.

### Key Features

- **React Native 0.82.1** with the latest React 19.1.1
- **TypeScript** for enhanced type safety
- **EAS Build** integration for automated builds
- **EAS Submit** for app store distribution
- **Safe area context** support for iOS devices
- **Dark mode** support
- **Testing** with Jest
- **Code quality** tools (ESLint, Prettier)

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (>= 20.x)
- **npm** or **yarn**
- **React Native CLI** (`npm install -g react-native-cli`)
- **EAS CLI** (`npm install -g @expo/eas-cli`)
- **Android Studio** and **Xcode** (for native development)

### Platform-Specific Requirements

#### iOS Development
- **Xcode** 14.0 or later
- **iOS Simulator** or physical device
- **CocoaPods** (`sudo gem install cocoapods`)

#### Android Development
- **Android Studio** with Android SDK
- **Android Virtual Device (AVD)** or physical device
- **Java Development Kit (JDK)** 11 or later

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test_react_native_cli_with_eas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure EAS**
   ```bash
   eas build:configure
   ```

## 🛠️ Development

### Running the App

#### iOS Simulator
```bash
npm run ios
```

#### Android Emulator
```bash
npm run android
```

#### Metro Bundler Only
```bash
npm start
```

### Code Quality

#### Run Linting
```bash
npm run lint
```

#### Run Tests
```bash
npm test
```

#### Format Code
```bash
npx prettier --write .
```

## 🏗️ EAS Build Configuration

This project uses EAS Build with three build profiles:

### Development Build
- **Purpose**: Internal testing and development
- **Command**: `eas build --profile development --platform all`
- **Features**: Development client with hot reloading

### Preview Build
- **Purpose**: Beta testing and QA
- **Command**: `eas build --profile preview --platform all`
- **Features**: Optimized for testing distribution

### Production Build
- **Purpose**: App store releases
- **Command**: `eas build --profile production --platform all`
- **Features**: Optimized for production with auto-incremented version

### Building with EAS

```bash
# Build for all platforms
eas build --platform all

# Build for specific platform
eas build --platform ios
eas build --platform android

# Build specific profile
eas build --profile development --platform ios
```

## 📱 Project Structure

```
test_react_native_cli_with_eas/
├── __tests__/                  # Test files
├── android/                    # Android native code
├── ios/                        # iOS native code
├── src/                        # Source code (if added)
├── App.tsx                     # Main application component
├── app.json                    # App configuration
├── babel.config.js            # Babel configuration
├── eas.json                   # EAS build configuration
├── jest.config.js             # Jest testing configuration
├── metro.config.js            # Metro bundler configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🧪 Testing

The project includes Jest for unit testing. Test files are located in the `__tests__/` directory.

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📋 Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🚀 Deployment

### EAS Submit for App Stores

#### iOS App Store
```bash
eas submit --platform ios --profile production
```

#### Google Play Store
```bash
eas submit --platform android --profile production
```

### Manual Deployment

#### iOS
1. Open `ios/test_react_native_cli_with_eas.xcworkspace` in Xcode
2. Archive the project
3. Upload through Xcode Organizer or Application Loader

#### Android
1. Generate signed APK/AAB
2. Upload to Google Play Console

## 🔧 Configuration

### EAS Configuration (eas.json)
```json
{
  "cli": {
    "version": ">= 16.28.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### App Configuration (app.json)
```json
{
  "name": "test_react_native_cli_with_eas",
  "displayName": "test_react_native_cli_with_eas",
  "extra": {
    "eas": {
      "projectId": "5d1ef594-df7f-4ae8-bd32-63c34ec7a79e"
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### Metro Bundler Issues
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear npm cache
npm start -- --reset-cache
```

#### iOS Build Issues
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && pod deintegrate && pod install && cd ..
```

#### Android Build Issues
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Clear Android build cache
cd android && ./gradlew cleanBuildCache && cd ..
```

#### EAS Build Issues
```bash
# Check EAS credentials
eas credentials

# View build logs
eas build:list
eas build:view <build-id>
```

### Performance Optimization

- Use Flipper for debugging
- Enable Hermes engine for better performance
- Use React Native's new architecture (Fabric/New Renderer)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Use TypeScript for new features
- Add tests for new functionality
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

If you encounter any issues or have questions:

1. Check the [React Native documentation](https://reactnative.dev/docs/getting-started)
2. Review [EAS Build documentation](https://docs.expo.dev/build/introduction/)
3. Search existing [GitHub issues](repository-issues-url)
4. Create a new issue with detailed information

## 🙏 Acknowledgments

- [React Native](https://reactnative.dev/) team for the excellent framework
- [Expo](https://expo.dev/) team for EAS services
- [React Native Community](https://github.com/react-native-community) for various packages

---

**Note**: This is a test project designed to validate EAS integration with React Native CLI. For production applications, consider using Expo managed workflow or follow React Native best practices for project structure and architecture.