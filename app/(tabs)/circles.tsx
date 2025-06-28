import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert, Platform } from 'react-native';
import { MapPin, Users, MessageCircle, Shield, Plus, Clock, MessageSquare, LogOut } from 'lucide-react-native';
import CreatePostModal from '@/components/CreatePostModal';
import CreateCircleModal from '@/components/CreateCircleModal';
import RepliesModal from '@/components/RepliesModal';
import { useAuth } from '@/contexts/AuthContext';

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

interface Discussion {
  id: string;
  circleId?: string;
  author: string;
  content: string;
  timestamp: string;
  replies: number;
  recipientType: 'everyone' | 'circle' | 'person';
  recipientName: string;
  avatar?: string;
}

interface Person {
  id: string;
  name: string;
  avatar: string;
}

// Demo circles for demo mode
const demoCircles: Circle[] = [
  {
    id: '1',
    name: 'Downtown Residents',
    description: 'Discussing local issues affecting downtown area residents, from parking to community events.',
    memberCount: 124,
    radius: '0.5 miles',
    category: 'general',
    recentActivity: '2 hours ago',
    isJoined: true
  },
  {
    id: '2',
    name: 'Affordable Housing Coalition',
    description: 'Working together to address housing affordability and promote inclusive development policies.',
    memberCount: 89,
    radius: '2 miles',
    category: 'housing',
    recentActivity: '4 hours ago',
    isJoined: false
  },
  {
    id: '3',
    name: 'Safe Streets Initiative',
    description: 'Neighbors collaborating to improve pedestrian safety and traffic calming measures.',
    memberCount: 67,
    radius: '1 mile',
    category: 'safety',
    recentActivity: '1 day ago',
    isJoined: true
  },
  {
    id: '4',
    name: 'Green Neighborhood Network',
    description: 'Environmental stewardship and sustainability initiatives for our local community.',
    memberCount: 156,
    radius: '3 miles',
    category: 'environment',
    recentActivity: '6 hours ago',
    isJoined: false
  }
];

