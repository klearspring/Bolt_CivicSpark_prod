import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Award, Target, Users, Calendar, MapPin, Mail, Phone, ChevronRight, Flame, TrendingUp, Star } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { AchievementService } from '@/services/achievementService';
import LocationPermissionGate from '@/components/LocationPermissionGate';

export default function ProfileTab() {
  const { user, isDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'achievements'>('overview');
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user achievements
  useEffect(() => {
    const loadAchievements = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const userAchievements = await AchievementService.getUserAchievementProgress(user.id);
        setAchievements(userAchievements);
      } catch (error) {
        console.error('Error loading achievements:', error);
        // Fallback to demo data if there's an error
        setAchievements(getDemoAchievements());
      } finally {
        setLoading(false);
      }
    };

    if (isDemoMode) {
      // Use demo data for demo mode
      setAchievements(getDemoAchievements());
      setLoading(false);
    } else {
      loadAchievements();
    }
  }, [user?.id, isDemoMode]);

  // Demo achievements data (for demo mode)
  const getDemoAchievements = () => [
    {
      id: 'welcome_to_civicspark',
      title: 'Welcome to CivicSpark',
      description: 'Welcome to the community! Your civic journey begins now.',
      icon: '🎉',
      rarity: 'common',
      unlocked: true,
      unlockedDate: '2024-01-15',
      progress: { current: 1, total: 1 }
    },
    {
      id: 'civic_starter',
      title: 'Civic Starter',
      description: 'Complete your first civic mission',
      icon: '🎯',
      rarity: 'common',
      unlocked: false,
      progress: { current: 0, total: 1 }
    },
    {
      id: 'community_connector',
      title: 'Community Connector',
      description: 'Join your first neighborhood circle',
      icon: '🤝',
      rarity: 'common',
      unlocked: false,
      progress: { current: 0, total: 1 }
    },
    {
      id: 'mission_veteran',
      title: 'Mission Veteran',
      description: 'Complete 5 civic missions',
      icon: '🏆',
      rarity: 'rare',
      unlocked: false,
      progress: { current: 0, total: 5 }
    },
    {
      id: 'super_connector',
      title: 'Super Connector',
      description: 'Join 5 neighborhood circles',
      icon: '🔗',
      rarity: 'epic',
      unlocked: false,
      progress: { current: 0, total: 5 }
    },
    {
      id: 'civic_legend',
      title: 'Civic Legend',
      description: 'Complete 25 civic missions',
      icon: '👑',
      rarity: 'legendary',
      unlocked: false,
      progress: { current: 0, total: 25 }
    }
  ];

  // Mock data for recent civic actions
  const mockCivicActions = [
    {
      id: '1',
      title: 'Signed up for CivicSpark',
      date: '2024-01-15',
      category: 'signup',
      points: 0,
      verified: true
    }
  ];

  // Mock data for communities
  const mockCommunities = [
    {
      id: '1',
      name: 'Downtown Neighborhood',
      type: 'neighborhood',
      memberCount: 1247,
      engagementLevel: 'low',
      missionsCompleted: 0,
      circlesJoined: 0,
      isActive: true,
      location: {
        address: 'Downtown District',
        radius: '0.5 miles'
      },
      joinedDate: '2023-12-15'
    }
  ];

  const rarityColors = {
    common: Colors.textMuted,
    rare: Colors.info,
    epic: Colors.warning,
    legendary: Colors.primary
  };

  const categoryIcons = {
    meeting: '🏛️',
    volunteer: '🤝',
    advocacy: '📢',
    mission: '🎯',
    signup: '🎉'
  };

  const engagementColors = {
    low: Colors.textMuted,
    medium: Colors.warning,
    high: Colors.success
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  // Helper function to format user location
  const formatUserLocation = () => {
    const city = user?.location?.city;
    const state = user?.location?.state;
    
    if (city && state) {
      return `${city}, ${state}`;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    }
    
    return 'Location not set';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* Civic Score Card */}
            <View style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                <View style={styles.scoreIconContainer}>
                  <TrendingUp size={24} color={Colors.primary} />
                </View>
                <View style={styles.scoreInfo}>
                  <Text style={styles.scoreTitle}>Civic Score</Text>
                  <Text style={styles.scoreValue}>{user?.civicProfile?.civicScore || 5}/100</Text>
                </View>
                <View style={styles.streakContainer}>
                  <Flame size={20} color={Colors.warning} />
                  <Text style={styles.streakText}>1 day streak</Text>
                </View>
              </View>
              <View style={styles.scoreProgress}>
                <View style={[styles.progressBar, { width: `${user?.civicProfile?.civicScore || 5}%` }]} />
              </View>
              <Text style={styles.scoreDescription}>
                Complete missions and join circles to increase your civic score!
              </Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Target size={20} color={Colors.primary} />
                <Text style={styles.statNumber}>{user?.civicProfile?.totalPoints || 0}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statCard}>
                <Award size={20} color={Colors.success} />
                <Text style={styles.statNumber}>{unlockedAchievements.length}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
              <View style={styles.statCard}>
                <Users size={20} color={Colors.info} />
                <Text style={styles.statNumber}>{user?.civicProfile?.joinedCircles?.length || 0}</Text>
                <Text style={styles.statLabel}>Circles</Text>
              </View>
            </View>

            {/* Recent Achievements */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Achievements</Text>
                <TouchableOpacity onPress={() => setActiveTab('achievements')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              {unlockedAchievements.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
                  {unlockedAchievements.slice(0, 4).map((achievement) => (
                    <View key={achievement.id} style={styles.achievementCard}>
                      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                      <Text style={styles.achievementTitle}>{achievement.title}</Text>
                      <View style={[styles.rarityBadge, { backgroundColor: rarityColors[achievement.rarity] + '20' }]}>
                        <Text style={[styles.rarityText, { color: rarityColors[achievement.rarity] }]}>
                          {achievement.rarity}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    Complete your first mission or join a circle to unlock achievements!
                  </Text>
                </View>
              )}
            </View>

            {/* Communities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Communities</Text>
              {mockCommunities.map((community) => (
                <View key={community.id} style={styles.communityCard}>
                  <View style={styles.communityHeader}>
                    <View style={styles.communityInfo}>
                      <Text style={styles.communityName}>{community.name}</Text>
                      <Text style={styles.communityType}>{community.type}</Text>
                    </View>
                    <View style={[styles.engagementBadge, { backgroundColor: engagementColors[community.engagementLevel] + '20' }]}>
                      <Text style={[styles.engagementText, { color: engagementColors[community.engagementLevel] }]}>
                        {community.engagementLevel}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.communityStats}>
                    <Text style={styles.communityStatText}>
                      {community.missionsCompleted} missions • {community.circlesJoined} circles
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 'actions':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Recent Civic Actions</Text>
            {mockCivicActions.map((action) => (
              <View key={action.id} style={styles.actionCard}>
                <View style={styles.actionHeader}>
                  <Text style={styles.actionIcon}>{categoryIcons[action.category]}</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDate}>{action.date}</Text>
                  </View>
                  <View style={styles.actionPoints}>
                    {action.points > 0 && <Text style={styles.pointsText}>+{action.points}</Text>}
                    {action.verified && <Text style={styles.verifiedText}>✓</Text>}
                  </View>
                </View>
              </View>
            ))}
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Start completing missions to see your civic actions here!
              </Text>
            </View>
          </View>
        );

      case 'achievements':
        return (
          <View style={styles.tabContent}>
            {/* Unlocked Achievements */}
            <Text style={styles.sectionTitle}>Unlocked Achievements ({unlockedAchievements.length})</Text>
            {unlockedAchievements.length > 0 ? (
              unlockedAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.fullAchievementCard}>
                  <View style={styles.achievementHeader}>
                    <Text style={styles.achievementIconLarge}>{achievement.icon}</Text>
                    <View style={styles.achievementDetails}>
                      <Text style={styles.achievementTitleLarge}>{achievement.title}</Text>
                      <Text style={styles.achievementDescription}>{achievement.description}</Text>
                      {achievement.unlockedDate && (
                        <Text style={styles.unlockedDate}>Unlocked on {achievement.unlockedDate}</Text>
                      )}
                    </View>
                    <View style={[styles.rarityBadge, { backgroundColor: rarityColors[achievement.rarity] + '20' }]}>
                      <Text style={[styles.rarityText, { color: rarityColors[achievement.rarity] }]}>
                        {achievement.rarity}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Complete missions and join circles to unlock achievements!
                </Text>
              </View>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>In Progress ({lockedAchievements.length})</Text>
                {lockedAchievements.map((achievement) => (
                  <View key={achievement.id} style={[styles.fullAchievementCard, styles.lockedCard]}>
                    <View style={styles.achievementHeader}>
                      <Text style={[styles.achievementIconLarge, styles.lockedIcon]}>🔒</Text>
                      <View style={styles.achievementDetails}>
                        <Text style={[styles.achievementTitleLarge, styles.lockedText]}>{achievement.title}</Text>
                        <Text style={[styles.achievementDescription, styles.lockedText]}>{achievement.description}</Text>
                        <View style={styles.progressContainer}>
                          <Text style={styles.progressText}>
                            {achievement.progress.current}/{achievement.progress.total}
                          </Text>
                          <View style={styles.progressBarContainer}>
                            <View style={[
                              styles.progressBarFill, 
                              { width: `${(achievement.progress.current / achievement.progress.total) * 100}%` }
                            ]} />
                          </View>
                        </View>
                      </View>
                      <View style={[styles.rarityBadge, { backgroundColor: Colors.textMuted + '20' }]}>
                        <Text style={[styles.rarityText, { color: Colors.textMuted }]}>
                          {achievement.rarity}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LocationPermissionGate>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image 
              source={{ uri: user?.avatar || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2' }} 
              style={styles.profileImage} 
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName || 'Alex Thompson'}</Text>
              <View style={styles.locationContainer}>
                <MapPin size={14} color={Colors.textBody} />
                <Text style={styles.locationText}>
                  {formatUserLocation()}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Mail size={12} color={Colors.textMuted} />
                  <Text style={styles.contactText}>{user?.email || 'demo@civicspark.com'}</Text>
                </View>
                {user?.phoneNumber && (
                  <View style={styles.contactItem}>
                    <Phone size={12} color={Colors.textMuted} />
                    <Text style={styles.contactText}>{user.phoneNumber}</Text>
                  </View>
                )}
              </View>
              {isDemoMode && (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoText}>🎭 Demo Mode</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.activeTabButtonText]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'actions' && styles.activeTabButton]}
            onPress={() => setActiveTab('actions')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'actions' && styles.activeTabButtonText]}>
              Actions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'achievements' && styles.activeTabButton]}
            onPress={() => setActiveTab('achievements')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'achievements' && styles.activeTabButtonText]}>
              Achievements
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
        </ScrollView>
      </SafeAreaView>
    </LocationPermissionGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textHeading,
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    marginLeft: 6,
  },
  contactInfo: {
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    marginLeft: 6,
  },
  demoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  demoText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.warning,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textBody,
  },
  activeTabButtonText: {
    color: Colors.secondaryDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.warning,
    marginLeft: 6,
  },
  scoreProgress: {
    height: 8,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  achievementsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  achievementCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    textAlign: 'center',
    marginBottom: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  communityCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 4,
  },
  communityType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    textTransform: 'capitalize',
  },
  engagementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  engagementText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  communityStats: {
    marginTop: 8,
  },
  communityStatText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },
  actionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 4,
  },
  actionDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
  },
  actionPoints: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.primary,
  },
  verifiedText: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 2,
  },
  fullAchievementCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lockedCard: {
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIconLarge: {
    fontSize: 40,
    marginRight: 16,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitleLarge: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textHeading,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textBody,
    marginBottom: 8,
  },
  unlockedDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },
  lockedText: {
    opacity: 0.7,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  emptyState: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});