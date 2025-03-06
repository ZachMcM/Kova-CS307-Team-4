//TODO add mock native modules in here

import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-font');
jest.mock('expo-asset');
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    clear: jest.fn()
}));