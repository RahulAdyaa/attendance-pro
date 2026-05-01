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
      return React.createElement(View, { style: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'red' } },
        React.createElement(Text, { style: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 } }, "CRITICAL CRASH"),
        React.createElement(Text, { style: { color: 'white', textAlign: 'center', marginBottom: 10 } }, this.state.error?.message),
        React.createElement(Text, { style: { color: 'white', textAlign: 'center', fontSize: 10 } }, this.state.error?.stack)
      );
    }
    return this.props.children;
  }
}

function Root() {
  try {
    const App = require('./App').default;
    return React.createElement(RootErrorBoundary, null, React.createElement(App));
  } catch (e: any) {
    return React.createElement(View, { style: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'red' } },
      React.createElement(Text, { style: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 } }, "IMPORT CRASH"),
      React.createElement(Text, { style: { color: 'white', textAlign: 'center' } }, e?.message),
      React.createElement(Text, { style: { color: 'white', textAlign: 'center', fontSize: 10 } }, e?.stack)
    );
  }
}

registerRootComponent(Root);
