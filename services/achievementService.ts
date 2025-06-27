// Achievement Service - Manages achievement unlocking and progress tracking
import { supabase } from '@/lib/supabase';
import { CivicDataService } from './civicDataService';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'welcome' | 'missions' | 'community' | 'engagement' | 'leadership' | 'special';
  requirements: {
    type: 'mission_count' | 'circle_count' | 'meeting_count' | 'streak_days' | 'points_total' | 'signup';
    target: number;
    description: string;
  };
  isDefault?: boolean; // For achievements given automatically
}

// Define all available achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Welcome Achievement (given automatically on signup)
  {
    id: 'welcome_to_civicspark',
    title: 'Welcome to CivicSpark',
    description: 'Welcome to the community! Your civic journey begins now.',
    icon: '🎉',
    rarity: 'common',
    category: 'welcome',
    requirements: {
      type: 'signup',
      target: 1,
      description: 'Sign up for CivicSpark'
    },
    isDefault: true
  },

  // Mission Achievements
  {
    id: 'civic_starter',
    title: 'Civic Starter',
    description: 'Complete your first civic mission',
    icon: '🎯',
    rarity: 'common',
    category: 'missions',
    requirements: {
      type: 'mission_count',
      target: 1,
      description: 'Complete 1 civic mission'
    }
  },
  {
    id: 'mission_veteran',
    title: 'Mission Veteran',
    description: 'Complete 5 civic missions',
    icon: '🏆',
    rarity: 'rare',
    category: 'missions',
    requirements: {
      type: 'mission_count',
      target: 5,
      description: 'Complete 5 civic missions'
    }
  },
  {
    id: 'civic_champion',
    title: 'Civic Champion',
    description: 'Complete 10 civic missions',
    icon: '🌟',
    rarity: 'epic',
    category: 'missions',
    requirements: {
      type: 'mission_count',
      target: 10,
      description: 'Complete 10 civic missions'
    }
  },
  {
    id: 'civic_legend',
    title: 'Civic Legend',
    description: 'Complete 25 civic missions',
    icon: '👑',
    rarity: 'legendary',
    category: 'missions',
    requirements: {
      type: 'mission_count',
      target: 25,
      description: 'Complete 25 civic missions'
    }
  },

  // Community Achievements
  {
    id: 'community_connector',
    title: 'Community Connector',
    description: 'Join your first neighborhood circle',
    icon: '🤝',
    rarity: 'common',
    category: 'community',
    requirements: {
      type: 'circle_count',
      target: 1,
      description: 'Join 1 neighborhood circle'
    }
  },
  {
    id: 'circle_explorer',
    title: 'Circle Explorer',
    description: 'Join 3 neighborhood circles',
    icon: '🔍',
    rarity: 'rare',
    category: 'community',
    requirements: {
      type: 'circle_count',
      target: 3,
      description: 'Join 3 neighborhood circles'
    }
  },
  {
    id: 'super_connector',
    title: 'Super Connector',
    description: 'Join 5 neighborhood circles',
    icon: '🔗',
    rarity: 'epic',
    category: 'community',
    requirements: {
      type: 'circle_count',
      target: 5,
      description: 'Join 5 neighborhood circles'
    }
  },
  {
    id: 'neighborhood_ambassador',
    title: 'Neighborhood Ambassador',
    description: 'Join 10 neighborhood circles',
    icon: '🏘️',
    rarity: 'legendary',
    category: 'community',
    requirements: {
      type: 'circle_count',
      target: 10,
      description: 'Join 10 neighborhood circles'
    }
  },

  // Engagement Achievements
  {
    id: 'meeting_regular',
    title: 'Meeting Regular',
    description: 'Attend 3 government meetings',
    icon: '🏛️',
    rarity: 'rare',
    category: 'engagement',
    requirements: {
      type: 'meeting_count',
      target: 3,
      description: 'Attend 3 government meetings'
    }
  },
  {
    id: 'civic_enthusiast',
    title: 'Civic Enthusiast',
    description: 'Earn 100 civic points',
    icon: '⭐',
    rarity: 'rare',
    category: 'engagement',
    requirements: {
      type: 'points_total',
      target: 100,
      description: 'Earn 100 civic points'
    }
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintain a 7-day civic engagement streak',
    icon: '🔥',
    rarity: 'epic',
    category: 'engagement',
    requirements: {
      type: 'streak_days',
      target: 7,
      description: 'Maintain 7-day engagement streak'
    }
  },
  {
    id: 'marathon_attendee',
    title: 'Marathon Attendee',
    description: 'Attend 10 government meetings',
    icon: '🏃‍♂️',
    rarity: 'legendary',
    category: 'engagement',
    requirements: {
      type: 'meeting_count',
      target: 10,
      description: 'Attend 10 government meetings'
    }
  }
];

export class AchievementService {
  // Grant default achievements to new users (called during signup)
  static async grantDefaultAchievements(userId: string): Promise<void> {
    console.log('🏆 Granting default achievements to new user:', userId);
    
    const defaultAchievements = ACHIEVEMENTS.filter(achievement => achievement.isDefault);
    
    for (const achievement of defaultAchievements) {
      try {
        await this.unlockAchievement(userId, achievement.id);
        console.log(`✅ Granted default achievement: ${achievement.title}`);
      } catch (error) {
        console.error(`❌ Failed to grant default achievement ${achievement.id}:`, error);
      }
    }
  }

