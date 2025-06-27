import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Award, MapPin, Calendar, Users, Target, CircleCheck as CheckCircle, TrendingUp, Star, CreditCard as Edit, Settings, Lock, Trophy, Zap, Heart, MessageCircle, Shield, Globe, Navigation, Chrome as Home, Building2, GraduationCap } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { CivicDataService } from '@/services/civicDataService';

interface CivicAction {
  id: string;
  title: string;
  date: string;
  category: 'mission' | 'meeting' | 'volunteer' | 'advocacy';
  points: number;
  verified: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedDate?: string;
  isUnlocked: boolean;
  category: 'missions' | 'community' | 'engagement' | 'leadership' | 'special';
  requirement: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Community {
  id: string;
  name: string;
  type: 'neighborhood' | 'district' | 'city' | 'workplace' | 'school';
  memberCount: number;
  joinedDate: string;
  engagementLevel: 'low' | 'medium' | 'high';
  missionsCompleted: number;
  circlesJoined: number;
  isActive: boolean;
  location: {
    address: string;
    radius: string;
  };
}

// Demo data for demo mode
const mockCivicActions: CivicAction[] = [
  {
    id: '1',
    title: 'Attended City Council Meeting',
    date: '2024-01-15',
    category: 'meeting',
    points: 50,
    verified: true
  },
  {
    id: '2',
    title: 'Hosted Neighborhood Coffee Chat',
    date: '2024-01-12',
    category: 'mission',
    points: 75,
    verified: true
  },
  {
    id: '3',
    title: 'Community Garden Volunteer',
    date: '2024-01-08',
    category: 'volunteer',
    points: 60,
    verified: true
  },
  {
    id: '4',
    title: 'School Board Meeting Observer',
    date: '2024-01-05',
    category: 'meeting',
    points: 40,
    verified: true
  },
  {
    id: '5',
    title: 'Housing Policy Advocacy',
    date: '2023-12-28',
    category: 'advocacy',
    points: 80,
    verified: true
  }
];

const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Downtown Residents',
    type: 'neighborhood',
    memberCount: 124,
    joinedDate: '2023-12-15',
    engagementLevel: 'high',
    missionsCompleted: 8,
    circlesJoined: 3,
    isActive: true,
    location: {
      address: 'Downtown District',
      radius: '0.5 miles'
    }
  },
  {
    id: '2',
    name: 'Metro City',
    type: 'city',
    memberCount: 15420,
    joinedDate: '2023-12-10',
    engagementLevel: 'medium',
    missionsCompleted: 12,
    circlesJoined: 5,
    isActive: true,
    location: {
      address: 'Metro City',
      radius: 'City-wide'
    }
  },
  {
    id: '3',
    name: 'Tech Hub Workplace',
    type: 'workplace',
    memberCount: 89,
    joinedDate: '2024-01-02',
    engagementLevel: 'medium',
    missionsCompleted: 3,
    circlesJoined: 2,
    isActive: true,
    location: {
      address: 'Innovation District',
      radius: '0.25 miles'
    }
  },
  {
    id: '4',
    name: 'Riverside Elementary School District',
    type: 'school',
    memberCount: 234,
    joinedDate: '2023-11-20',
    engagementLevel: 'low',
    missionsCompleted: 1,
    circlesJoined: 1,
    isActive: false,
    location: {
      address: 'Riverside District',
      radius: '2 miles'
    }
  }
];