const mockPeople: Person[] = [
  {
    id: '1',
    name: 'Sarah Martinez',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  {
    id: '3',
    name: 'Jennifer Walsh',
    avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  }
];

// Demo discussions for demo mode
const demoDiscussions: Discussion[] = [
  {
    id: '1',
    circleId: '1',
    author: 'Sarah M.',
    content: 'Has anyone noticed the increased foot traffic on Main Street? Wondering if we should propose more crosswalks to the city.',
    timestamp: '2 hours ago',
    replies: 8,
    recipientType: 'circle',
    recipientName: 'Downtown Residents',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  {
    id: '2',
    circleId: '3',
    author: 'Mike Chen',
    content: 'The new speed bumps on Oak Avenue seem to be working well. Cars are definitely slowing down near the school.',
    timestamp: '1 day ago',
    replies: 12,
    recipientType: 'circle',
    recipientName: 'Safe Streets Initiative',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  }
];

const categoryColors = {
  general: '#6B7280',
  housing: '#EA580C',
  safety: '#DC2626',
  environment: '#059669',
  schools: '#7C3AED'
};

const recipientTypeColors = {
  everyone: '#2563EB',
  circle: '#059669',
  person: '#EA580C'
};

export default function CirclesTab() {
  const { isDemoMode } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [userCreatedCircles, setUserCreatedCircles] = useState<Circle[]>([]);
  const [joinedCircles, setJoinedCircles] = useState<string[]>(['1', '3']);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'joined'>('joined');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateCircleModal, setShowCreateCircleModal] = useState(false);
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);

  // Initialize circles and discussions based on whether we're in demo mode
  useEffect(() => {
    if (isDemoMode) {
      setCircles(demoCircles);
      setDiscussions(demoDiscussions);
    } else {
      setCircles(userCreatedCircles);
      setDiscussions([]);
    }
  }, [isDemoMode, userCreatedCircles]);

  const joinCircle = (circleId: string) => {
    if (!joinedCircles.includes(circleId)) {
      setJoinedCircles([...joinedCircles, circleId]);
      // Update member count
      setCircles(prevCircles =>
        prevCircles.map(circle =>
          circle.id === circleId
            ? { ...circle, memberCount: circle.memberCount + 1 }
            : circle
        )
      );
    }
  };

  const leaveCircle = (circleId: string, circleName: string) => {
    const confirmLeave = () => {
      setJoinedCircles(joinedCircles.filter(id => id !== circleId));
      // Update member count
      setCircles(prevCircles =>
        prevCircles.map(circle =>
          circle.id === circleId
            ? { ...circle, memberCount: Math.max(0, circle.memberCount - 1) }
            : circle
        )
      );
      
      // Remove discussions from this circle
      setDiscussions(prevDiscussions =>
        prevDiscussions.filter(discussion => discussion.circleId !== circleId)
      );

      // Show success feedback
      if (Platform.OS !== 'web') {
        Alert.alert('Left Circle', `You have left ${circleName}`);
      }
    };

    // Show confirmation dialog
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Leave Circle',
        `Are you sure you want to leave "${circleName}"? You'll no longer see discussions from this circle.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: confirmLeave,
          },
        ]
      );
    } else {
      // For web, use confirm dialog
      if (confirm(`Are you sure you want to leave "${circleName}"? You'll no longer see discussions from this circle.`)) {
        confirmLeave();
      }
    }
  };

  const handleCreatePost = (postData: {
    content: string;
    recipientType: 'everyone' | 'circle' | 'person';
    recipientId?: string;
    recipientName: string;
  }) => {
    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      circleId: postData.recipientType === 'circle' ? postData.recipientId : undefined,
      author: 'You',
      content: postData.content,
      timestamp: 'Just now',
      replies: 0,
      recipientType: postData.recipientType,
      recipientName: postData.recipientName,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
    };

    setDiscussions([newDiscussion, ...discussions]);
  };

  const handleCreateCircle = (circleData: Omit<Circle, 'id' | 'memberCount' | 'recentActivity' | 'isJoined'>) => {
    const newCircle: Circle = {
      ...circleData,
      id: Date.now().toString(),
      memberCount: 1, // Creator is the first member
      recentActivity: 'Just created',
      isJoined: true, // Creator automatically joins
    };

    if (isDemoMode) {
      // In demo mode, add to the circles state
      setCircles([newCircle, ...circles]);
    } else {
      // In real user mode, add to userCreatedCircles
      setUserCreatedCircles([newCircle, ...userCreatedCircles]);
    }
    
    setJoinedCircles([...joinedCircles, newCircle.id]);
    
    // Show success feedback
    if (Platform.OS !== 'web') {
      Alert.alert('Success', 'Circle created successfully! You are now the first member.');
    }
  };

  const handleOpenReplies = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    setShowRepliesModal(true);
  };

  const handleAddReply = (discussionId: string, reply: any) => {
    // This would typically update the backend
    console.log('Reply added to discussion:', discussionId, reply);
  };

  const handleUpdateReplyCount = (discussionId: string, newCount: number) => {
    setDiscussions(prevDiscussions =>
      prevDiscussions.map(discussion =>
        discussion.id === discussionId
          ? { ...discussion, replies: newCount }
          : discussion
      )
    );
  };

  const filteredCircles = activeTab === 'joined' 
    ? circles.filter(circle => joinedCircles.includes(circle.id))
    : circles.filter(circle => !joinedCircles.includes(circle.id));

  const joinedCirclesList = circles.filter(circle => joinedCircles.includes(circle.id));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Neighborhood Circles</Text>
          <Text style={styles.headerSubtitle}>Connect with your local community</Text>
        </View>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MessageSquare size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'joined' && styles.activeTab]}
          onPress={() => setActiveTab('joined')}
        >
          <Text style={[styles.tabText, activeTab === 'joined' && styles.activeTabText]}>
            My Circles ({joinedCircles.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'joined' && (
          <>
            {/* Recent Discussions */}
            <Text style={styles.sectionTitle}>Recent Discussions</Text>
            {discussions.map((discussion) => (
              <View key={discussion.id} style={styles.discussionCard}>
                <View style={styles.discussionHeader}>
                  <View style={styles.authorInfo}>
                    <Image 
                      source={{ uri: discussion.avatar || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2' }} 
                      style={styles.avatar} 
                    />
                    <View>
                      <Text style={styles.authorName}>{discussion.author}</Text>
                      <View style={styles.timestampContainer}>
                        <Clock size={12} color="#9CA3AF" />
                        <Text style={styles.timestamp}>{discussion.timestamp}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                {/* Recipient Info */}
                <View style={styles.recipientContainer}>
                  <View style={[
                    styles.recipientBadge, 
                    { backgroundColor: recipientTypeColors[discussion.recipientType] + '20' }
                  ]}>
                    <Text style={[
                      styles.recipientText,
                      { color: recipientTypeColors[discussion.recipientType] }
                    ]}>
                      To: {discussion.recipientName}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.discussionContent}>{discussion.content}</Text>
                <View style={styles.discussionFooter}>
                  <TouchableOpacity 
                    style={styles.replyButton}
                    onPress={() => handleOpenReplies(discussion)}
                  >
                    <MessageCircle size={14} color="#6B7280" />
                    <Text style={styles.replyText}>
                      {discussion.replies} {discussion.replies === 1 ? 'reply' : 'replies'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Circles List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'joined' ? 'Your Circles' : 'Discover New Circles'}
          </Text>
          {activeTab === 'discover' && (
            <TouchableOpacity 
              style={styles.createCircleButton}
              onPress={() => setShowCreateCircleModal(true)}
            >
              <Plus size={16} color="#2563EB" />
              <Text style={styles.createCircleButtonText}>Create Circle</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {filteredCircles.map((circle) => {
          const isJoined = joinedCircles.includes(circle.id);
          
          return (
            <View key={circle.id} style={styles.circleCard}>
              <View style={styles.circleHeader}>
                <View style={[styles.categoryIndicator, { backgroundColor: categoryColors[circle.category] }]} />
                <View style={styles.circleInfo}>
                  <Text style={styles.circleName}>{circle.name}</Text>
                  <Text style={styles.circleDescription}>{circle.description}</Text>
                </View>
              </View>
              
              <View style={styles.circleStats}>
                <View style={styles.statItem}>
                  <Users size={16} color="#6B7280" />
                  <Text style={styles.statText}>{circle.memberCount} members</Text>
                </View>
                <View style={styles.statItem}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.statText}>{circle.radius} radius</Text>
                </View>
                <View style={styles.statItem}>
                  <MessageCircle size={16} color="#6B7280" />
                  <Text style={styles.statText}>{circle.recentActivity}</Text>
                </View>
              </View>
              
              <View style={styles.circleActions}>
                {isJoined ? (
                  <View style={styles.joinedActions}>
                    <View style={styles.memberBadge}>
                      <Shield size={16} color="#059669" />
                      <Text style={styles.memberBadgeText}>Member</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.leaveButton}
                      onPress={() => leaveCircle(circle.id, circle.name)}
                    >
                      <LogOut size={16} color="#DC2626" />
                      <Text style={styles.leaveButtonText}>Leave</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => joinCircle(circle.id)}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.joinButtonText}>Join Circle</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {/* Empty State for Discover */}
        {activeTab === 'discover' && filteredCircles.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>All Caught Up!</Text>
            <Text style={styles.emptyStateText}>
              You've joined all available circles in your area. Create a new circle to start building community around topics you care about.
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setShowCreateCircleModal(true)}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.emptyStateButtonText}>Create New Circle</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State for Joined Circles */}
        {activeTab === 'joined' && filteredCircles.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No Circles Yet</Text>
            <Text style={styles.emptyStateText}>
              You haven't joined any circles yet. Discover circles in your area or create your own to start connecting with neighbors.
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setActiveTab('discover')}
            >
              <Text style={styles.emptyStateButtonText}>Discover Circles</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePost={handleCreatePost}
        circles={joinedCirclesList}
        people={mockPeople}
      />

      <CreateCircleModal
        visible={showCreateCircleModal}
        onClose={() => setShowCreateCircleModal(false)}
        onCreateCircle={handleCreateCircle}
      />

      <RepliesModal
        visible={showRepliesModal}
        onClose={() => setShowRepliesModal(false)}
        discussion={selectedDiscussion}
        onAddReply={handleAddReply}
        onUpdateReplyCount={handleUpdateReplyCount}
      />
    </SafeAreaView>
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
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  createButton: {
    backgroundColor: '#2563EB',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#2563EB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
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
    color: '#111827',
  },
  createCircleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
    backgroundColor: '#F0F9FF',
  },
  createCircleButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginLeft: 6,
  },
  discussionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  discussionHeader: {
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  recipientContainer: {
    marginBottom: 8,
  },
  recipientBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recipientText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
  discussionContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  discussionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  replyText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 6,
  },
  circleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  circleHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  circleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  circleStats: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  circleActions: {
    marginTop: 4,
  },
  joinedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flex: 1,
    marginRight: 12,
  },
  memberBadgeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
    marginLeft: 8,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  leaveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginLeft: 6,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});