import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { X, CheckCircle, Clock, Users, Target, Award, MessageCircle, ExternalLink, Smartphone, Monitor } from 'lucide-react-native';

interface TestingTask {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'mobile' | 'web' | 'both';
  estimatedTime: string;
  completed: boolean;
}

interface TestingGuideProps {
  visible: boolean;
  onClose: () => void;
  webVersionUrl?: string;
}

const testingTasks: TestingTask[] = [
  {
    id: 'explore-missions',
    title: 'Explore Civic Missions',
    description: 'Browse available missions, create a new mission, and join an existing one',
    icon: Target,
    category: 'both',
    estimatedTime: '3-5 min',
    completed: false,
  },
  {
    id: 'join-circles',
    title: 'Join & Create Circles',
    description: 'Join a neighborhood circle, participate in discussions, and try creating a new circle',
    icon: Users,
    category: 'both',
    estimatedTime: '4-6 min',
    completed: false,
  },
  {
    id: 'comment-system',
    title: 'Test Comments & Replies',
    description: 'Add comments to missions and posts, reply to existing discussions',
    icon: MessageCircle,
    category: 'both',
    estimatedTime: '2-3 min',
    completed: false,
  },
  {
    id: 'achievements',
    title: 'Check Achievement System',
    description: 'View your profile, explore achievements, and track civic score progress',
    icon: Award,
    category: 'both',
    estimatedTime: '2-3 min',
    completed: false,
  },
  {
    id: 'mobile-navigation',
    title: 'Mobile Navigation Flow',
    description: 'Test tab navigation, modal interactions, and touch gestures',
    icon: Smartphone,
    category: 'mobile',
    estimatedTime: '2-3 min',
    completed: false,
  },
  {
    id: 'web-navigation',
    title: 'Web Navigation Flow',
    description: 'Test menu navigation, hover states, and keyboard shortcuts',
    icon: Monitor,
    category: 'web',
    estimatedTime: '2-3 min',
    completed: false,
  },
];