const allAchievements: Achievement[] = [
  // Unlocked Achievements
  {
    id: '1',
    title: 'Civic Starter',
    description: 'Completed your first civic mission',
    icon: '🎯',
    unlockedDate: '2023-12-15',
    isUnlocked: true,
    category: 'missions',
    requirement: 'Complete 1 mission',
    rarity: 'common'
  },
  {
    id: '2',
    title: 'Community Connector',
    description: 'Joined 3 neighborhood circles',
    icon: '🤝',
    unlockedDate: '2023-12-20',
    isUnlocked: true,
    category: 'community',
    requirement: 'Join 3 circles',
    rarity: 'common'
  },
  {
    id: '3',
    title: 'Meeting Regular',
    description: 'Attended 5 public meetings',
    icon: '📋',
    unlockedDate: '2024-01-10',
    isUnlocked: true,
    category: 'engagement',
    requirement: 'Attend 5 meetings',
    rarity: 'rare'
  },
  {
    id: '4',
    title: 'Streak Master',
    description: 'Maintained 7-day civic activity streak',
    icon: '🔥',
    unlockedDate: '2024-01-15',
    isUnlocked: true,
    category: 'engagement',
    requirement: 'Maintain 7-day streak',
    rarity: 'rare'
  },

  // Available Achievements (Locked)
  {
    id: '5',
    title: 'Mission Veteran',
    description: 'Complete 10 civic missions',
    icon: '🏆',
    isUnlocked: false,
    category: 'missions',
    requirement: 'Complete 10 missions',
    progress: 5,
    maxProgress: 10,
    rarity: 'rare'
  },
  {
    id: '6',
    title: 'Circle Creator',
    description: 'Create your first neighborhood circle',
    icon: '🌟',
    isUnlocked: false,
    category: 'leadership',
    requirement: 'Create 1 circle',
    progress: 0,
    maxProgress: 1,
    rarity: 'rare'
  },
  {
    id: '7',
    title: 'Discussion Starter',
    description: 'Start 5 meaningful discussions',
    icon: '💬',
    isUnlocked: false,
    category: 'community',
    requirement: 'Start 5 discussions',
    progress: 2,
    maxProgress: 5,
    rarity: 'common'
  },
  {
    id: '8',
    title: 'Civic Champion',
    description: 'Earn 500 civic points',
    icon: '⭐',
    isUnlocked: false,
    category: 'engagement',
    requirement: 'Earn 500 points',
    progress: 305,
    maxProgress: 500,
    rarity: 'epic'
  },
  {
    id: '9',
    title: 'Neighborhood Ambassador',
    description: 'Get endorsed by 25 neighbors',
    icon: '🎖️',
    isUnlocked: false,
    category: 'leadership',
    requirement: 'Receive 25 endorsements',
    progress: 12,
    maxProgress: 25,
    rarity: 'epic'
  },
  {
    id: '10',
    title: 'Policy Influencer',
    description: 'Attend 15 government meetings',
    icon: '🏛️',
    isUnlocked: false,
    category: 'engagement',
    requirement: 'Attend 15 meetings',
    progress: 5,
    maxProgress: 15,
    rarity: 'epic'
  },
  {
    id: '11',
    title: 'Community Builder',
    description: 'Help 50 neighbors through missions',
    icon: '🏗️',
    isUnlocked: false,
    category: 'community',
    requirement: 'Help 50 neighbors',
    progress: 18,
    maxProgress: 50,
    rarity: 'epic'
  },
  {
    id: '12',
    title: 'Civic Legend',
    description: 'Reach the highest level of civic engagement',
    icon: '👑',
    isUnlocked: false,
    category: 'special',
    requirement: 'Earn 1000 points & complete all categories',
    progress: 305,
    maxProgress: 1000,
    rarity: 'legendary'
  },
  {
    id: '13',
    title: 'Marathon Attendee',
    description: 'Attend meetings for 30 consecutive days',
    icon: '🏃',
    isUnlocked: false,
    category: 'engagement',
    requirement: 'Attend meetings 30 days straight',
    progress: 7,
    maxProgress: 30,
    rarity: 'legendary'
  },
  {
    id: '14',
    title: 'Super Connector',
    description: 'Join 10 different circles',
    icon: '🌐',
    isUnlocked: false,
    category: 'community',
    requirement: 'Join 10 circles',
    progress: 3,
    maxProgress: 10,
    rarity: 'rare'
  },
  {
    id: '15',
    title: 'Mission Creator',
    description: 'Create 5 successful missions',
    icon: '🎨',
    isUnlocked: false,
    category: 'leadership',
    requirement: 'Create 5 missions',
    progress: 1,
    maxProgress: 5,
    rarity: 'epic'
  }
];

const categoryIcons = {
  mission: Target,
  meeting: Users,
  volunteer: Star,
  advocacy: TrendingUp
};

const categoryColors = {
  mission: Colors.info,
  meeting: Colors.success,
  volunteer: Colors.warning,
  advocacy: Colors.category.education
};

const achievementCategoryColors = {
  missions: Colors.info,
  community: Colors.success,
  engagement: Colors.warning,
  leadership: Colors.category.education,
  special: Colors.error
};

const communityTypeIcons = {
  neighborhood: Home,
  district: Building2,
  city: Globe,
  workplace: Building2,
  school: GraduationCap
};

const communityTypeColors = {
  neighborhood: Colors.primary,
  district: Colors.info,
  city: Colors.category.government,
  workplace: Colors.category.community,
  school: Colors.category.education
};

