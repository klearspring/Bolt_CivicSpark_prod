import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Save, Loader } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

export default function EditProfileScreen() {
  const { user, updateProfile, isLoading, isDemoMode } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    phoneNumber: '',
    email: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    avatar: '',
    emailNotifications: false,
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data with user information
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        location: {
          address: user.location?.address || '',
          city: user.location?.city || '',
          state: user.location?.state || '',
          zipCode: user.location?.zipCode || '',
        },
        avatar: user.avatar || '',
        emailNotifications: user.preferences?.notifications?.email || false,
      });
    }
  }, [user]);

  // Track changes
  useEffect(() => {
    if (user) {
      const hasFormChanges = 
        formData.firstName !== (user.firstName || '') ||
        formData.lastName !== (user.lastName || '') ||
        formData.displayName !== (user.displayName || '') ||
        formData.phoneNumber !== (user.phoneNumber || '') ||
        formData.location.address !== (user.location?.address || '') ||
        formData.location.city !== (user.location?.city || '') ||
        formData.location.state !== (user.location?.state || '') ||
        formData.location.zipCode !== (user.location?.zipCode || '') ||
        formData.avatar !== (user.avatar || '') ||
        formData.emailNotifications !== (user.preferences?.notifications?.email || false);
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, user]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (formData.location.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.location.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePicker = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setFormData(prev => ({ ...prev, avatar: imageUri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleCameraCapture = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setFormData(prev => ({ ...prev, avatar: imageUri }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      // On web, only show gallery option
      handleImagePicker();
    } else {
      // On mobile, show both options
      Alert.alert(
        'Update Profile Photo',
        'Choose how you\'d like to update your profile photo',
        [
          { text: 'Camera', onPress: handleCameraCapture },
          { text: 'Photo Library', onPress: handleImagePicker },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updates = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber || undefined,
        location: formData.location,
        avatar: formData.avatar || undefined,
        preferences: {
          ...user?.preferences,
          notifications: {
            ...user?.preferences?.notifications,
            email: formData.emailNotifications,
          },
        },
      };

      await updateProfile(updates);
      
      // Show success message
      if (Platform.OS !== 'web') {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <ArrowLeft size={24} color={Colors.textHeading} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={[styles.saveButton, (!hasChanges || isSubmitting) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!hasChanges || isSubmitting}
          >
            {isSubmitting ? (
              <Loader size={20} color={hasChanges ? Colors.secondaryDark : Colors.textMuted} />
            ) : (
              <Save size={20} color={hasChanges ? Colors.secondaryDark : Colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Demo Mode Notice */}
          {isDemoMode && (
            <View style={styles.demoNotice}>
              <Text style={styles.demoTitle}>🎭 Demo Mode</Text>
              <Text style={styles.demoText}>
                Changes will be saved locally for this demo session only.
              </Text>
            </View>
          )}

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Text style={styles.sectionTitle}>Profile Photo</Text>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                {formData.avatar ? (
                  <Image source={{ uri: formData.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={40} color={Colors.textMuted} />
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.cameraButton}
                  onPress={showImageOptions}
                >
                  <Camera size={16} color={Colors.secondaryDark} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.changePhotoButton}
                onPress={showImageOptions}
              >
                <Text style={styles.changePhotoText}>
                  {Platform.OS === 'web' ? 'Choose Photo' : 'Change Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
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
                    editable={!isSubmitting}
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
                    editable={!isSubmitting}
                  />
                </View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name *</Text>
              <View style={[styles.inputContainer, errors.displayName && styles.inputError]}>
                <User size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="How others see your name"
                  placeholderTextColor={Colors.textMuted}
                  value={formData.displayName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                  editable={!isSubmitting}
                />
              </View>
              {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputContainer, errors.phoneNumber && styles.inputError]}>
                <Phone size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor={Colors.textMuted}
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                  keyboardType="phone-pad"
                  editable={!isSubmitting}
                />
              </View>
              {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={formData.email}
                  editable={false}
                />
              </View>
              <Text style={styles.helperText}>
                Email cannot be changed here. Contact support if needed.
              </Text>
            </View>

            <View style={styles.notificationGroup}>
              <View style={styles.notificationHeader}>
                <Text style={styles.label}>Email Notifications</Text>
                <TouchableOpacity
                  style={styles.toggle}
                  onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    emailNotifications: !prev.emailNotifications 
                  }))}
                  disabled={isSubmitting}
                >
                  <View style={[
                    styles.toggleTrack, 
                    formData.emailNotifications && styles.toggleTrackActive
                  ]}>
                    <View style={[
                      styles.toggleThumb,
                      formData.emailNotifications && styles.toggleThumbActive
                    ]} />
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>
                Receive community updates and achievement notifications via email
              </Text>
            </View>
          </View>

          {/* Location Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address</Text>
              <View style={styles.inputContainer}>
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
                  editable={!isSubmitting}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
                <Text style={styles.label}>City</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    placeholderTextColor={Colors.textMuted}
                    value={formData.location.city}
                    onChangeText={(text) => setFormData(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, city: text }
                    }))}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>State</Text>
                <View style={styles.inputContainer}>
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
                    editable={!isSubmitting}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ZIP Code</Text>
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
                  editable={!isSubmitting}
                />
              </View>
              {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
            </View>

            <View style={styles.locationNote}>
              <Text style={styles.locationNoteText}>
                📍 Your location helps us connect you with nearby civic opportunities and neighborhood circles.
              </Text>
            </View>
          </View>

          {/* Save Button (Mobile) */}
          <View style={styles.mobileActions}>
            <TouchableOpacity
              style={[styles.saveButtonLarge, (!hasChanges || isSubmitting) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!hasChanges || isSubmitting}
            >
              {isSubmitting ? (
                <Loader size={20} color={hasChanges ? Colors.secondaryDark : Colors.textMuted} />
              ) : (
                <Save size={20} color={hasChanges ? Colors.secondaryDark : Colors.textMuted} />
              )}
              <Text style={[
                styles.saveButtonText,
                (!hasChanges || isSubmitting) && styles.saveButtonTextDisabled
              ]}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.backgroundLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  demoNotice: {
    backgroundColor: Colors.warning + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  demoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 16,
  },
  avatarSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundLight,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.backgroundCard,
  },
  changePhotoButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changePhotoText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
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
  disabledInput: {
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.error,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    marginTop: 4,
  },
  notificationGroup: {
    marginBottom: 20,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggle: {
    padding: 4,
  },
  toggleTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
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
  mobileActions: {
    marginTop: 32,
    marginBottom: 40,
  },
  saveButtonLarge: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
    marginLeft: 8,
  },
  saveButtonTextDisabled: {
    color: Colors.textMuted,
  },
});