export default function TestingGuide({ visible, onClose, webVersionUrl }: TestingGuideProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [currentPhase, setCurrentPhase] = useState<'mobile' | 'web' | 'comparison'>('mobile');

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getTasksForPhase = (phase: 'mobile' | 'web' | 'comparison') => {
    if (phase === 'comparison') {
      return testingTasks.filter(task => task.category === 'both');
    }
    return testingTasks.filter(task => task.category === phase || task.category === 'both');
  };

  const getCompletionRate = (phase: 'mobile' | 'web' | 'comparison') => {
    const phaseTasks = getTasksForPhase(phase);
    const completedCount = phaseTasks.filter(task => completedTasks.has(task.id)).length;
    return Math.round((completedCount / phaseTasks.length) * 100);
  };

  const renderPhaseSelector = () => (
    <View style={styles.phaseSelector}>
      <TouchableOpacity
        style={[styles.phaseButton, currentPhase === 'mobile' && styles.phaseButtonActive]}
        onPress={() => setCurrentPhase('mobile')}
      >
        <Smartphone size={16} color={currentPhase === 'mobile' ? '#FFFFFF' : '#6B7280'} />
        <Text style={[styles.phaseButtonText, currentPhase === 'mobile' && styles.phaseButtonTextActive]}>
          Mobile
        </Text>
        <View style={styles.completionBadge}>
          <Text style={styles.completionText}>{getCompletionRate('mobile')}%</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.phaseButton, currentPhase === 'web' && styles.phaseButtonActive]}
        onPress={() => setCurrentPhase('web')}
      >
        <Monitor size={16} color={currentPhase === 'web' ? '#FFFFFF' : '#6B7280'} />
        <Text style={[styles.phaseButtonText, currentPhase === 'web' && styles.phaseButtonTextActive]}>
          Web
        </Text>
        <View style={styles.completionBadge}>
          <Text style={styles.completionText}>{getCompletionRate('web')}%</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.phaseButton, currentPhase === 'comparison' && styles.phaseButtonActive]}
        onPress={() => setCurrentPhase('comparison')}
      >
        <Text style={[styles.phaseButtonText, currentPhase === 'comparison' && styles.phaseButtonTextActive]}>
          Compare
        </Text>
        <View style={styles.completionBadge}>
          <Text style={styles.completionText}>{getCompletionRate('comparison')}%</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderTaskList = () => {
    const phaseTasks = getTasksForPhase(currentPhase);
    
    return (
      <View style={styles.taskList}>
        {phaseTasks.map((task) => {
          const IconComponent = task.icon;
          const isCompleted = completedTasks.has(task.id);
          
          return (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
              onPress={() => toggleTaskCompletion(task.id)}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskIconContainer}>
                  <IconComponent size={20} color={isCompleted ? '#059669' : '#6B7280'} />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  <View style={styles.taskMeta}>
                    <Clock size={12} color="#9CA3AF" />
                    <Text style={styles.taskTime}>{task.estimatedTime}</Text>
                  </View>
                </View>
                <View style={styles.taskCheckbox}>
                  {isCompleted ? (
                    <CheckCircle size={24} color="#059669" />
                  ) : (
                    <View style={styles.uncheckedBox} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderPhaseInstructions = () => {
    const instructions = {
      mobile: {
        title: 'Mobile Testing Phase',
        description: 'Focus on the mobile app experience you\'re currently using.',
        tips: [
          'Pay attention to touch interactions and gestures',
          'Notice how content is organized for small screens',
          'Test tab navigation and modal flows',
          'Consider one-handed usability'
        ]
      },
      web: {
        title: 'Web Testing Phase',
        description: 'Switch to the web version to compare the desktop experience.',
        tips: [
          'Notice differences in layout and navigation',
          'Test hover states and click interactions',
          'Consider keyboard navigation',
          'Compare information density and readability'
        ]
      },
      comparison: {
        title: 'Comparison Phase',
        description: 'Now compare both versions side by side.',
        tips: [
          'Which version felt more intuitive?',
          'Where did you complete tasks faster?',
          'Which design felt more engaging?',
          'Consider accessibility and ease of use'
        ]
      }
    };

    const current = instructions[currentPhase];

    return (
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>{current.title}</Text>
        <Text style={styles.instructionsDescription}>{current.description}</Text>
        
        <View style={styles.tipsList}>
          {current.tips.map((tip, index) => (
            <View key={index} style={styles.tip}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {currentPhase === 'web' && webVersionUrl && (
          <TouchableOpacity 
            style={styles.webLinkButton}
            onPress={() => {
              // Handle opening web version
              if (Platform.OS !== 'web') {
                Alert.alert(
                  'Open Web Version',
                  `Please open this URL in your browser:\n\n${webVersionUrl}`,
                  [{ text: 'OK' }]
                );
              }
            }}
          >
            <ExternalLink size={16} color="#FFFFFF" />
            <Text style={styles.webLinkButtonText}>Open Web Version</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Testing Guide</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderPhaseSelector()}
          {renderPhaseInstructions()}
          {renderTaskList()}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {completedTasks.size} of {testingTasks.length} tasks completed
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(completedTasks.size / testingTasks.length) * 100}%` }
                ]} 
              />
            </View>
          </View>
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
  },
  phaseSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  phaseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  phaseButtonActive: {
    backgroundColor: '#2563EB',
  },
  phaseButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  phaseButtonTextActive: {
    color: '#FFFFFF',
  },
  completionBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  completionText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#6B7280',
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  instructionsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  instructionsDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  tipsList: {
    marginBottom: 16,
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginRight: 8,
    width: 12,
  },
  tipText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 18,
    flex: 1,
  },
  webLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  webLinkButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  taskList: {
    marginBottom: 20,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  taskCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    color: '#059669',
  },
  taskDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskTime: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  taskCheckbox: {
    marginLeft: 12,
  },
  uncheckedBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
});