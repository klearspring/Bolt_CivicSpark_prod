import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { X, Send, Clock, Heart, Award, MapPin, Users } from 'lucide-react-native';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  likes: number;
  isLiked: boolean;
}

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

interface MissionCommentsModalProps {
  visible: boolean;
  onClose: () => void;
  mission: Mission | null;
  onAddComment: (missionId: string, comment: Omit<Comment, 'id' | 'timestamp' | 'likes' | 'isLiked'>) => void;
  onUpdateCommentCount: (missionId: string, newCount: number) => void;
}

const mockComments: { [missionId: string]: Comment[] } = {
  '1': [
    {
      id: 'c1',
      author: 'Sarah Martinez',
      content: 'I attended last month\'s meeting and it was really informative! They discussed the new bike lane proposal. Highly recommend going.',
      timestamp: '2 hours ago',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 5,
      isLiked: false,
    },
    {
      id: 'c2',
      author: 'Mike Chen',
      content: 'Great mission! I\'m planning to attend the next one. Does anyone know if they provide parking validation?',
      timestamp: '1 hour ago',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 2,
      isLiked: true,
    },
    {
      id: 'c3',
      author: 'Jennifer Walsh',
      content: 'Yes, they validate parking in the city hall garage. Also, meetings are usually livestreamed if you can\'t make it in person.',
      timestamp: '45 minutes ago',
      avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 8,
      isLiked: false,
    },
  ],
  '2': [
    {
      id: 'c4',
      author: 'David Kim',
      content: 'I hosted one of these last month and it was amazing! We had 12 neighbors show up and discussed the new community garden proposal. Really builds connections.',
      timestamp: '3 hours ago',
      avatar: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 6,
      isLiked: true,
    },
    {
      id: 'c5',
      author: 'Lisa Rodriguez',
      content: 'This sounds wonderful! I\'d love to host one in my area. Any tips for first-time hosts?',
      timestamp: '2 hours ago',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 3,
      isLiked: false,
    },
  ],
};

const categoryColors = {
  community: '#EA580C',
  government: '#2563EB', 
  environment: '#059669',
  education: '#7C3AED'
};

const targetTypeColors = {
  neighborhood: '#2563EB',
  circle: '#059669'
};

export default function MissionCommentsModal({ 
  visible, 
  onClose, 
  mission, 
  onAddComment,
  onUpdateCommentCount 
}: MissionCommentsModalProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(
    mission ? mockComments[mission.id] || [] : []
  );
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (mission) {
      setComments(mockComments[mission.id] || []);
    }
  }, [mission]);

  const handleAddComment = () => {
    if (!newComment.trim() || !mission) return;

    const comment: Comment = {
      id: `c${Date.now()}`,
      author: 'You',
      content: newComment.trim(),
      timestamp: 'Just now',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 0,
      isLiked: false,
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    
    // Update the parent component
    onAddComment(mission.id, {
      author: comment.author,
      content: comment.content,
      avatar: comment.avatar,
    });
    
    onUpdateCommentCount(mission.id, updatedComments.length);
    
    setNewComment('');

    // Show success feedback
    if (Platform.OS !== 'web') {
      Alert.alert('Success', 'Comment added successfully!');
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          const isCurrentlyLiked = likedComments.has(commentId);
          const newLikedComments = new Set(likedComments);
          
          if (isCurrentlyLiked) {
            newLikedComments.delete(commentId);
            setLikedComments(newLikedComments);
            return { ...comment, likes: comment.likes - 1, isLiked: false };
          } else {
            newLikedComments.add(commentId);
            setLikedComments(newLikedComments);
            return { ...comment, likes: comment.likes + 1, isLiked: true };
          }
        }
        return comment;
      })
    );
  };

  if (!mission) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mission Discussion</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Mission Card */}
          <View style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColors[mission.category] }]}>
                <Text style={styles.categoryText}>{mission.category.toUpperCase()}</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Award size={12} color="#2563EB" />
                <Text style={styles.pointsText}>{mission.points} pts</Text>
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
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.detailText}>{mission.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.detailText}>{mission.duration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Users size={14} color="#6B7280" />
                <Text style={styles.detailText}>{mission.participants} joined</Text>
              </View>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Discussion ({comments.length})
            </Text>
            
            {comments.length === 0 ? (
              <View style={styles.noComments}>
                <Text style={styles.noCommentsText}>
                  No comments yet. Start the conversation about this mission!
                </Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.authorInfo}>
                      <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                      <View>
                        <Text style={styles.commentAuthor}>{comment.author}</Text>
                        <View style={styles.timestampContainer}>
                          <Clock size={10} color="#9CA3AF" />
                          <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.likeButton}
                      onPress={() => handleLikeComment(comment.id)}
                    >
                      <Heart 
                        size={16} 
                        color={likedComments.has(comment.id) ? '#DC2626' : '#9CA3AF'}
                        fill={likedComments.has(comment.id) ? '#DC2626' : 'none'}
                      />
                      <Text style={[
                        styles.likeCount,
                        likedComments.has(comment.id) && styles.likeCountActive
                      ]}>
                        {comment.likes}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              ))
            )}
          </View>

          {/* Engagement Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Discussion Tips</Text>
            <View style={styles.tip}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Share your experience if you've done this mission before</Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Ask questions to help others prepare</Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Coordinate with neighbors to attend together</Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Share resources or helpful links</Text>
            </View>
          </View>
        </ScrollView>

        {/* Add Comment Input */}
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your thoughts, ask questions, or offer tips..."
            placeholderTextColor="#9CA3AF"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Send size={16} color={!newComment.trim() ? '#9CA3AF' : '#FFFFFF'} />
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
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
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
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
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
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
    color: '#111827',
    marginBottom: 8,
  },
  missionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  missionDetails: {
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  commentsSection: {
    marginBottom: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  noComments: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  noCommentsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  commentCard: {
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
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentAuthor: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  commentTimestamp: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  likeCount: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  likeCountActive: {
    color: '#DC2626',
  },
  commentContent: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 18,
  },
  tipsContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
    marginRight: 8,
    width: 12,
  },
  tipText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 18,
    flex: 1,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#F9FAFB',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});