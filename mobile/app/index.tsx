import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator, BackHandler, Text, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
    const webViewRef = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // TARGET URLS
    const LOCAL_URL = 'http://172.16.148.245:5173/';
    const LIVE_URL = 'https://sec-track-pro.vercel.app/';

    const [url, setUrl] = useState(LOCAL_URL);

    // Handle hardware back button for Android
    useEffect(() => {
        if (Platform.OS === 'web') return;

        const onBackPress = () => {
            if (webViewRef.current) {
                webViewRef.current.goBack();
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, []);

    const handleReload = () => {
        setError(null);
        setLoading(true);
        if (Platform.OS === 'web') {
            window.location.reload();
        } else {
            webViewRef.current?.reload();
        }
    };

    const toggleMode = () => {
        const nextUrl = url === LIVE_URL ? LOCAL_URL : LIVE_URL;
        setUrl(nextUrl);
        setLoading(true);
    };

    // RENDER FOR WEB (Browser testing)
    if (Platform.OS === 'web') {
        return (
            <View style={styles.webContainer}>
                <Text style={styles.webTitle}>MOBILE PREVIEW MODE</Text>
                <Text style={styles.webSub}>Running in Browser. For a native experience, scan the QR code on your phone.</Text>

                <View style={styles.iframeContainer}>
                    <iframe
                        src={url}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        onLoad={() => setLoading(false)}
                    />
                </View>

                <TouchableOpacity style={styles.webToggle} onPress={toggleMode}>
                    <Text style={styles.toggleBtnText}>
                        SWITCH TO {url === LIVE_URL ? 'LOCAL' : 'LIVE'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // RENDER FOR NATIVE (Android/iOS)
    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1 }}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: url }}
                    style={styles.webview}
                    onLoadStart={() => {
                        setLoading(true);
                        setError(null);
                    }}
                    onLoadEnd={() => setLoading(false)}
                    onError={(syntheticEvent: any) => {
                        const { nativeEvent } = syntheticEvent;
                        setError(nativeEvent.description || 'Connection Failed');
                        setLoading(false);
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                />

                {loading && (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text style={styles.loaderText}>Establishing Secure Link...</Text>
                        <Text style={styles.urlHint}>{url}</Text>

                        <TouchableOpacity style={styles.skipBtn} onPress={() => setLoading(false)}>
                            <Text style={styles.skipBtnText}>FORCE SHOW TERMINAL</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorTitle}>CONNECTION BREACH</Text>
                        <Text style={styles.errorText}>Handshake failed. Ensure Vite is running with host:true.</Text>

                        <TouchableOpacity style={styles.retryBtn} onPress={handleReload}>
                            <Text style={styles.retryBtnText}>RETRY CONNECTION</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toggleBtn} onPress={toggleMode}>
                            <Text style={styles.toggleBtnText}>
                                SWITCH TO {url === LIVE_URL ? 'LOCAL DEV' : 'LIVE PROD'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E293B',
    },
    webContainer: {
        flex: 1,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        padding: 20,
    },
    webTitle: {
        color: '#2563eb',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 2,
    },
    webSub: {
        color: '#64748b',
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 12,
        maxWidth: 400,
    },
    iframeContainer: {
        width: 375,
        height: 667,
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 6,
        borderColor: '#1e293b',
    },
    webToggle: {
        marginTop: 15,
        backgroundColor: '#2563eb',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
    },
    webview: {
        flex: 1,
    },
    loader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        zIndex: 10,
    },
    loaderText: {
        color: 'white',
        marginTop: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    urlHint: {
        color: '#64748b',
        fontSize: 10,
        marginTop: 4,
    },
    skipBtn: {
        marginTop: 40,
        padding: 10,
    },
    skipBtnText: {
        color: '#2563eb',
        fontSize: 12,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 40,
        zIndex: 20,
    },
    errorTitle: {
        color: '#ef4444',
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 8,
    },
    errorText: {
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
    },
    retryBtn: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 32,
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 16,
        width: '100%',
        alignItems: 'center',
    },
    retryBtnText: {
        color: 'white',
        fontWeight: '800',
    },
    toggleBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 32,
        paddingVertical: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    toggleBtnText: {
        color: '#94a3b8',
        fontWeight: '700',
    },
});
