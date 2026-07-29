import { UserProfile } from './profileService';

const N8N_WEBHOOK_URL = 'https://deepanshu1997.app.n8n.cloud/webhook/scheme-recommendation';

export interface WebhookProfilePayload {
  user_id: string;
  full_name: string;
  age: number;
  state: string;
  gender: string;
  education: string;
  annual_income: number;
  social_category: string;
  occupation: string;
}

/**
 * Maps the frontend UserProfile structure to the schema expected by the n8n webhook
 */
export const mapProfileToWebhookPayload = (profile: UserProfile, userId: string): WebhookProfilePayload => ({
  user_id: userId,
  full_name: profile.fullName,
  age: profile.age,
  state: profile.state,
  gender: profile.gender,
  education: profile.education,
  annual_income: profile.income,
  social_category: profile.category,
  occupation: profile.employment,
});

/**
 * Sends profile data to the n8n webhook and returns parsed recommendations.
 */
export async function getRecommendations(userId: string, profile: UserProfile): Promise<any[]> {
  const payload = mapProfileToWebhookPayload(profile, userId);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch (_) {
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Normalize n8n response to an array of recommendations
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.recommendations)) {
        return data.recommendations;
      }
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data.schemes)) {
        return data.schemes;
      }
      return [data];
    }

    return [];
  } catch (error: any) {
    console.error('Network or parsing error in n8nService:', error);
    if (error.message && error.message.includes('fetch')) {
      throw new Error('Network failure. Please check your internet connection and try again.');
    }
    throw error;
  }
}
