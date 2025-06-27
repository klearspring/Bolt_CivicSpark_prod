import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { ChevronUp, ChevronDown, MapPin, Users, Award, Star, Heart, MessageCircle } from 'lucide-react-native';

interface Candidate {
  id: string;
  name: string;
  bio: string;
  location: string;
  experience: string[];
  endorsements: number;
  votes: number;
  category: 'community' | 'education' | 'environment' | 'local-gov';
  civicScore: number;
  recentActions: string[];
  avatar: string;
}

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Maria Rodriguez',
    bio: 'Community organizer focused on affordable housing and tenant rights. Former teacher with 10 years of experience advocating for equitable policies.',
    location: 'Westside District',
    experience: ['Tenant Rights Advocate', 'Former Elementary Teacher', 'Housing Committee Member'],
    endorsements: 23,
    votes: 156,
    category: 'community',
    civicScore: 85,
    recentActions: ['Organized housing forum', 'Led tenant workshop', 'Attended 5 city council meetings'],
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  {
    id: '2',
    name: 'David Kim',
    bio: 'Environmental scientist and climate action advocate working to make our city carbon neutral by 2030.',
    location: 'Downtown Area',
    experience: ['Environmental Scientist', 'Climate Action Committee', 'Green Energy Consultant'],
    endorsements: 31,
    votes: 203,
    category: 'environment',
    civicScore: 92,
    recentActions: ['Led park cleanup', 'Presented climate plan', 'Organized bike-to-work day'],
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  {
    id: '3',
    name: 'Jennifer Walsh',
    bio: 'Parent and education advocate working to improve school funding and after-school programs in underserved communities.',
    location: 'Northside',
    experience: ['PTA President', 'Education Policy Volunteer', 'Youth Mentor'],
    endorsements: 18,
    votes: 127,
    category: 'education',
    civicScore: 78,
    recentActions: ['Lobbied for school funding', 'Organized parent meetings', 'Tutored students'],
    avatar: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  {
    id: '4',
    name: 'Robert Chen',
    bio: 'Small business owner and fiscal responsibility advocate with experience in local government budget analysis.',
    location: 'East District',
    experience: ['Small Business Owner', 'Budget Committee Volunteer', 'Chamber of Commerce'],
    endorsements: 15,
    votes: 98,
    category: 'local-gov',
    civicScore: 71,
    recentActions: ['Analyzed city budget', 'Hosted business forum', 'Volunteered at food bank'],
    avatar: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  }
];

const categoryColors = {
  community: '#EA580C',
  education: '#7C3AED',
  environment: '#059669',
  'local-gov': '#2563EB'
};

const categoryLabels = {
  community: 'Community',
  education: 'Education', 
  environment: 'Environment',
  'local-gov': 'Local Gov'
};

export default function DiscoverTab() {
  const [votedCandidates, setVotedCandidates] = useState<{[key: string]: 'up' | 'down'}>({});
  const [endorsedCandidates, setEndorsedCandidates] = useState<string[]>([]);

  const vote = (candidateId: string, voteType: 'up' | 'down') => {
    setVotedCandidates(prev => ({
      ...prev,
      [candidateId]: voteType
    }));
  };

  const toggleEndorsement = (candidateId: string) => {
    setEndorsedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Leaders</Text>
        <Text style={styles.headerSubtitle}>Find and support emerging civic leaders in your community</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Community Nominees</Text>
        <Text style={styles.sectionSubtitle}>
          These neighbors have been nominated by their communities for their civic engagement and leadership potential.
        </Text>
        
        {mockCandidates.map((candidate) => {
          const userVote = votedCandidates[candidate.id];
          const isEndorsed = endorsedCandidates.includes(candidate.id);
          
          return (
            <View key={candidate.id} style={styles.candidateCard}>
              <View style={styles.candidateHeader}>
                <Image source={{ uri: candidate.avatar }} style={styles.avatar} />
                <View style={styles.candidateInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.candidateName}>{candidate.name}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: categoryColors[candidate.category] }]}>
                      <Text style={styles.categoryText}>{categoryLabels[candidate.category]}</Text>
                    </View>
                  </View>
                  <View style={styles.locationRow}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.locationText}>{candidate.location}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.candidateBio}>{candidate.bio}</Text>
              
              {/* Civic Score */}
              <View style={styles.scoreContainer}>
                <View style={styles.scoreItem}>
                  <Award size={16} color="#2563EB" />
                  <Text style={styles.scoreLabel}>Civic Score</Text>
                  <Text style={styles.scoreValue}>{candidate.civicScore}/100</Text>
                </View>
                <View style={styles.scoreBar}>
                  <View style={[styles.scoreProgress, { width: `${candidate.civicScore}%` }]} />
                </View>
              </View>
              
              {/* Experience */}
              <View style={styles.experienceContainer}>
                <Text style={styles.experienceTitle}>Experience</Text>
                {candidate.experience.map((exp, index) => (
                  <View key={index} style={styles.experienceItem}>
                    <View style={styles.experienceDot} />
                    <Text style={styles.experienceText}>{exp}</Text>
                  </View>
                ))}
              </View>
              
              {/* Recent Actions */}
              <View style={styles.actionsContainer}>
                <Text style={styles.actionsTitle}>Recent Civic Actions</Text>
                {candidate.recentActions.slice(0, 2).map((action, index) => (
                  <Text key={index} style={styles.actionItem}>• {action}</Text>
                ))}
              </View>
              
              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Users size={14} color="#6B7280" />
                  <Text style={styles.statText}>{candidate.endorsements} endorsements</Text>
                </View>
                <View style={styles.statItem}>
                  <Star size={14} color="#6B7280" />
                  <Text style={styles.statText}>{candidate.votes} community votes</Text>
                </View>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.voteButton, userVote === 'up' && styles.upvotedButton]}
                  onPress={() => vote(candidate.id, 'up')}
                >
                  <ChevronUp size={16} color={userVote === 'up' ? '#059669' : '#6B7280'} />
                  <Text style={[styles.voteButtonText, userVote === 'up' && styles.upvotedText]}>
                    Upvote
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.endorseButton, isEndorsed && styles.endorsedButton]}
                  onPress={() => toggleEndorsement(candidate.id)}
                >
                  <Heart size={16} color={isEndorsed ? '#DC2626' : '#FFFFFF'} fill={isEndorsed ? '#DC2626' : 'none'} />
                  <Text style={[styles.endorseButtonText, isEndorsed && styles.endorsedText]}>
                    {isEndorsed ? 'Endorsed' : 'Endorse'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.messageButton}>
                  <MessageCircle size={16} color="#2563EB" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  candidateHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  candidateInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  candidateName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 6,
  },
  candidateBio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  scoreContainer: {
    marginBottom: 16,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  scoreValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  scoreBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  experienceContainer: {
    marginBottom: 16,
  },
  experienceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  experienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  experienceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 12,
  },
  experienceText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  actionItem: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 6,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  upvotedButton: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  voteButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginLeft: 4,
  },
  upvotedText: {
    color: '#059669',
  },
  endorseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  endorsedButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  endorseButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  endorsedText: {
    color: '#DC2626',
  },
  messageButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});