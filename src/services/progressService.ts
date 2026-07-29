import { supabase } from './supabaseClient';

export interface UserProgress {
  id?: string;
  userId: string;
  profileCompleted: boolean;
  eligibilityChecked: boolean;
  recommendationsGenerated: number;
  applicationsStarted: number;
  applicationsSubmitted: number;
}

export interface DBProgress {
  id?: string;
  user_id: string;
  profile_completed: boolean;
  eligibility_checked: boolean;
  recommendations_generated: number;
  applications_started: number;
  applications_submitted: number;
  updated_at?: string;
}

export const mapDBToProgress = (db: DBProgress): UserProgress => ({
  id: db.id,
  userId: db.user_id,
  profileCompleted: db.profile_completed,
  eligibilityChecked: db.eligibility_checked,
  recommendationsGenerated: db.recommendations_generated || 0,
  applicationsStarted: db.applications_started || 0,
  applicationsSubmitted: db.applications_submitted || 0,
});

export const mapProgressToDB = (progress: UserProgress): DBProgress => {
  const db: DBProgress = {
    user_id: progress.userId,
    profile_completed: progress.profileCompleted,
    eligibility_checked: progress.eligibilityChecked,
    recommendations_generated: progress.recommendationsGenerated,
    applications_started: progress.applicationsStarted,
    applications_submitted: progress.applicationsSubmitted,
  };
  if (progress.id) {
    db.id = progress.id;
  }
  return db;
};

/**
 * Fetch user progress from Supabase using user_id
 */
export async function fetchProgress(userId: string): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      if (error.code === '42501') {
        return null;
      }
      throw error;
    }
    return data && data.length > 0 ? mapDBToProgress(data[0] as DBProgress) : null;
  } catch (error: any) {
    console.error('Error in fetchProgress, returning default local fallback:', error);
    if (error.code === '42501') {
      return null;
    }
    throw error;
  }
}

/**
 * Create a new user progress record if one doesn't exist
 */
export async function createProgress(userId: string): Promise<UserProgress> {
  const initialProgress: UserProgress = {
    userId: userId,
    profileCompleted: false,
    eligibilityChecked: false,
    recommendationsGenerated: 0,
    applicationsStarted: 0,
    applicationsSubmitted: 0,
  };

  try {
    const dbProgress = mapProgressToDB(initialProgress);
    // Populate id if required, matching authenticated user's ID
    dbProgress.id = userId;

    const { data, error } = await supabase
      .from('user_progress')
      .insert([dbProgress])
      .select();

    if (error) {
      // 23505 signals unique constraint violation for user_progress
      if (error.code === '23505') {
        const existing = await fetchProgress(userId);
        if (existing) return existing;
      }
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned from progress creation.");
    }
    return mapDBToProgress(data[0] as DBProgress);
  } catch (error: any) {
    console.error('Error in createProgress, falling back to local state:', error);
    return initialProgress;
  }
}

/**
 * Update specific fields in the user progress record
 */
export async function updateProgress(userId: string, updates: Partial<UserProgress>): Promise<UserProgress> {
  try {
    // 1. Fetch current progress using user_id
    const current = await fetchProgress(userId);
    let dbUpdates: DBProgress;

    if (!current) {
      dbUpdates = {
        id: userId,
        user_id: userId,
        profile_completed: updates.profileCompleted !== undefined ? updates.profileCompleted : false,
        eligibility_checked: updates.eligibilityChecked !== undefined ? updates.eligibilityChecked : false,
        recommendations_generated: updates.recommendationsGenerated !== undefined ? updates.recommendationsGenerated : 0,
        applications_started: updates.applicationsStarted !== undefined ? updates.applicationsStarted : 0,
        applications_submitted: updates.applicationsSubmitted !== undefined ? updates.applicationsSubmitted : 0,
      };
    } else {
      dbUpdates = {
        id: current.id || userId,
        user_id: userId,
        profile_completed: updates.profileCompleted !== undefined ? updates.profileCompleted : current.profileCompleted,
        eligibility_checked: updates.eligibilityChecked !== undefined ? updates.eligibilityChecked : current.eligibilityChecked,
        recommendations_generated: updates.recommendationsGenerated !== undefined ? updates.recommendationsGenerated : current.recommendationsGenerated,
        applications_started: updates.applicationsStarted !== undefined ? updates.applicationsStarted : current.applicationsStarted,
        applications_submitted: updates.applicationsSubmitted !== undefined ? updates.applicationsSubmitted : current.applicationsSubmitted,
      };
    }

    const { data, error } = await supabase
      .from('user_progress')
      .upsert(dbUpdates, { onConflict: 'user_id' })
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error("No data returned from progress update.");
    }
    return mapDBToProgress(data[0] as DBProgress);
  } catch (error: any) {
    console.error('Error in updateProgress, falling back to local state updates:', error);
    return {
      id: userId,
      userId: userId,
      profileCompleted: updates.profileCompleted !== undefined ? updates.profileCompleted : false,
      eligibilityChecked: updates.eligibilityChecked !== undefined ? updates.eligibilityChecked : false,
      recommendationsGenerated: updates.recommendationsGenerated !== undefined ? updates.recommendationsGenerated : 0,
      applicationsStarted: updates.applicationsStarted !== undefined ? updates.applicationsStarted : 0,
      applicationsSubmitted: updates.applicationsSubmitted !== undefined ? updates.applicationsSubmitted : 0,
    };
  }
}