const engagementLevelColors = {
  low: Colors.textMuted,
  medium: Colors.warning,
  high: Colors.success
};

export default function ProfileTab() {
  const { user, isDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'achievements' | 'communities'>('overview');
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'available'>('all');
  
  // Real data state
  const [civicActions, setCivicActions] = useState<CivicAction[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load real data when user is authenticated and not in demo mode
  useEffect(() => {
    if (user && !isDemoMode) {
      loadUserData();
    }
  }, [user, isDemoMode]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Loading user data for:', user.id);
      
      // Load civic actions
      const userCivicActions = await CivicDataService.getCivicActions(user.id);
      setCivicActions(userCivicActions);
      console.log('✅ Loaded civic actions:', userCivicActions.length);
      
      // Load communities
      const userCommunities = await CivicDataService.getCommunities(user.id);
      setCommunities(userCommunities);
      console.log('✅ Loaded communities:', userCommunities.length);
      
      // Load achievements
      const userAchievements = await CivicDataService.getAchievements(user.id);
      // Map database achievements to display format
      const mappedAchievements = allAchievements.map(achievement => {
        const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
        if (userAchievement) {
          return {
            ...achievement,
            isUnlocked: true,
            unlockedDate: userAchievement.unlockedAt.split('T')[0],
          };
        }
        return achievement;
      });
      setAchievements(mappedAchievements);
      console.log('✅ Loaded achievements:', userAchievements.length, 'unlocked');
      
    } catch (err) {
      console.error('❌ Error loading user data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Use demo data if in demo mode, otherwise use real data
  const displayCivicActions = isDemoMode ? mockCivicActions : civicActions;
  const displayCommunities = isDemoMode ? mockCommunities : communities;
  const displayAchievements = isDemoMode ? allAchievements : achievements;
  
  // Calculate stats from real or demo data
  const totalPoints = user?.civicProfile?.totalPoints || displayCivicActions.reduce((sum, action) => sum + action.points, 0);
  const completedMissions = user?.civicProfile?.completedMissions || displayCivicActions.length;
  const civicScore = user?.civicProfile?.civicScore || Math.min(100, Math.floor(totalPoints / 5));

  const unlockedAchievements = displayAchievements.filter(a => a.isUnlocked);
  const availableAchievements = displayAchievements.filter(a => !a.isUnlocked);

  const filteredAchievements = achievementFilter === 'all' 
    ? displayAchievements 
    : achievementFilter === 'unlocked' 
      ? unlockedAchievements 
      : availableAchievements;

  const activeCommunities = displayCommunities.filter(c => c.isActive);
  const totalMissionsAcrossCommunities = displayCommunities.reduce((sum, c) => sum + c.missionsCompleted, 0);
  const totalCirclesAcrossCommunities = displayCommunities.reduce((sum, c) => sum + c.circlesJoined, 0);

  const renderProgressBar = (progress: number, maxProgress: number) => {
    const percentage = Math.min(100, (progress / maxProgress) * 100);
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}/{maxProgress}</Text>
      </View>
    );
  };

  const renderCommunityCard = (community: Community) => {
    const IconComponent = communityTypeIcons[community.type];
    const typeColor = communityTypeColors[community.type];
    const engagementColor = engagementLevelColors[community.engagementLevel];

    return (
      <View key={community.id} style={styles.communityCard}>
        <View style={styles.communityHeader}>
          <View style={[styles.communityIcon, { backgroundColor: typeColor + '20' }]}>
            <IconComponent size={20} color={typeColor} />
          </View>
          <View style={styles.communityInfo}>
            <Text style={styles.communityName}>{community.name}</Text>
            <Text style={styles.communityType}>{community.type.charAt(0).toUpperCase() + community.type.slice(1)}</Text>
          </View>
          <View style={[styles.engagementBadge, { backgroundColor: engagementColor + '20' }]}>
            <Text style={[styles.engagementText, { color: engagementColor }]}>
              {community.engagementLevel}
            </Text>
          </View>
        </View>

        <View style={styles.communityLocation}>
          <MapPin size={14} color={Colors.textMuted} />
          <Text style={styles.locationText}>{community.location.address}</Text>
          <Text style={styles.radiusText}>• {community.location.radius}</Text>
        </View>

        <View style={styles.communityStats}>
          <View style={styles.statItem}>
            <Target size={14} color={Colors.primary} />
            <Text style={styles.statText}>{community.missionsCompleted} missions</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={14} color={Colors.success} />
            <Text style={styles.statText}>{community.circlesJoined} circles</Text>
          </View>
          <View style={styles.statItem}>
            <Globe size={14} color={Colors.info} />
            <Text style={styles.statText}>{community.memberCount} members</Text>
          </View>
        </View>

        <View style={styles.communityFooter}>
          <Text style={styles.joinedDate}>Joined {new Date(community.joinedDate).toLocaleDateString()}</Text>
          {!community.isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>Inactive</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Show loading state for real users
  if (!isDemoMode && loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state for real users
  if (!isDemoMode && error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        {isDemoMode && (
          <View style={styles.demoModeIndicator}>
            <Text style={styles.demoModeText}>🎭 Demo Mode - Sample Data</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: user?.avatar || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2' }} style={styles.profileAvatar} />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{user?.displayName || 'User Name'}</Text>
              <TouchableOpacity style={styles.editButton}>
                <Edit size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={14} color={Colors.textMuted} />
              <Text style={styles.locationText}>
                {user?.location?.city && user?.location?.state 
                  ? `${user.location.city}, ${user.location.state}`
                  : 'Location not set'
                }
              </Text>
            </View>
            <View style={styles.joinDateRow}>
              <Calendar size={14} color={Colors.textMuted} />
              <Text style={styles.joinDateText}>
                Joined {user?.civicProfile?.joinDate 
                  ? new Date(user.civicProfile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : 'Recently'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Civic Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Civic Score</Text>
            <Text style={styles.scoreValue}>{civicScore}/100</Text>
          </View>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreProgress, { width: `${civicScore}%` }]} />
          </View>
          <Text style={styles.scoreDescription}>
            Your civic engagement level based on verified actions and community participation
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Award size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={24} color={Colors.success} />
            <Text style={styles.statNumber}>{completedMissions}</Text>
            <Text style={styles.statLabel}>Missions</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={24} color={Colors.warning} />
            <Text style={styles.statNumber}>{unlockedAchievements.length}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'communities' && styles.activeTab]}
            onPress={() => setActiveTab('communities')}
          >
            <Text style={[styles.tabText, activeTab === 'communities' && styles.activeTabText]}>
              Communities
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'actions' && styles.activeTab]}
            onPress={() => setActiveTab('actions')}
          >
            <Text style={[styles.tabText, activeTab === 'actions' && styles.activeTabText]}>
              Actions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'achievements' && styles.activeTab]}
            onPress={() => setActiveTab('achievements')}
          >
            <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
              Achievements
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {!isDemoMode && displayCivicActions.length === 0 ? (
              <View style={styles.emptyState}>
                <Target size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateTitle}>Start Your Civic Journey</Text>
                <Text style={styles.emptyStateText}>
                  Complete your first mission to begin building your civic profile and making a difference in your community.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {displayCivicActions.slice(0, 3).map((action) => {
                  const IconComponent = categoryIcons[action.category];
                  
                  return (
                    <View key={action.id} style={styles.activityItem}>
                      <View style={[styles.activityIcon, { backgroundColor: categoryColors[action.category] + '20' }]}>
                        <IconComponent size={16} color={categoryColors[action.category]} />
                      </View>
                      <View style={styles.activityDetails}>
                        <Text style={styles.activityTitle}>{action.title}</Text>
                        <Text style={styles.activityDate}>{new Date(action.date).toLocaleDateString()}</Text>
                      </View>
                      <View style={styles.activityPoints}>
                        <Text style={styles.pointsText}>+{action.points}</Text>
                        {action.verified && <CheckCircle size={12} color={Colors.success} />}
                      </View>
                    </View>
                  );
                })}

                {/* Recent Achievements Preview */}
                <Text style={styles.sectionTitle}>Latest Achievements</Text>
                {unlockedAchievements.slice(-2).map((achievement) => (
                  <View key={achievement.id} style={styles.achievementPreview}>
                    <Text style={styles.achievementPreviewIcon}>{achievement.icon}</Text>
                    <View style={styles.achievementPreviewInfo}>
                      <Text style={styles.achievementPreviewTitle}>{achievement.title}</Text>
                      <Text style={styles.achievementPreviewDate}>
                        Unlocked {achievement.unlockedDate && new Date(achievement.unlockedDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.rarityBadge, { backgroundColor: Colors.rarity[achievement.rarity] }]}>
                      <Text style={styles.rarityText}>{achievement.rarity}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {activeTab === 'communities' && (
          <View style={styles.tabContent}>
            {/* Communities Overview */}
            <View style={styles.communitiesOverview}>
              <Text style={styles.sectionTitle}>My Communities</Text>
              <View style={styles.communitiesStats}>
                <View style={styles.communityStatCard}>
                  <Globe size={20} color={Colors.primary} />
                  <Text style={styles.communityStatNumber}>{displayCommunities.length}</Text>
                  <Text style={styles.communityStatLabel}>Total Communities</Text>
                </View>
                <View style={styles.communityStatCard}>
                  <Target size={20} color={Colors.success} />
                  <Text style={styles.communityStatNumber}>{totalMissionsAcrossCommunities}</Text>
                  <Text style={styles.communityStatLabel}>Total Missions</Text>
                </View>
                <View style={styles.communityStatCard}>
                  <Users size={20} color={Colors.info} />
                  <Text style={styles.communityStatNumber}>{totalCirclesAcrossCommunities}</Text>
                  <Text style={styles.communityStatLabel}>Total Circles</Text>
                </View>
              </View>
            </View>

            {!isDemoMode && displayCommunities.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateTitle}>Join Your First Community</Text>
                <Text style={styles.emptyStateText}>
                  Connect with neighbors and local organizations to start making a difference in your area.
                </Text>
              </View>
            ) : (
              <>
                {/* Active Communities */}
                <Text style={styles.sectionTitle}>Active Communities ({activeCommunities.length})</Text>
                {activeCommunities.map(renderCommunityCard)}

                {/* Inactive Communities */}
                {displayCommunities.filter(c => !c.isActive).length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>
                      Inactive Communities ({displayCommunities.filter(c => !c.isActive).length})
                    </Text>
                    {displayCommunities.filter(c => !c.isActive).map(renderCommunityCard)}
                  </>
                )}
              </>
            )}

            {/* Add Community Button */}
            <TouchableOpacity style={styles.addCommunityButton}>
              <Navigation size={20} color={Colors.primary} />
              <Text style={styles.addCommunityText}>Discover New Communities</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'actions' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>All Civic Actions</Text>
            {!isDemoMode && displayCivicActions.length === 0 ? (
              <View style={styles.emptyState}>
                <Target size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateTitle}>No Civic Actions Yet</Text>
                <Text style={styles.emptyStateText}>
                  Start participating in missions and community activities to build your civic profile.
                </Text>
              </View>
            ) : (
              displayCivicActions.map((action) => {
                const IconComponent = categoryIcons[action.category];
                
                return (
                  <View key={action.id} style={styles.actionCard}>
                    <View style={styles.actionHeader}>
                      <View style={[styles.actionIcon, { backgroundColor: categoryColors[action.category] + '20' }]}>
                        <IconComponent size={18} color={categoryColors[action.category]} />
                      </View>
                      <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>{action.title}</Text>
                        <Text style={styles.actionDate}>{new Date(action.date).toLocaleDateString()}</Text>
                      </View>
                    </View>
                    <View style={styles.actionFooter}>
                      <View style={styles.actionPoints}>
                        <Award size={14} color={Colors.primary} />
                        <Text style={styles.pointsText}>{action.points} points</Text>
                      </View>
                      {action.verified && (
                        <View style={styles.verifiedBadge}>
                          <CheckCircle size={12} color={Colors.success} />
                          <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'achievements' && (
          <View style={styles.tabContent}>
            <View style={styles.achievementHeader}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <Text style={styles.achievementStats}>
                {unlockedAchievements.length} of {displayAchievements.length} unlocked
              </Text>
            </View>

            {/* Achievement Filter */}
            <View style={styles.achievementFilter}>
              <TouchableOpacity
                style={[styles.filterButton, achievementFilter === 'all' && styles.filterButtonActive]}
                onPress={() => setAchievementFilter('all')}
              >
                <Text style={[styles.filterButtonText, achievementFilter === 'all' && styles.filterButtonTextActive]}>
                  All ({displayAchievements.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, achievementFilter === 'unlocked' && styles.filterButtonActive]}
                onPress={() => setAchievementFilter('unlocked')}
              >
                <Text style={[styles.filterButtonText, achievementFilter === 'unlocked' && styles.filterButtonTextActive]}>
                  Unlocked ({unlockedAchievements.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, achievementFilter === 'available' && styles.filterButtonActive]}
                onPress={() => setAchievementFilter('available')}
              >
                <Text style={[styles.filterButtonText, achievementFilter === 'available' && styles.filterButtonTextActive]}>
                  Available ({availableAchievements.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Achievements List */}
            {filteredAchievements.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard,
                  !achievement.isUnlocked && styles.achievementCardLocked,
                  { borderColor: Colors.rarity[achievement.rarity] + '40' }
                ]}
              >
                <View style={styles.achievementCardHeader}>
                  <View style={styles.achievementIconContainer}>
                    {achievement.isUnlocked ? (
                      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    ) : (
                      <View style={styles.lockedIconContainer}>
                        <Lock size={20} color={Colors.textMuted} />
                      </View>
                    )}
                  </View>
                  <View style={styles.achievementInfo}>
                    <View style={styles.achievementTitleRow}>
                      <Text style={[
                        styles.achievementTitle,
                        !achievement.isUnlocked && styles.achievementTitleLocked
                      ]}>
                        {achievement.title}
                      </Text>
                      <View style={[
                        styles.rarityBadge,
                        { backgroundColor: Colors.rarity[achievement.rarity] + '20' }
                      ]}>
                        <Text style={[styles.rarityText, { color: Colors.rarity[achievement.rarity] }]}>
                          {achievement.rarity}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.achievementDescription,
                      !achievement.isUnlocked && styles.achievementDescriptionLocked
                    ]}>
                      {achievement.description}
                    </Text>
                    <Text style={styles.achievementRequirement}>
                      {achievement.requirement}
                    </Text>
                    {achievement.unlockedDate && (
                      <Text style={styles.achievementDate}>
                        Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Progress Bar for Locked Achievements */}
                {!achievement.isUnlocked && achievement.progress !== undefined && achievement.maxProgress && (
                  <View style={styles.achievementProgress}>
                    {renderProgressBar(achievement.progress, achievement.maxProgress)}
                  </View>
                )}

                {/* Category Badge */}
                <View style={styles.achievementFooter}>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: achievementCategoryColors[achievement.category] + '20' }
                  ]}>
                    <Text style={[
                      styles.categoryBadgeText,
                      { color: achievementCategoryColors[achievement.category] }
                    ]}>
                      {achievement.category}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
  },
  settingsButton: {
    padding: 8,
  },
  demoModeIndicator: {
    backgroundColor: Colors.warning + '20',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  demoModeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.warning,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.secondaryDark,
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
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    textAlign: 'center',
    lineHeight: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
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
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
  },
  editButton: {
    padding: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textBody,
    marginLeft: 6,
  },
  joinDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinDateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    marginLeft: 6,
  },
  scoreCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
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
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
  },
  scoreValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
  },
  scoreBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textBody,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textBody,
  },
  activeTabText: {
    color: Colors.secondaryDark,
  },
  tabContent: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 16,
  },
  // Communities Tab Styles
  communitiesOverview: {
    marginBottom: 24,
  },
  communitiesStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  communityStatCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  communityStatNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginTop: 6,
    marginBottom: 2,
  },
  communityStatLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: Colors.textBody,
    textAlign: 'center',
  },
  communityCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
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
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  communityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 2,
  },
  communityType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textBody,
    textTransform: 'capitalize',
  },
  engagementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  engagementText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  communityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radiusText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    marginLeft: 4,
  },
  communityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textBody,
    marginLeft: 6,
  },
  communityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  joinedDate: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },
  inactiveBadge: {
    backgroundColor: Colors.textMuted + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inactiveText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  addCommunityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  addCommunityText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
    marginLeft: 8,
  },
  // Existing styles continue...
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },
  activityPoints: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
    marginBottom: 2,
  },
  actionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 2,
  },
  actionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.success,
    marginLeft: 4,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementStats: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textBody,
  },
  achievementFilter: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textBody,
  },
  filterButtonTextActive: {
    color: Colors.secondaryDark,
  },
  achievementCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 2,
  },
  achievementCardLocked: {
    backgroundColor: Colors.backgroundLight,
    opacity: 0.7,
  },
  achievementCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  achievementIconContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIcon: {
    fontSize: 40,
  },
  lockedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    flex: 1,
  },
  achievementTitleLocked: {
    color: Colors.textMuted,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    lineHeight: 20,
    marginBottom: 8,
  },
  achievementDescriptionLocked: {
    color: Colors.textMuted,
  },
  achievementRequirement: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.success,
  },
  achievementProgress: {
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textBody,
    minWidth: 40,
    textAlign: 'right',
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  achievementPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  achievementPreviewIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementPreviewInfo: {
    flex: 1,
  },
  achievementPreviewTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 2,
  },
  achievementPreviewDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },
});