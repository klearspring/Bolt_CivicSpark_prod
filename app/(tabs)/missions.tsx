import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { MapPin, Clock, Users, Award, Flame, CircleCheck as CheckCircle, Calendar, Plus, MessageCircle, UserPlus, UserMinus, Play, SquareCheck as CheckSquare } from 'lucide-react-native';
import CreateMissionModal from '@/components/CreateMissionModal';
import MissionCommentsModal from '@/components/MissionCommentsModal';
import { Colors } from '@/constants/Colors';

type MissionStatus = 'available' | 'joined' | 'active' | 'completed' | 'left';

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
  targetType: 'neighborhood' | 'circle';
  targetId?: string;
  targetName: string;
  comments?: number;
  status: MissionStatus;
  dateJoined?: string;
  dateCompleted?: string;
  dateLeft?: string;
}

interface Circle {
  id: string;
  name: string;
  memberCount: number;
}

const initialMissions: Mission[] = [
  {
    id: '1',
    title: 'Attend City Council Meeting',
    description: 'Join your local city council meeting and learn about upcoming community initiatives.',
    location: 'City Hall, Downtown',
    duration: '2 hours',
    participants: 12,
    points: 50,
    category: 'government',
    difficulty: 'easy',
    targetType: 'neighborhood',
    targetName: 'Entire Neighborhood',
    comments: 3,
    status: 'available'
  },
  {
    id: '2',
    title: 'Host Neighborhood Coffee Chat',
    description: 'Organize a casual coffee meetup to discuss local community concerns with neighbors.',
    location: 'Your neighborhood',
    duration: '1 hour',
    participants: 8,
    points: 75,
    category: 'community',
    difficulty: 'medium',
    targetType: 'circle',
    targetId: '1',
    targetName: 'Downtown Residents',
    comments: 2,
    status: 'joined',
    dateJoined: '2024-01-10'
  },
  {
    id: '3',
    title: 'School Board Meeting Observer',
    description: 'Attend a school board meeting to understand education policy decisions in your district.',
    location: 'District Office',
    duration: '90 minutes',
    participants: 6,
    points: 40,
    category: 'education',
    difficulty: 'easy',
    targetType: 'neighborhood',
    targetName: 'Entire Neighborhood',
    comments: 0,
    status: 'active',
    dateJoined: '2024-01-08'
  },
  {
    id: '4',
    title: 'Community Garden Volunteer',
    description: 'Help maintain the local community garden and connect with environmentally conscious neighbors.',
    location: 'Riverside Park',
    duration: '3 hours',
    participants: 15,
    points: 60,
    category: 'environment',
    difficulty: 'medium',
    targetType: 'circle',
    targetId: '4',
    targetName: 'Green Neighborhood Network',
    comments: 0,
    status: 'completed',
    dateJoined: '2023-12-20',
    dateCompleted: '2024-01-05'
  }
];

// Mock circles data for the modal
const mockCircles: Circle[] = [
  { id: '1', name: 'Downtown Residents', memberCount: 124 },
  { id: '2', name: 'Affordable Housing Coalition', memberCount: 89 },
  { id: '3', name: 'Safe Streets Initiative', memberCount: 67 },
  { id: '4', name: 'Green Neighborhood Network', memberCount: 156 },
];

const categoryColors = {
  community: Colors.category.community,
  government: Colors.category.government, 
  environment: Colors.category.environment,
  education: Colors.category.education
};

const targetTypeColors = {
  neighborhood: Colors.info,
  circle: Colors.success
};

const statusConfig = {
  available: {
    color: Colors.textMuted,
    backgroundColor: Colors.backgroundLight,
    icon: UserPlus,
    label: 'Join Mission',
    description: 'Available to join'
  },
  joined: {
    color: Colors.info,
    backgroundColor: Colors.info + '20',
    icon: Calendar,
    label: 'Start Mission',
    description: 'Joined - Ready to start'
  },
  active: {
    color: Colors.warning,
    backgroundColor: Colors.warning + '20',
    icon: Play,
    label: 'Complete Mission',
    description: 'Currently active'
  },
  completed: {
    color: Colors.success,
    backgroundColor: Colors.success + '20',
    icon: CheckCircle,
    label: 'Completed',
    description: 'Mission completed'
  },
  left: {
    color: Colors.textMuted,
    backgroundColor: Colors.backgroundLight,
    icon: UserMinus,
    label: 'Rejoin Mission',
    description: 'Previously left'
  }
};

