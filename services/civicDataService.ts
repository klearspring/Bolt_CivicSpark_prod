import { supabase } from '@/lib/supabase';

export interface CivicAction {
  id: string;
  title: string;
  date: string;
  category: 'mission' | 'meeting' | 'volunteer' | 'advocacy';
  points: number;
  verified: boolean;
}

export interface Achievement {
  id: string;
  achievementId: string;
  unlockedAt: string;
  progress: any;
}

export interface Community {
  id: string;
  name: string;
  type: 'neighborhood' | 'district' | 'city' | 'workplace' | 'school';
  memberCount: number;
  engagementLevel: 'low' | 'medium' | 'high';
  missionsCompleted: number;
  circlesJoined: number;
  isActive: boolean;
  location: {
    address: string;
    radius: string;
  };
  joinedDate: string;
}

export class CivicDataService {
  // Civic Actions
  static async getCivicActions(userId: string): Promise<CivicAction[]> {
    const { data, error } = await supabase
      .from('civic_actions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(action => ({
      id: action.id,
      title: action.title,
      date: action.created_at,
      category: action.action_type as any,
      points: action.points,
      verified: action.verified,
    }));
  }

  static async addCivicAction(userId: string, action: Omit<CivicAction, 'id' | 'date'>): Promise<CivicAction> {
    const { data, error } = await supabase
      .from('civic_actions')
      .insert({
        user_id: userId,
        action_type: action.category,
        title: action.title,
        points: action.points,
        verified: action.verified,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      title: data.title,
      date: data.created_at,
      category: data.action_type,
      points: data.points,
      verified: data.verified,
    };
  }

  // Achievements
  static async getAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(achievement => ({
      id: achievement.id,
      achievementId: achievement.achievement_id,
      unlockedAt: achievement.unlocked_at,
      progress: achievement.progress,
    }));
  }

  static async unlockAchievement(userId: string, achievementId: string, progress?: any): Promise<Achievement> {
    const { data, error } = await supabase
      .from('achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        progress: progress || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      achievementId: data.achievement_id,
      unlockedAt: data.unlocked_at,
      progress: data.progress,
    };
  }

  // Communities
  static async getCommunities(userId: string): Promise<Community[]> {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(community => ({
      id: community.id,
      name: community.community_name,
      type: community.community_type as any,
      memberCount: community.member_count,
      engagementLevel: community.engagement_level as any,
      missionsCompleted: community.missions_completed,
      circlesJoined: community.circles_joined,
      isActive: community.is_active,
      location: community.location,
      joinedDate: community.joined_at,
    }));
  }

  static async addCommunity(userId: string, community: Omit<Community, 'id' | 'joinedDate'>): Promise<Community> {
    const { data, error } = await supabase
      .from('communities')
      .insert({
        user_id: userId,
        community_name: community.name,
        community_type: community.type,
        member_count: community.memberCount,
        engagement_level: community.engagementLevel,
        missions_completed: community.missionsCompleted,
        circles_joined: community.circlesJoined,
        is_active: community.isActive,
        location: community.location,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.community_name,
      type: data.community_type,
      memberCount: data.member_count,
      engagementLevel: data.engagement_level,
      missionsCompleted: data.missions_completed,
      circlesJoined: data.circles_joined,
      isActive: data.is_active,
      location: data.location,
      joinedDate: data.joined_at,
    };
  }

  static async updateCommunity(userId: string, communityId: string, updates: Partial<Community>): Promise<Community> {
    const updateData: any = {};
    
    if (updates.name) updateData.community_name = updates.name;
    if (updates.type) updateData.community_type = updates.type;
    if (updates.memberCount !== undefined) updateData.member_count = updates.memberCount;
    if (updates.engagementLevel) updateData.engagement_level = updates.engagementLevel;
    if (updates.missionsCompleted !== undefined) updateData.missions_completed = updates.missionsCompleted;
    if (updates.circlesJoined !== undefined) updateData.circles_joined = updates.circlesJoined;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.location) updateData.location = updates.location;

    const { data, error } = await supabase
      .from('communities')
      .update(updateData)
      .eq('id', communityId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.community_name,
      type: data.community_type,
      memberCount: data.member_count,
      engagementLevel: data.engagement_level,
      missionsCompleted: data.missions_completed,
      circlesJoined: data.circles_joined,
      isActive: data.is_active,
      location: data.location,
      joinedDate: data.joined_at,
    };
  }

  // Update civic profile stats
  static async updateCivicProfile(userId: string, updates: {
    totalPoints?: number;
    completedMissions?: number;
    joinedCircles?: string[];
    achievements?: string[];
    civicScore?: number;
  }): Promise<void> {
    // Get current profile
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('civic_profile')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    const currentCivicProfile = currentProfile.civic_profile || {};
    const updatedCivicProfile = {
      ...currentCivicProfile,
      ...updates,
    };

    const { error } = await supabase
      .from('user_profiles')
      .update({ civic_profile: updatedCivicProfile })
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }
}