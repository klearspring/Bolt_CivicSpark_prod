import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { X, Users, MapPin, Hash, Plus } from 'lucide-react-native';

interface Circle {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  radius: string;
  category: 'general' | 'housing' | 'safety' | 'environment' | 'schools';
  recentActivity: string;
  isJoined: boolean;
}

interface CreateCircleModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateCircle: (circle: Omit<Circle, 'id' | 'memberCount' | 'recentActivity' | 'isJoined'>) => void;
}

const categoryOptions = [
  { value: 'general', label: 'General Discussion', color: '#6B7280', icon: Hash },
  { value: 'housing', label: 'Housing & Development', color: '#EA580C', icon: MapPin },
  { value: 'safety', label: 'Safety & Security', color: '#DC2626', icon: Users },
  { value: 'environment', label: 'Environment & Parks', color: '#059669', icon: MapPin },
  { value: 'schools', label: 'Schools & Education', color: '#7C3AED', icon: Users },
] as const;

const radiusOptions = [
  { value: '0.25 miles', label: '0.25 miles (2-3 blocks)' },
  { value: '0.5 miles', label: '0.5 miles (neighborhood)' },
  { value: '1 mile', label: '1 mile (local area)' },
  { value: '2 miles', label: '2 miles (district)' },
  { value: '3 miles', label: '3 miles (wider community)' },
] as const;

export default function CreateCircleModal({ visible, onClose, onCreateCircle }: CreateCircleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general' as const,
    radius: '0.5 miles' as const,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Circle name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 300) {
      newErrors.description = 'Description must be less than 300 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const newCircle = {
      ...formData,
    };

    onCreateCircle(newCircle);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      category: 'general',
      radius: '0.5 miles',
    });
    setErrors({});
    
    onClose();

    // Show success feedback
    if (Platform.OS !== 'web') {
      Alert.alert('Success', 'Circle created successfully! You are now the first member.');
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const selectedCategory = categoryOptions.find(cat => cat.value === formData.category);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Circle</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Circle Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Circle Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="e.g., Downtown Residents, Oak Street Neighbors"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              maxLength={50}
            />
            <Text style={styles.characterCount}>{formData.name.length}/50</Text>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe the purpose of this circle and what topics members will discuss. Be specific about the community area or issues you want to address..."
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              maxLength={300}
            />
            <Text style={styles.characterCount}>{formData.description.length}/300</Text>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Category Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.helperText}>Choose the primary focus area for your circle</Text>
            <View style={styles.categoryGrid}>
              {categoryOptions.map((category) => {
                const IconComponent = category.icon;
                const isSelected = formData.category === category.value;
                
                return (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryOption,
                      isSelected && styles.categoryOptionSelected,
                      { borderColor: category.color }
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: category.value }))}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                      <IconComponent size={20} color={category.color} />
                    </View>
                    <Text style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextSelected
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Radius Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Geographic Radius</Text>
            <Text style={styles.helperText}>How large should your circle's coverage area be?</Text>
            <View style={styles.radiusContainer}>
              {radiusOptions.map((radius) => (
                <TouchableOpacity
                  key={radius.value}
                  style={[
                    styles.radiusOption,
                    formData.radius === radius.value && styles.radiusOptionSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, radius: radius.value }))}
                >
                  <View style={styles.radiusHeader}>
                    <View style={[
                      styles.radiusIndicator,
                      formData.radius === radius.value && styles.radiusIndicatorSelected
                    ]} />
                    <Text style={[
                      styles.radiusLabel,
                      formData.radius === radius.value && styles.radiusLabelSelected
                    ]}>
                      {radius.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview Card */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={[styles.categoryIndicator, { backgroundColor: selectedCategory?.color }]} />
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>
                    {formData.name || 'Your Circle Name'}
                  </Text>
                  <Text style={styles.previewDescription}>
                    {formData.description || 'Your circle description will appear here...'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.previewStats}>
                <View style={styles.previewStatItem}>
                  <Users size={16} color="#6B7280" />
                  <Text style={styles.previewStatText}>1 member (you)</Text>
                </View>
                <View style={styles.previewStatItem}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.previewStatText}>{formData.radius} radius</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Circle Guidelines</Text>
            <View style={styles.guideline}>
              <Text style={styles.guidelineBullet}>•</Text>
              <Text style={styles.guidelineText}>Keep discussions respectful and focused on local community issues</Text>
            </View>
            <View style={styles.guideline}>
              <Text style={styles.guidelineBullet}>•</Text>
              <Text style={styles.guidelineText}>Welcome neighbors from all backgrounds and perspectives</Text>
            </View>
            <View style={styles.guideline}>
              <Text style={styles.guidelineBullet}>•</Text>
              <Text style={styles.guidelineText}>Focus on constructive solutions and community building</Text>
            </View>
            <View style={styles.guideline}>
              <Text style={styles.guidelineBullet}>•</Text>
              <Text style={styles.guidelineText}>Avoid partisan politics and personal attacks</Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Circle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 6,
  },
  helperText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    marginTop: 4,
  },
  categoryGrid: {
    gap: 12,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    flex: 1,
  },
  categoryTextSelected: {
    color: '#111827',
  },
  radiusContainer: {
    gap: 8,
  },
  radiusOption: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  radiusOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F9FF',
  },
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radiusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
  },
  radiusIndicatorSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  radiusLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  radiusLabelSelected: {
    color: '#111827',
  },
  previewContainer: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  previewDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewStatText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 6,
  },
  guidelinesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guidelinesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  guideline: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  guidelineBullet: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginRight: 8,
    width: 12,
  },
  guidelineText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});