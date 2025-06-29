import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

export default function TermsOfServiceScreen() {
  // Google Drive PDF URL
  const pdfUrl = 'https://drive.google.com/file/d/1XNMUbWSHO2KzRiJy6210QbHxXpoPsLn9/view?usp=drive_link';
  
  // Format the URL for embedding
  const embedUrl = pdfUrl.replace('/view?usp=drive_link', '/preview');

  // Function to open the PDF in a new tab (web) or browser (mobile)
  const openPdf = () => {
    if (Platform.OS === 'web') {
      window.open(pdfUrl, '_blank');
    } else {
      Linking.openURL(pdfUrl);
    }
  };

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

      {Platform.OS === 'web' ? (
        // Web-specific content
        <View style={styles.webContent}>
          <View style={styles.pdfIconContainer}>
            <FileText size={64} color={Colors.primary} />
          </View>
          
          <Text style={styles.webTitle}>CivicSpark Terms of Service</Text>
          
          <Text style={styles.webDescription}>
            Our Terms of Service outline the rules, guidelines, and agreements that govern your use of CivicSpark's platform and services.
          </Text>
          
          <TouchableOpacity 
            style={styles.openButton}
            onPress={openPdf}
          >
            <ExternalLink size={20} color={Colors.secondaryDark} />
            <Text style={styles.openButtonText}>Open Terms of Service</Text>
          </TouchableOpacity>
          
          <Text style={styles.webNote}>
            The document will open in a new browser tab where you can read, download, or print it.
          </Text>
        </View>
      ) : (
        // Native mobile content with WebView
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
          
          <TouchableOpacity 
            style={styles.mobileOpenButton}
            onPress={openPdf}
          >
            <Text style={styles.mobileOpenButtonText}>Open in Browser</Text>
          </TouchableOpacity>
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
  // WebView styles for mobile
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
  mobileOpenButton: {
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  mobileOpenButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
  },
  // Web-specific styles
  webContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  pdfIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  webTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 16,
    textAlign: 'center',
  },
  webDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  openButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  openButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
    marginLeft: 8,
  },
  webNote: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 400,
  },
});