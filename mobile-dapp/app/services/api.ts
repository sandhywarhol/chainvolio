// Official ChainVolio API Service for Mobile
// MIRRORING DESKTOP LOGIC: Uses /api/user/me as the single source of truth for identity

const BASE_URL = 'https://chainvolio.xyz/api'; 

/**
 * Validates identity and returns core profile stats.
 * Aligned with desktop root identity check.
 */
export const getUserMe = async (walletAddress: string) => {
  try {
    const response = await fetch(`${BASE_URL}/user/me?wallet=${walletAddress}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user/me:', error);
    throw error;
  }
};

export const getWalletScore = async (walletAddress: string) => {
  try {
    const response = await fetch(`${BASE_URL}/v1/wallet/${walletAddress}/score`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching wallet score:', error);
    throw error;
  }
};

export const getWalletReceipts = async (walletAddress: string) => {
  try {
    const response = await fetch(`${BASE_URL}/receipts?wallet=${walletAddress}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching receipts:', error);
    throw error;
  }
};

/**
 * Fetches dashboard stats.
 * Mirrored from /api/dashboard/stats
 */
export const getDashboardStats = async (walletAddress: string) => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard/stats?wallet=${walletAddress}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetches detailed profile.
 * Aligned with /api/profile
 */
export const getProfile = async (walletAddress: string) => {
  try {
    const response = await fetch(`${BASE_URL}/profile?wallet=${walletAddress}`);
    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (walletAddress: string, profileData: any) => {
  try {
    const response = await fetch(`${BASE_URL}/profile?wallet=${walletAddress}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const createReceipt = async (receiptData: any) => {
  try {
    const response = await fetch(`${BASE_URL}/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating receipt:', error);
    throw error;
  }
};
