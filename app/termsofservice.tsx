import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

export default function TermsOfServiceScreen() {
  // Google Drive PDF URL
  const pdfUrl = 'https://drive.google.com/file/d/1XNMUbWSHO2KzRiJy6210QbHxXpoPsLn9/view?usp=drive_link';
  
  // Format the URL for embedding
  const embedUrl = pdfUrl.replace('/view?usp=drive_link', '/preview');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>

      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri: embedUrl }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading Terms of Service...</Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
          }}
        />
      </View>

      {Platform.OS === 'web' && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            If you're having trouble viewing the document, you can 
            <TouchableOpacity 
              onPress={() => window.open(pdfUrl, '_blank')}
            >
              <Text style={styles.linkText}> open it directly </Text>
            </TouchableOpacity>
            in a new tab.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
  },
  webViewContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 8,
    margin: 16,
    backgroundColor: Colors.backgroundCard,
  },
  webView: {
    flex: 1,
    borderRadius: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    textAlign: 'center',
  },
  linkText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
    textDecorationLine: 'underline',
  },
});