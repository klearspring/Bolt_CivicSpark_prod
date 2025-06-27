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
import { X, Send, Users, User, Globe, ChevronDown } from 'lucide-react-native';

interface Circle {
  id: string;
  name: string;
  memberCount: number;
}

interface Person {
  id: string;
  name: string;
  avatar: string;
}

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePost: (post: {
    content: string;
    recipientType: 'everyone' | 'circle' | 'person';
    recipientId?: string;
    recipientName: string;
  }) => void;
  circles: Circle[];
  people: Person[];
}

const recipientTypes = [
  { value: 'everyone', label: 'Everyone in Neighborhood', icon: Globe, color: '#2563EB' },
  { value: 'circle', label: 'Specific Circle', icon: Users, color: '#059669' },
  { value: 'person', label: 'Direct Message', icon: User, color: '#EA580C' },
] as const;

export default function CreatePostModal({ 
  visible, 
  onClose, 
  onCreatePost, 
  circles, 
  people 
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [recipientType, setRecipientType] = useState<'everyone' | 'circle' | 'person'>('everyone');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!content.trim()) {
      newErrors.content = 'Message content is required';
    } else if (content.length < 10) {
      newErrors.content = 'Message must be at least 10 characters';
    }

    if ((recipientType === 'circle' || recipientType === 'person') && !selectedRecipientId) {
      newErrors.recipient = `Please select a ${recipientType}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getRecipientName = () => {
    if (recipientType === 'everyone') {
      return 'Everyone in Neighborhood';
    }
    
    if (recipientType === 'circle') {
      const circle = circles.find(c => c.id === selectedRecipientId);
      return circle ? circle.name : 'Select Circle';
    }
    
    if (recipientType === 'person') {
      const person = people.find(p => p.id === selectedRecipientId);
      return person ? person.name : 'Select Person';
    }
    
    return '';
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const recipientName = getRecipientName();
    
    onCreatePost({
      content: content.trim(),
      recipientType,
      recipientId: selectedRecipientId || undefined,
      recipientName,
    });
    
    // Reset form
    setContent('');
    setRecipientType('everyone');
    setSelectedRecipientId('');
    setErrors({});
    
    onClose();

    // Show success feedback
    if (Platform.OS !== 'web') {
      Alert.alert('Success', 'Message posted successfully!');
    }
  };

  const handleClose = () => {
    setErrors({});
    setShowRecipientPicker(false);
    onClose();
  };

  const handleRecipientTypeChange = (type: 'everyone' | 'circle' | 'person') => {
    setRecipientType(type);
    setSelectedRecipientId('');
    setShowRecipientPicker(type !== 'everyone');
  };

  const renderRecipientPicker = () => {
    if (!showRecipientPicker) return null;

    const items = recipientType === 'circle' ? circles : people;
    
    return (
      <View style={styles.recipientPicker}>
        <Text style={styles.pickerTitle}>
          Select {recipientType === 'circle' ? 'Circle' : 'Person'}
        </Text>
        <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.pickerItem,
                selectedRecipientId === item.id && styles.pickerItemSelected
              ]}
              onPress={() => {
                setSelectedRecipientId(item.id);
                setShowRecipientPicker(false);
              }}
            >
              <View style={styles.pickerItemContent}>
                <Text style={[
                  styles.pickerItemText,
                  selectedRecipientId === item.id && styles.pickerItemTextSelected
                ]}>
                  {item.name}
                </Text>
                {recipientType === 'circle' && 'memberCount' in item && (
                  <Text style={styles.memberCount}>{item.memberCount} members</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
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
          <Text style={styles.headerTitle}>New Message</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recipient Type Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Send To</Text>
            <View style={styles.recipientTypeContainer}>
              {recipientTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = recipientType === type.value;
                
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.recipientTypeOption,
                      isSelected && styles.recipientTypeOptionSelected,
                      { borderColor: type.color }
                    ]}
                    onPress={() => handleRecipientTypeChange(type.value)}
                  >
                    <IconComponent 
                      size={20} 
                      color={isSelected ? type.color : '#6B7280'} 
                    />
                    <Text style={[
                      styles.recipientTypeText,
                      isSelected && { color: type.color }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Specific Recipient Selection */}
          {(recipientType === 'circle' || recipientType === 'person') && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {recipientType === 'circle' ? 'Circle' : 'Person'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.recipientSelector,
                  errors.recipient && styles.inputError
                ]}
                onPress={() => setShowRecipientPicker(!showRecipientPicker)}
              >
                <Text style={[
                  styles.recipientSelectorText,
                  !selectedRecipientId && styles.placeholderText
                ]}>
                  {getRecipientName()}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
              {errors.recipient && <Text style={styles.errorText}>{errors.recipient}</Text>}
            </View>
          )}

          {/* Recipient Picker */}
          {renderRecipientPicker()}

          {/* Message Content */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.textArea, errors.content && styles.inputError]}
              placeholder="What would you like to share with your neighbors?"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              maxLength={1000}
            />
            <Text style={styles.characterCount}>{content.length}/1000</Text>
            {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}
          </View>

          {/* Preview */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewRecipient}>To: {getRecipientName()}</Text>
              </View>
              <Text style={styles.previewContent}>
                {content || 'Your message will appear here...'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={handleSubmit}>
            <Send size={16} color="#FFFFFF" />
            <Text style={styles.sendButtonText}>Send Message</Text>
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
    marginBottom: 12,
  },
  recipientTypeContainer: {
    gap: 12,
  },
  recipientTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  recipientTypeOptionSelected: {
    backgroundColor: '#F0F9FF',
  },
  recipientTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 12,
  },
  recipientSelector: {
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
  recipientSelectorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  recipientPicker: {
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#DC2626',
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
  },
  previewHeader: {
    marginBottom: 8,
  },
  previewRecipient: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  previewContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    fontStyle: 'italic',
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
  sendButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});