export default function MissionsTab() {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [totalPoints, setTotalPoints] = useState(285);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'joined' | 'active' | 'completed'>('all');

  const updateMissionStatus = (missionId: string, newStatus: MissionStatus) => {
    setMissions(prevMissions => 
      prevMissions.map(mission => {
        if (mission.id === missionId) {
          const updatedMission = { ...mission, status: newStatus };
          
          // Update timestamps based on status
          const currentDate = new Date().toISOString().split('T')[0];
          
          switch (newStatus) {
            case 'joined':
              updatedMission.dateJoined = currentDate;
              updatedMission.participants = mission.participants + (mission.status === 'available' ? 1 : 0);
              break;
            case 'active':
              if (!updatedMission.dateJoined) {
                updatedMission.dateJoined = currentDate;
              }
              break;
            case 'completed':
              updatedMission.dateCompleted = currentDate;
              setTotalPoints(prev => prev + mission.points);
              setCurrentStreak(prev => prev + 1);
              break;
            case 'left':
              updatedMission.dateLeft = currentDate;
              updatedMission.participants = Math.max(0, mission.participants - 1);
              break;
            case 'available':
              // Reset all dates when returning to available
              delete updatedMission.dateJoined;
              delete updatedMission.dateCompleted;
              delete updatedMission.dateLeft;
              break;
          }
          
          return updatedMission;
        }
        return mission;
      })
    );
  };

  const handleMissionAction = (mission: Mission) => {
    const { status } = mission;
    
    switch (status) {
      case 'available':
        updateMissionStatus(mission.id, 'joined');
        showFeedback('Mission joined! You can now start participating.');
        break;
      case 'joined':
        updateMissionStatus(mission.id, 'active');
        showFeedback('Mission started! Good luck with your civic engagement.');
        break;
      case 'active':
        updateMissionStatus(mission.id, 'completed');
        showFeedback(`Mission completed! You earned ${mission.points} points.`);
        break;
      case 'completed':
        // No action for completed missions
        break;
      case 'left':
        updateMissionStatus(mission.id, 'joined');
        showFeedback('Welcome back! Mission rejoined.');
        break;
    }
  };

  const handleLeaveMission = (mission: Mission) => {
    if (mission.status === 'completed') return;
    
    const confirmLeave = () => {
      updateMissionStatus(mission.id, 'left');
      showFeedback('You have left this mission. You can rejoin anytime.');
    };

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Leave Mission',
        `Are you sure you want to leave "${mission.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: confirmLeave }
        ]
      );
    } else {
      if (confirm(`Are you sure you want to leave "${mission.title}"?`)) {
        confirmLeave();
      }
    }
  };

  const showFeedback = (message: string) => {
    if (Platform.OS !== 'web') {
      Alert.alert('Success', message);
    }
  };

  const handleCreateMission = (newMissionData: Omit<Mission, 'id' | 'participants' | 'comments' | 'status'>) => {
    const newMission: Mission = {
      ...newMissionData,
      id: Date.now().toString(),
      participants: 0,
      comments: 0,
      status: 'available',
    };
    
    setMissions([newMission, ...missions]);
  };

  const handleOpenComments = (mission: Mission) => {
    setSelectedMission(mission);
    setShowCommentsModal(true);
  };

  const handleAddComment = (missionId: string, comment: any) => {
    console.log('Comment added to mission:', missionId, comment);
  };

  const handleUpdateCommentCount = (missionId: string, newCount: number) => {
    setMissions(prevMissions =>
      prevMissions.map(mission =>
        mission.id === missionId
          ? { ...mission, comments: newCount }
          : mission
      )
    );
  };

  const getFilteredMissions = () => {
    if (activeFilter === 'all') return missions;
    return missions.filter(mission => mission.status === activeFilter);
  };

  const getStatusCounts = () => {
    return {
      all: missions.length,
      available: missions.filter(m => m.status === 'available').length,
      joined: missions.filter(m => m.status === 'joined').length,
      active: missions.filter(m => m.status === 'active').length,
      completed: missions.filter(m => m.status === 'completed').length,
    };
  };

  const statusCounts = getStatusCounts();
  const filteredMissions = getFilteredMissions();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Civic Missions</Text>
          <Text style={styles.headerSubtitle}>Make a difference in your community</Text>
        </View>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color={Colors.secondaryDark} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Flame size={20} color={Colors.warning} />
          <Text style={styles.statNumber}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Award size={20} color={Colors.primary} />
          <Text style={styles.statNumber}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={20} color={Colors.success} />
          <Text style={styles.statNumber}>{statusCounts.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { key: 'all', label: 'All' },
            { key: 'available', label: 'Available' },
            { key: 'joined', label: 'Joined' },
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                activeFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setActiveFilter(filter.key as any)}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === filter.key && styles.filterButtonTextActive
              ]}>
                {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.missionsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          {activeFilter === 'all' ? 'All Missions' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Missions`}
        </Text>
        
        {filteredMissions.map((mission) => {
          const config = statusConfig[mission.status];
          const IconComponent = config.icon;
          
          return (
            <View key={mission.id} style={[
              styles.missionCard,
              { borderLeftColor: config.color }
            ]}>
              <View style={styles.missionHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryColors[mission.category] }]}>
                  <Text style={styles.categoryText}>{mission.category.toUpperCase()}</Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Award size={12} color={Colors.primary} />
                  <Text style={styles.pointsText}>{mission.points} pts</Text>
                </View>
              </View>

              {/* Status Badge */}
              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: config.backgroundColor }]}>
                  <IconComponent size={12} color={config.color} />
                  <Text style={[styles.statusText, { color: config.color }]}>
                    {config.description}
                  </Text>
                </View>
              </View>

              {/* Target Audience Badge */}
              <View style={styles.targetContainer}>
                <View style={[
                  styles.targetBadge, 
                  { backgroundColor: targetTypeColors[mission.targetType] + '20' }
                ]}>
                  <Text style={[
                    styles.targetText,
                    { color: targetTypeColors[mission.targetType] }
                  ]}>
                    📍 {mission.targetName}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <Text style={styles.missionDescription}>{mission.description}</Text>
              
              <View style={styles.missionDetails}>
                <View style={styles.detailItem}>
                  <MapPin size={14} color={Colors.textMuted} />
                  <Text style={styles.detailText}>{mission.location}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Clock size={14} color={Colors.textMuted} />
                  <Text style={styles.detailText}>{mission.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Users size={14} color={Colors.textMuted} />
                  <Text style={styles.detailText}>{mission.participants} joined</Text>
                </View>
              </View>

              {/* Mission Actions */}
              <View style={styles.missionActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: config.color },
                    mission.status === 'completed' && styles.completedButton
                  ]}
                  onPress={() => handleMissionAction(mission)}
                  disabled={mission.status === 'completed'}
                >
                  <IconComponent size={16} color={mission.status === 'completed' ? config.color : Colors.secondaryDark} />
                  <Text style={[
                    styles.actionButtonText,
                    mission.status === 'completed' && styles.completedButtonText
                  ]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>

                {/* Leave Button (only for joined/active missions) */}
                {(mission.status === 'joined' || mission.status === 'active') && (
                  <TouchableOpacity 
                    style={styles.leaveButton}
                    onPress={() => handleLeaveMission(mission)}
                  >
                    <UserMinus size={16} color={Colors.error} />
                    <Text style={styles.leaveButtonText}>Leave</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={styles.commentsButton}
                  onPress={() => handleOpenComments(mission)}
                >
                  <MessageCircle size={16} color={Colors.textMuted} />
                  <Text style={styles.commentsButtonText}>
                    {mission.comments || 0}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Mission Dates */}
              {(mission.dateJoined || mission.dateCompleted || mission.dateLeft) && (
                <View style={styles.missionDates}>
                  {mission.dateJoined && (
                    <Text style={styles.dateText}>Joined: {mission.dateJoined}</Text>
                  )}
                  {mission.dateCompleted && (
                    <Text style={styles.dateText}>Completed: {mission.dateCompleted}</Text>
                  )}
                  {mission.dateLeft && (
                    <Text style={styles.dateText}>Left: {mission.dateLeft}</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {filteredMissions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No missions found</Text>
            <Text style={styles.emptyStateText}>
              {activeFilter === 'all' 
                ? 'Create your first mission to get started!'
                : `No ${activeFilter} missions at the moment.`
              }
            </Text>
          </View>
        )}
      </ScrollView>

      <CreateMissionModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateMission={handleCreateMission}
        circles={mockCircles}
      />

      <MissionCommentsModal
        visible={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        mission={selectedMission}
        onAddComment={handleAddComment}
        onUpdateCommentCount={handleUpdateCommentCount}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
  },
  createButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundCard,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textBody,
    marginTop: 2,
  },
  filterContainer: {
    backgroundColor: Colors.backgroundCard,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textBody,
  },
  filterButtonTextActive: {
    color: Colors.secondaryDark,
  },
  missionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 16,
    marginTop: 8,
  },
  missionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
    marginLeft: 4,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
  targetContainer: {
    marginBottom: 12,
  },
  targetBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  targetText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
  missionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 8,
  },
  missionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 20,
    marginBottom: 16,
  },
  missionDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.textBody,
    marginLeft: 8,
  },
  missionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  completedButton: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
    marginLeft: 8,
  },
  completedButtonText: {
    color: Colors.success,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  leaveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.error,
    marginLeft: 6,
  },
  commentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentsButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textBody,
    marginLeft: 6,
  },
  missionDates: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    textAlign: 'center',
    lineHeight: 20,
  },
});