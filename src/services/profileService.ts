import { supabase } from './supabaseClient';

export interface UserProfile {
  fullName: string;
  age: number;
  state: string;
  gender: string;
  education: string;
  income: number;
  category: string;
  employment: string;
}

export interface DBProfile {
  id: string;
  user_id?: string;
  full_name: string;
  age: number;
  state: string;
  gender: string;
  education: string;
  annual_income: number;
  social_category: string;
  occupation: string;
  updated_at?: string;
}

// Map database snake_case structure to UI camelCase structure
export const mapDBToProfile = (db: DBProfile): UserProfile => ({
  fullName: db.full_name,
  age: db.age,
  state: db.state,
  gender: db.gender,
  education: db.education,
  income: Number(db.annual_income),
  category: db.social_category,
  employment: db.occupation,
});

// Map UI camelCase structure to database snake_case structure
export const mapProfileToDB = (profile: UserProfile, userId: string): DBProfile => {
  const db: DBProfile = {
    id: userId,
    user_id: userId,
    full_name: profile.fullName,
    age: profile.age,
    state: profile.state,
    gender: profile.gender,
    education: profile.education,
    annual_income: profile.income,
    social_category: profile.category,
    occupation: profile.employment,
  };
  return db;
};

/**
 * Fetch profile data for a specific user.
 */
export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .limit(1);

    if (error) {
      if (error.code === '42501') {
        return null;
      }
      throw error;
    }

    return data && data.length > 0 ? mapDBToProfile(data[0] as DBProfile) : null;
  } catch (error: any) {
    console.error('Error in fetchProfile:', error);
    if (error.code === '42501') {
      return null;
    }
    throw error;
  }
}

/**
 * Insert a new user profile or update if it already exists.
 */
export async function insertProfile(userId: string, profile: UserProfile): Promise<UserProfile> {
  const dbProfile = mapProfileToDB(profile, userId);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([dbProfile])
      .select();

    if (error) {
      // If code is 23505 (Unique violation / Duplicate key), fallback to update
      if (error.code === '23505') {
        return await updateProfile(userId, profile);
      }
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned from profile insertion.");
    }
    return mapDBToProfile(data[0] as DBProfile);
  } catch (error: any) {
    console.error('Error in insertProfile:', error);
    if (error.code === '23505') {
      return await updateProfile(userId, profile);
    }
    throw error;
  }
}

/**
 * Update an existing user profile.
 */
export async function updateProfile(userId: string, profile: UserProfile): Promise<UserProfile> {
  const dbProfile = mapProfileToDB(profile, userId);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(dbProfile)
      .eq('id', userId)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      // If no row was updated, the profile doesn't exist yet. Fallback to inserting!
      const { data: insData, error: insError } = await supabase
        .from('profiles')
        .insert([dbProfile])
        .select();

      if (insError) throw insError;
      if (!insData || insData.length === 0) {
        throw new Error("No data returned from fallback profile insertion.");
      }
      return mapDBToProfile(insData[0] as DBProfile);
    }

    return mapDBToProfile(data[0] as DBProfile);
  } catch (error: any) {
    console.error('Error in updateProfile:', error);
    throw error;
  }
}
