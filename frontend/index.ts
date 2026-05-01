import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import React from 'react';
import { View, Text } from 'react-native';

class RootErrorBoundary extends React.Component<any, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('ROOT FATAL CRASH CAUGHT:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'red' }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>CRITICAL CRASH</Text>
          <Text style={{ color: 'white', textAlign: 'center', marginBottom: 10 }}>{this.state.error?.message}</Text>
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 10 }}>{this.state.error?.stack}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function Root() {
  try {
    // Dynamically require App so that module evaluation errors are caught
    const App = require('./App').default;
    return (
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    );
  } catch (e: any) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'red' }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>IMPORT CRASH</Text>
        <Text style={{ color: 'white', textAlign: 'center' }}>{e?.message}</Text>
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 10 }}>{e?.stack}</Text>
      </View>
    );
  }
}

registerRootComponent(Root);
