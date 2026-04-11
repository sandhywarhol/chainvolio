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

export const getCertificates = async (walletAddress: string) => {
  try {
    const response = await fetch(`${BASE_URL}/certificates?wallet=${walletAddress}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

export const createCertificate = async (formData: FormData) => {
  try {
    const response = await fetch(`${BASE_URL}/certificates`, {
      method: 'POST',
      body: formData, // Fetch automatically sets multipart/form-data for FormData
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw error;
  }
};

export const createHiringCollection = async (hiringData: any) => {
  try {
    const response = await fetch(`${BASE_URL}/hiring/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hiringData),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating hiring collection:', error);
    throw error;
  }
};

export const deleteCertificate = async (id: string, walletAddress: string) => {
  try {
    const response = await fetch(`${BASE_URL}/certificates?id=${id}&wallet=${walletAddress}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
};
export const uploadAvatar = async (uri: string, walletAddress: string) => {
  try {
    const formData = new FormData();
    const fileName = `${walletAddress}-${Date.now()}.jpg`;
    
    // @ts-ignore
    formData.append('file', {
      uri: uri,
      name: fileName,
      type: 'image/jpeg',
    });
    formData.append('bucket', 'avatars');
    formData.append('path', fileName);

    const response = await fetch(`${BASE_URL}/storage/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Storage upload failed');
    }

    const data = await response.json();
    return data.url; // Returns the permanent cloud URL
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export default {
  getUserMe,
  getProfile,
  updateProfile,
  getDashboardStats,
  uploadAvatar
};
