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
import { X, Send, Clock, Heart } from 'lucide-react-native';

interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  likes: number;
  isLiked: boolean;
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

interface RepliesModalProps {
  visible: boolean;
  onClose: () => void;
  discussion: Discussion | null;
  onAddReply: (discussionId: string, reply: Omit<Reply, 'id' | 'timestamp' | 'likes' | 'isLiked'>) => void;
  onUpdateReplyCount: (discussionId: string, newCount: number) => void;
}

const mockReplies: { [discussionId: string]: Reply[] } = {
  '1': [
    {
      id: 'r1',
      author: 'Mike Chen',
      content: 'I\'ve noticed this too! The new coffee shop on Main Street has definitely brought more foot traffic. Maybe we could propose a crosswalk near the shop entrance?',
      timestamp: '1 hour ago',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 3,
      isLiked: false,
    },
    {
      id: 'r2',
      author: 'Jennifer Walsh',
      content: 'Great idea! I can help draft a proposal to submit to the city council. I have experience with traffic safety initiatives from my work with the school district.',
      timestamp: '45 minutes ago',
      avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 5,
      isLiked: true,
    },
    {
      id: 'r3',
      author: 'David Kim',
      content: 'Count me in! I walk that route daily with my kids. A crosswalk would make it much safer for families.',
      timestamp: '30 minutes ago',
      avatar: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 2,
      isLiked: false,
    },
  ],
  '2': [
    {
      id: 'r4',
      author: 'Sarah Martinez',
      content: 'This is fantastic news! I was worried about my kids walking to school on that street. The speed bumps are definitely working.',
      timestamp: '12 hours ago',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 4,
      isLiked: true,
    },
    {
      id: 'r5',
      author: 'Robert Chen',
      content: 'As a local business owner, I was initially concerned about the speed bumps affecting delivery trucks, but they\'ve adapted well and the safety benefits are clear.',
      timestamp: '8 hours ago',
      avatar: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 1,
      isLiked: false,
    },
  ],
};

const recipientTypeColors = {
  everyone: '#2563EB',
  circle: '#059669',
  person: '#EA580C'
};

export default function RepliesModal({ 
  visible, 
  onClose, 
  discussion, 
  onAddReply,
  onUpdateReplyCount 
}: RepliesModalProps) {
  const [newReply, setNewReply] = useState('');
  const [replies, setReplies] = useState<Reply[]>(
    discussion ? mockReplies[discussion.id] || [] : []
  );
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (discussion) {
      setReplies(mockReplies[discussion.id] || []);
    }
  }, [discussion]);

  const handleAddReply = () => {
    if (!newReply.trim() || !discussion) return;

    const reply: Reply = {
      id: `r${Date.now()}`,
      author: 'You',
      content: newReply.trim(),
      timestamp: 'Just now',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      likes: 0,
      isLiked: false,
    };

    const updatedReplies = [...replies, reply];
    setReplies(updatedReplies);
    
    // Update the parent component
    onAddReply(discussion.id, {
      author: reply.author,
      content: reply.content,
      avatar: reply.avatar,
    });
    
    onUpdateReplyCount(discussion.id, updatedReplies.length);
    
    setNewReply('');

    // Show success feedback
    if (Platform.OS !== 'web') {
      Alert.alert('Success', 'Reply added successfully!');
    }
  };

  const handleLikeReply = (replyId: string) => {
    setReplies(prevReplies => 
      prevReplies.map(reply => {
        if (reply.id === replyId) {
          const isCurrentlyLiked = likedReplies.has(replyId);
          const newLikedReplies = new Set(likedReplies);
          
          if (isCurrentlyLiked) {
            newLikedReplies.delete(replyId);
            setLikedReplies(newLikedReplies);
            return { ...reply, likes: reply.likes - 1, isLiked: false };
          } else {
            newLikedReplies.add(replyId);
            setLikedReplies(newLikedReplies);
            return { ...reply, likes: reply.likes + 1, isLiked: true };
          }
        }
        return reply;
      })
    );
  };

  if (!discussion) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Replies</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Original Discussion */}
          <View style={styles.originalPost}>
            <View style={styles.originalHeader}>
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
            
            <Text style={styles.originalContent}>{discussion.content}</Text>
          </View>

          {/* Replies Section */}
          <View style={styles.repliesSection}>
            <Text style={styles.repliesTitle}>
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </Text>
            
            {replies.length === 0 ? (
              <View style={styles.noReplies}>
                <Text style={styles.noRepliesText}>No replies yet. Be the first to respond!</Text>
              </View>
            ) : (
              replies.map((reply) => (
                <View key={reply.id} style={styles.replyCard}>
                  <View style={styles.replyHeader}>
                    <View style={styles.authorInfo}>
                      <Image source={{ uri: reply.avatar }} style={styles.replyAvatar} />
                      <View>
                        <Text style={styles.replyAuthor}>{reply.author}</Text>
                        <View style={styles.timestampContainer}>
                          <Clock size={10} color="#9CA3AF" />
                          <Text style={styles.replyTimestamp}>{reply.timestamp}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.likeButton}
                      onPress={() => handleLikeReply(reply.id)}
                    >
                      <Heart 
                        size={16} 
                        color={likedReplies.has(reply.id) ? '#DC2626' : '#9CA3AF'}
                        fill={likedReplies.has(reply.id) ? '#DC2626' : 'none'}
                      />
                      <Text style={[
                        styles.likeCount,
                        likedReplies.has(reply.id) && styles.likeCountActive
                      ]}>
                        {reply.likes}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.replyContent}>{reply.content}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Add Reply Input */}
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write a thoughtful reply..."
            placeholderTextColor="#9CA3AF"
            value={newReply}
            onChangeText={setNewReply}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newReply.trim() && styles.sendButtonDisabled]}
            onPress={handleAddReply}
            disabled={!newReply.trim()}
          >
            <Send size={16} color={!newReply.trim() ? '#9CA3AF' : '#FFFFFF'} />
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
  originalPost: {
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
  originalHeader: {
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
    marginBottom: 12,
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
  originalContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  repliesSection: {
    marginBottom: 20,
  },
  repliesTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  noReplies: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  noRepliesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  replyCard: {
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
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  replyAuthor: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  replyTimestamp: {
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
  replyContent: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 18,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  replyInput: {
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