import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowLeft, Loader, Calendar } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/types/auth';
import SocialLoginButtons from '@/components/SocialLoginButtons';

export default function SignUpScreen() {
  const { signUp, signInWithSocial, isLoading, error, clearError } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    agreeToTerms: false,
    agreeToPrivacy: false,
    subscribeToNewsletter: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      // Personal Information
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    } else if (step === 2) {
      // Location Information
      if (!formData.location.address.trim()) {
        newErrors.address = 'Address is required';
      }
      if (!formData.location.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.location.state.trim()) {
        newErrors.state = 'State is required';
      }
      if (!formData.location.zipCode.trim()) {
        newErrors.zipCode = 'ZIP code is required';
      } else if (!/^\d{5}(-\d{4})?$/.test(formData.location.zipCode)) {
        newErrors.zipCode = 'Please enter a valid ZIP code';
      }
    } else if (step === 3) {
      // Security & Terms
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the Terms of Service';
      }
      if (!formData.agreeToPrivacy) {
        newErrors.agreeToPrivacy = 'You must agree to the Privacy Policy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSignUp = async () => {
    clearError();
    
    if (!validateStep(3)) {
      return;
    }

    try {
      const result = await signUp(formData);
      
      if (result.needsVerification) {
        // Redirect to email verification screen
        router.replace('/(auth)/verify-email');
      } else {
        // User is signed up and logged in
        router.replace('/(tabs)');
      }
    } catch (error) {
      // Error is handled by the context, but we can show user-friendly messages
      console.error('Sign up error:', error);
      
      // Don't show alert on web, the error will be displayed in the UI
      if (Platform.OS !== 'web') {
        const errorMessage = error instanceof Error ? error.message : 'Please check your information and try again.';
        Alert.alert('Sign Up Failed', errorMessage);
      }
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    clearError();
    
    try {
      await signInWithSocial(provider);
      router.replace('/(tabs)');
    } catch (error) {
      // Error is handled by the context
      if (Platform.OS !== 'web') {
        Alert.alert(
          `${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign In Failed`,
          'Please try again or use a different sign-in method.'
        );
      }
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepIndicatorContainer}>
          <View style={[
            styles.stepCircle,
            step <= currentStep && styles.stepCircleActive,
            step < currentStep && styles.stepCircleCompleted
          ]}>
            <Text style={[
              styles.stepNumber,
              step <= currentStep && styles.stepNumberActive
            ]}>
              {step}
            </Text>
          </View>
          {step < 3 && (
            <View style={[
              styles.stepLine,
              step < currentStep && styles.stepLineCompleted
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

      {/* Social Login Options */}
      <View style={styles.socialLoginSection}>
        <Text style={styles.socialLoginTitle}>Quick Sign Up</Text>
        <SocialLoginButtons
          onGoogleSignIn={() => handleSocialSignIn('google')}
          onAppleSignIn={() => handleSocialSignIn('apple')}
          isLoading={isLoading}
        />
        
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with email</Text>
          <View style={styles.dividerLine} />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>First Name *</Text>
          <View style={[styles.inputContainer, errors.firstName && styles.inputError]}>
            <User size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor={Colors.textMuted}
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
              editable={!isLoading}
            />
          </View>
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Last Name *</Text>
          <View style={[styles.inputContainer, errors.lastName && styles.inputError]}>
            <User size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Last name"
              placeholderTextColor={Colors.textMuted}
              value={formData.lastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
              editable={!isLoading}
            />
          </View>
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address *</Text>
        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
          <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={Colors.textMuted}
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text.toLowerCase().trim() }))}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number (Optional)</Text>
        <View style={[styles.inputContainer, errors.phoneNumber && styles.inputError]}>
          <Phone size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor={Colors.textMuted}
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location Information</Text>
      <Text style={styles.stepSubtitle}>Help us connect you with your local community</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Street Address *</Text>
        <View style={[styles.inputContainer, errors.address && styles.inputError]}>
          <MapPin size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="123 Main Street"
            placeholderTextColor={Colors.textMuted}
            value={formData.location.address}
            onChangeText={(text) => setFormData(prev => ({ 
              ...prev, 
              location: { ...prev.location, address: text }
            }))}
            editable={!isLoading}
          />
        </View>
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
          <Text style={styles.label}>City *</Text>
          <View style={[styles.inputContainer, errors.city && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor={Colors.textMuted}
              value={formData.location.city}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                location: { ...prev.location, city: text }
              }))}
              editable={!isLoading}
            />
          </View>
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>State *</Text>
          <View style={[styles.inputContainer, errors.state && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="CA"
              placeholderTextColor={Colors.textMuted}
              value={formData.location.state}
              onChangeText={(text) => setFormData(prev => ({ 
                ...prev, 
                location: { ...prev.location, state: text.toUpperCase() }
              }))}
              maxLength={2}
              autoCapitalize="characters"
              editable={!isLoading}
            />
          </View>
          {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>ZIP Code *</Text>
        <View style={[styles.inputContainer, errors.zipCode && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="12345"
            placeholderTextColor={Colors.textMuted}
            value={formData.location.zipCode}
            onChangeText={(text) => setFormData(prev => ({ 
              ...prev, 
              location: { ...prev.location, zipCode: text }
            }))}
            keyboardType="numeric"
            maxLength={10}
            editable={!isLoading}
          />
        </View>
        {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
      </View>

      <View style={styles.locationNote}>
        <Text style={styles.locationNoteText}>
          📍 Your location helps us connect you with nearby civic opportunities and neighborhood circles. We respect your privacy and you can adjust location sharing settings anytime.
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Security & Terms</Text>
      <Text style={styles.stepSubtitle}>Secure your account and review our policies</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password *</Text>
        <View style={[styles.inputContainer, errors.password && styles.inputError]}>
          <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Create a strong password"
            placeholderTextColor={Colors.textMuted}
            value={formData.password}
            onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
            secureTextEntry={!showPassword}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={Colors.textMuted} />
            ) : (
              <Eye size={20} color={Colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password *</Text>
        <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
          <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor={Colors.textMuted}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
            secureTextEntry={!showConfirmPassword}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color={Colors.textMuted} />
            ) : (
              <Eye size={20} color={Colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementsTitle}>Password Requirements:</Text>
        <Text style={styles.requirementItem}>• At least 8 characters</Text>
        <Text style={styles.requirementItem}>• One uppercase letter</Text>
        <Text style={styles.requirementItem}>• One lowercase letter</Text>
        <Text style={styles.requirementItem}>• One number</Text>
      </View>

      <View style={styles.termsSection}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, agreeToTerms: !prev.agreeToTerms }))}
        >
          <View style={[styles.checkbox, formData.agreeToTerms && styles.checkboxChecked]}>
            {formData.agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            I agree to the <Text style={styles.linkText}>Terms of Service</Text> *
          </Text>
        </TouchableOpacity>
        {errors.agreeToTerms && <Text style={styles.errorText}>{errors.agreeToTerms}</Text>}

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, agreeToPrivacy: !prev.agreeToPrivacy }))}
        >
          <View style={[styles.checkbox, formData.agreeToPrivacy && styles.checkboxChecked]}>
            {formData.agreeToPrivacy && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            I agree to the <Text style={styles.linkText}>Privacy Policy</Text> *
          </Text>
        </TouchableOpacity>
        {errors.agreeToPrivacy && <Text style={styles.errorText}>{errors.agreeToPrivacy}</Text>}

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData(prev => ({ ...prev, subscribeToNewsletter: !prev.subscribeToNewsletter }))}
        >
          <View style={[styles.checkbox, formData.subscribeToNewsletter && styles.checkboxChecked]}>
            {formData.subscribeToNewsletter && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            Subscribe to community updates and newsletters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Email Verification Notice */}
      <View style={styles.verificationNotice}>
        <Text style={styles.verificationTitle}>📧 Email Verification</Text>
        <Text style={styles.verificationText}>
          After creating your account, you may need to verify your email address to access all features. Check your inbox for a verification link.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => currentStep > 1 ? handleBack() : router.back()}
            >
              <ArrowLeft size={24} color={Colors.textHeading} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Join CivicSpark</Text>
            <Text style={styles.headerSubtitle}>
              Create your account to start making a difference
            </Text>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              {error.includes('already exists') && (
                <TouchableOpacity 
                  style={styles.signInLinkButton}
                  onPress={() => router.push('/(auth)/sign-in')}
                >
                  <Text style={styles.signInLinkButtonText}>Go to Sign In</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {currentStep < 3 ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                disabled={isLoading}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader size={20} color={Colors.secondaryDark} />
                ) : (
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    borderColor: Colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textMuted,
  },
  stepNumberActive: {
    color: Colors.primary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: Colors.primary,
  },
  errorContainer: {
    backgroundColor: Colors.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  signInLinkButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  signInLinkButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
  },
  stepContent: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 24,
    marginBottom: 24,
  },
  socialLoginSection: {
    marginBottom: 24,
  },
  socialLoginTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    marginHorizontal: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textHeading,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.error,
    marginTop: 4,
  },
  locationNote: {
    backgroundColor: Colors.info + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.info + '40',
  },
  locationNoteText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 18,
  },
  passwordRequirements: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    marginBottom: 2,
  },
  termsSection: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: Colors.secondaryDark,
    fontFamily: 'Inter-Bold',
  },
  checkboxText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    flex: 1,
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  verificationNotice: {
    backgroundColor: Colors.warning + '20',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  verificationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 6,
  },
  verificationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 16,
  },
  navigationButtons: {
    marginBottom: 24,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  signInText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
  },
  signInLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
});