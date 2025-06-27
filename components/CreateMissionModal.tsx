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
import { X, MapPin, Clock, Users, Award, Target, Globe, ChevronDown } from 'lucide-react-native';

interface Mission {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  participants: number;
  points: number;
  category: 'community' | 'government' | 'environment' | 'education';
  difficulty: 'easy' | 'medium' | 'hard';
  completed?: boolean;
  targetType: 'neighborhood' | 'circle';
  targetId?: string;
  targetName: string;
}

interface Circle {
  id: string;
  name: string;
  memberCount: number;
}

interface CreateMissionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateMission: (mission: Omit<Mission, 'id' | 'participants' | 'completed'>) => void;
  circles?: Circle[];
}

const categoryOptions = [
  { value: 'community', label: 'Community', color: '#EA580C' },
  { value: 'government', label: 'Government', color: '#2563EB' },
  { value: 'environment', label: 'Environment', color: '#059669' },
  { value: 'education', label: 'Education', color: '#7C3AED' },
] as const;

const difficultyOptions = [
  { value: 'easy', label: 'Easy (1-2 hours)', points: 25 },
  { value: 'medium', label: 'Medium (2-4 hours)', points: 50 },
  { value: 'hard', label: 'Hard (4+ hours)', points: 75 },
] as const;

const targetTypeOptions = [
  { 
    value: 'neighborhood', 
    label: 'Entire Neighborhood', 
    description: 'Visible to all neighbors in your area',
    icon: Globe,
    color: '#2563EB' 
  },
  { 
    value: 'circle', 
    label: 'Specific Circle', 
    description: 'Only visible to members of a chosen circle',
    icon: Users,
    color: '#059669' 
  },
] as const;