  // Check and unlock achievements based on user progress
  static async checkAndUnlockAchievements(userId: string): Promise<string[]> {
    console.log('🔍 Checking achievements for user:', userId);
    
    try {
      // Get user's current achievements
      const userAchievements = await this.getUserAchievements(userId);
      const unlockedAchievementIds = userAchievements.map(a => a.achievementId);
      
      // Get user's civic profile and actions
      const userProfile = await this.getUserCivicStats(userId);
      
      const newlyUnlocked: string[] = [];
      
      // Check each achievement
      for (const achievement of ACHIEVEMENTS) {
        // Skip if already unlocked or is a default achievement
        if (unlockedAchievementIds.includes(achievement.id) || achievement.isDefault) {
          continue;
        }
        
        // Check if requirements are met
        if (this.checkRequirements(achievement, userProfile)) {
          try {
            await this.unlockAchievement(userId, achievement.id);
            newlyUnlocked.push(achievement.id);
            console.log(`🎉 Unlocked achievement: ${achievement.title}`);
          } catch (error) {
            console.error(`❌ Failed to unlock achievement ${achievement.id}:`, error);
          }
        }
      }
      
      return newlyUnlocked;
    } catch (error) {
      console.error('❌ Error checking achievements:', error);
      return [];
    }
  }

  // Check if achievement requirements are met
  private static checkRequirements(achievement: Achievement, userStats: any): boolean {
    const { type, target } = achievement.requirements;
    
    switch (type) {
      case 'mission_count':
        return userStats.completedMissions >= target;
      case 'circle_count':
        return userStats.joinedCircles >= target;
      case 'meeting_count':
        return userStats.meetingsAttended >= target;
      case 'points_total':
        return userStats.totalPoints >= target;
      case 'streak_days':
        return userStats.currentStreak >= target;
      case 'signup':
        return true; // Signup achievements are handled separately
      default:
        return false;
    }
  }

  // Get user's civic statistics
  private static async getUserCivicStats(userId: string): Promise<any> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('civic_profile')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Get civic actions to count meetings
      const { data: actions, error: actionsError } = await supabase
        .from('civic_actions')
        .select('action_type')
        .eq('user_id', userId)
        .eq('verified', true);

      if (actionsError) {
        throw actionsError;
      }

      const meetingsAttended = actions?.filter(action => action.action_type === 'meeting').length || 0;
      const civicProfile = profile?.civic_profile || {};

      return {
        completedMissions: civicProfile.completedMissions || 0,
        joinedCircles: civicProfile.joinedCircles?.length || 0,
        totalPoints: civicProfile.totalPoints || 0,
        currentStreak: 1, // TODO: Implement streak calculation
        meetingsAttended
      };
    } catch (error) {
      console.error('❌ Error getting user civic stats:', error);
      return {
        completedMissions: 0,
        joinedCircles: 0,
        totalPoints: 0,
        currentStreak: 0,
        meetingsAttended: 0
      };
    }
  }

  // Unlock a specific achievement
  static async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          progress: { completed: true }
        });

      if (error) {
        // If it's a duplicate key error, that's okay (already unlocked)
        if (error.code === '23505') {
          console.log(`ℹ️ Achievement ${achievementId} already unlocked for user ${userId}`);
          return;
        }
        throw error;
      }

      console.log(`✅ Achievement ${achievementId} unlocked for user ${userId}`);
    } catch (error) {
      console.error(`❌ Error unlocking achievement ${achievementId}:`, error);
      throw error;
    }
  }

  // Get user's achievements
  static async getUserAchievements(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting user achievements:', error);
      return [];
    }
  }

  // Get achievement by ID
  static getAchievementById(achievementId: string): Achievement | undefined {
    return ACHIEVEMENTS.find(achievement => achievement.id === achievementId);
  }

  // Get all achievements with user progress
  static async getUserAchievementProgress(userId: string): Promise<any[]> {
    try {
      const userAchievements = await this.getUserAchievements(userId);
      const userStats = await this.getUserCivicStats(userId);
      const unlockedIds = userAchievements.map(a => a.achievement_id);

      return ACHIEVEMENTS.map(achievement => {
        const isUnlocked = unlockedIds.includes(achievement.id);
        const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
        
        let progress = { current: 0, total: achievement.requirements.target };
        
        if (!isUnlocked) {
          // Calculate current progress for locked achievements
          switch (achievement.requirements.type) {
            case 'mission_count':
              progress.current = Math.min(userStats.completedMissions, achievement.requirements.target);
              break;
            case 'circle_count':
              progress.current = Math.min(userStats.joinedCircles, achievement.requirements.target);
              break;
            case 'meeting_count':
              progress.current = Math.min(userStats.meetingsAttended, achievement.requirements.target);
              break;
            case 'points_total':
              progress.current = Math.min(userStats.totalPoints, achievement.requirements.target);
              break;
            case 'streak_days':
              progress.current = Math.min(userStats.currentStreak, achievement.requirements.target);
              break;
          }
        } else {
          progress = { current: achievement.requirements.target, total: achievement.requirements.target };
        }

        return {
          ...achievement,
          unlocked: isUnlocked,
          unlockedDate: userAchievement?.unlocked_at?.split('T')[0],
          progress
        };
      });
    } catch (error) {
      console.error('❌ Error getting user achievement progress:', error);
      return [];
    }
  }
}