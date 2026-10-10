import { apiClient } from '@/lib/axios';

export interface ReferralStats {
    referralCode: string;
    walletBalance: number;
    stats: {
        totalReferrals: number;
        qualifiedReferrals: number;
        pendingReferrals: number;
        totalEarned: number;
    };
    referrals: any[];
    ledger: any[];
    campaign: any;
}

export const referralApi = {
    // Customer
    getMyStats: async (): Promise<ReferralStats> => {
        const response = await apiClient.get('/referrals/my-stats');
        return response.data.data;
    },
    validateCode: async (code: string): Promise<any> => {
        const response = await apiClient.post('/referrals/validate-code', { code });
        return response.data;
    },
    
    // Admin
    getCampaign: async (): Promise<any> => {
        const response = await apiClient.get('/referrals/campaign');
        return response.data;
    },
    updateCampaign: async (data: any): Promise<any> => {
        const response = await apiClient.put('/referrals/campaign', data);
        return response.data;
    },
    getLedger: async (params?: any): Promise<any> => {
        const response = await apiClient.get('/referrals/ledger', { params });
        return response.data;
    },
    getConversions: async (params?: any): Promise<any> => {
        const response = await apiClient.get('/referrals/conversions', { params });
        return response.data;
    }
};