export default function CreateMissionModal({ 
  visible, 
  onClose, 
  onCreateMission,
  circles = []
}: CreateMissionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration: '',
    category: 'community' as const,
    difficulty: 'easy' as const,
    targetType: 'neighborhood' as const,
    targetId: '',
  });

  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Mission title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    if (formData.targetType === 'circle' && !formData.targetId) {
      newErrors.target = 'Please select a circle';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTargetName = () => {
    if (formData.targetType === 'neighborhood') {
      return 'Entire Neighborhood';
    }
    
    if (formData.targetType === 'circle') {
      const circle = circles.find(c => c.id === formData.targetId);
      return circle ? circle.name : 'Select Circle';
    }
    
    return '';
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const selectedDifficulty = difficultyOptions.find(d => d.value === formData.difficulty);
    const points = selectedDifficulty?.points || 25;

    const newMission = {
      ...formData,
      points,
      targetName: getTargetName(),
    };

    onCreateMission(newMission);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      location: '',
      duration: '',
      category: 'community',
      difficulty: 'easy',
      targetType: 'neighborhood',
      targetId: '',
    });
    setErrors({});
    
    onClose();

    // Show success feedback
    if (Platform.OS !== 'web') {
      Alert.alert('Success', 'Mission created successfully!');
    }
  };

  const handleClose = () => {
    setErrors({});
    setShowTargetPicker(false);
    onClose();
  };

  const handleTargetTypeChange = (type: 'neighborhood' | 'circle') => {
    setFormData(prev => ({ 
      ...prev, 
      targetType: type,
      targetId: type === 'neighborhood' ? '' : prev.targetId
    }));
    setShowTargetPicker(type === 'circle');
  };

  const renderTargetPicker = () => {
    if (!showTargetPicker || formData.targetType !== 'circle') return null;

    return (
      <View style={styles.targetPicker}>
        <Text style={styles.pickerTitle}>Select Circle</Text>
        <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
          {circles.map((circle) => (
            <TouchableOpacity
              key={circle.id}
              style={[
                styles.pickerItem,
                formData.targetId === circle.id && styles.pickerItemSelected
              ]}
              onPress={() => {
                setFormData(prev => ({ ...prev, targetId: circle.id }));
                setShowTargetPicker(false);
              }}
            >
              <View style={styles.pickerItemContent}>
                <Text style={[
                  styles.pickerItemText,
                  formData.targetId === circle.id && styles.pickerItemTextSelected
                ]}>
                  {circle.name}
                </Text>
                <Text style={styles.memberCount}>{circle.memberCount} members</Text>
              </View>
            </TouchableOpacity>
          ))}
          {circles.length === 0 && (
            <View style={styles.emptyPicker}>
              <Text style={styles.emptyPickerText}>
                You need to join circles first to create circle-specific missions.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Mission</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Mission Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mission Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g., Attend City Council Meeting"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              maxLength={100}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe what participants will do and why it matters for the community..."
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{formData.description.length}/500</Text>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Target Audience */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Target Audience *</Text>
            <Text style={styles.helperText}>Choose who can see and participate in this mission</Text>
            <View style={styles.targetTypeContainer}>
              {targetTypeOptions.map((type) => {
                const IconComponent = type.icon;
                const isSelected = formData.targetType === type.value;
                
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.targetTypeOption,
                      isSelected && styles.targetTypeOptionSelected,
                      { borderColor: type.color }
                    ]}
                    onPress={() => handleTargetTypeChange(type.value)}
                  >
                    <View style={[styles.targetTypeIcon, { backgroundColor: type.color + '20' }]}>
                      <IconComponent size={20} color={type.color} />
                    </View>
                    <View style={styles.targetTypeInfo}>
                      <Text style={[
                        styles.targetTypeLabel,
                        isSelected && { color: type.color }
                      ]}>
                        {type.label}
                      </Text>
                      <Text style={styles.targetTypeDescription}>
                        {type.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Circle Selection */}
          {formData.targetType === 'circle' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Circle *</Text>
              <TouchableOpacity
                style={[
                  styles.targetSelector,
                  errors.target && styles.inputError
                ]}
                onPress={() => setShowTargetPicker(!showTargetPicker)}
              >
                <Text style={[
                  styles.targetSelectorText,
                  !formData.targetId && styles.placeholderText
                ]}>
                  {getTargetName()}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
              {errors.target && <Text style={styles.errorText}>{errors.target}</Text>}
            </View>
          )}

          {/* Target Picker */}
          {renderTargetPicker()}

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={[styles.inputWithIconText, errors.location && styles.inputError]}
                placeholder="e.g., City Hall, Downtown"
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                maxLength={100}
              />
            </View>
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          {/* Duration */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Duration *</Text>
            <View style={styles.inputWithIcon}>
              <Clock size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={[styles.inputWithIconText, errors.duration && styles.inputError]}
                placeholder="e.g., 2 hours, 90 minutes"
                value={formData.duration}
                onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
                maxLength={50}
              />
            </View>
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
          </View>

          {/* Category Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {categoryOptions.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryOption,
                    formData.category === category.value && styles.categoryOptionSelected,
                    { borderColor: category.color }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, category: category.value }))}
                >
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <Text style={[
                    styles.categoryText,
                    formData.category === category.value && styles.categoryTextSelected
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Difficulty Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Difficulty & Points</Text>
            <View style={styles.difficultyContainer}>
              {difficultyOptions.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty.value}
                  style={[
                    styles.difficultyOption,
                    formData.difficulty === difficulty.value && styles.difficultyOptionSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, difficulty: difficulty.value }))}
                >
                  <View style={styles.difficultyHeader}>
                    <Text style={[
                      styles.difficultyLabel,
                      formData.difficulty === difficulty.value && styles.difficultyLabelSelected
                    ]}>
                      {difficulty.label}
                    </Text>
                    <View style={styles.pointsBadge}>
                      <Award size={12} color="#2563EB" />
                      <Text style={styles.pointsText}>{difficulty.points} pts</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Mission Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryOptions.find(c => c.value === formData.category)?.color }]}>
                  <Text style={styles.categoryBadgeText}>{formData.category.toUpperCase()}</Text>
                </View>
                <View style={styles.targetBadge}>
                  <Text style={styles.targetBadgeText}>📍 {getTargetName()}</Text>
                </View>
              </View>
              <Text style={styles.previewMissionTitle}>
                {formData.title || 'Your mission title...'}
              </Text>
              <Text style={styles.previewDescription}>
                {formData.description || 'Your mission description will appear here...'}
              </Text>
              <View style={styles.previewDetails}>
                <Text style={styles.previewDetailText}>
                  📍 {formData.location || 'Location'}
                </Text>
                <Text style={styles.previewDetailText}>
                  ⏱️ {formData.duration || 'Duration'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
            <Target size={16} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Mission</Text>
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
    marginBottom: 8,
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
  targetTypeContainer: {
    gap: 12,
  },
  targetTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  targetTypeOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  targetTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  targetTypeInfo: {
    flex: 1,
  },
  targetTypeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 2,
  },
  targetTypeDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  targetSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  targetSelectorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  targetPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    maxHeight: 200,
  },
  pickerTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerList: {
    maxHeight: 150,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  pickerItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  pickerItemTextSelected: {
    color: '#2563EB',
  },
  memberCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  emptyPicker: {
    padding: 20,
    alignItems: 'center',
  },
  emptyPickerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  inputWithIconText: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minWidth: '45%',
  },
  categoryOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  categoryTextSelected: {
    color: '#111827',
  },
  difficultyContainer: {
    gap: 12,
  },
  difficultyOption: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  difficultyOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F9FF',
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  difficultyLabelSelected: {
    color: '#111827',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginLeft: 4,
  },
  previewContainer: {
    marginBottom: 20,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  targetBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  targetBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  previewMissionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  previewDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  previewDetails: {
    gap: 4,
  },
  previewDetailText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
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