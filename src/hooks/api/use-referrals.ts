import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralApi } from '@/services/api/referral.api';

// Keys
export const referralKeys = {
    all: ['referrals'] as const,
    myStats: () => [...referralKeys.all, 'my-stats'] as const,
    campaign: () => [...referralKeys.all, 'campaign'] as const,
    ledger: () => [...referralKeys.all, 'ledger'] as const,
    conversions: () => [...referralKeys.all, 'conversions'] as const,
};

// Customer Hooks
export function useMyReferralStats() {
    return useQuery({
        queryKey: referralKeys.myStats(),
        queryFn: () => referralApi.getMyStats(),
    });
}

export function useValidateReferralCode() {
    return useMutation({
        mutationFn: (code: string) => referralApi.validateCode(code),
    });
}

// Admin Hooks
export function useAdminCampaign() {
    return useQuery({
        queryKey: referralKeys.campaign(),
        queryFn: () => referralApi.getCampaign(),
    });
}

export function useUpdateCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => referralApi.updateCampaign(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referralKeys.campaign() });
        },
    });
}

export function useAdminLedger(params?: any) {
    return useQuery({
        queryKey: [...referralKeys.ledger(), params],
        queryFn: () => referralApi.getLedger(params),
    });
}

export function useAdminConversions(params?: any) {
    return useQuery({
        queryKey: [...referralKeys.conversions(), params],
        queryFn: () => referralApi.getConversions(params),
    });
}
