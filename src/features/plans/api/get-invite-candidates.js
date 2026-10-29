import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

/**
 * Chỉ owner. q rỗng → chỉ bạn bè (tối đa 10); q ≥ 2 ký tự → bạn bè khớp tên + tối đa 10 user khác.
 * Đã loại owner và member hiện tại.
 * @returns {Promise} { candidates: [{ _id, displayName, username, avatar, isFriend }] }
 */
export const getInviteCandidates = async ({ planId, q }) => {
  const response = await api.get(`/v1/plans/${planId}/invite-candidates`, { params: { q: q || undefined } })
  return response.data
}

export const getInviteCandidatesQueryOptions = ({ planId, q = '' }) => {
  return queryOptions({
    queryKey: ['plans', 'detail', planId, 'candidates', q],
    queryFn: () => getInviteCandidates({ planId, q }),
    enabled: Boolean(planId) && (q.length === 0 || q.length >= 2),
    // Giữ kết quả cũ trong lúc gõ để danh sách không nhấp nháy
    placeholderData: keepPreviousData
  })
}

export const useInviteCandidates = ({ planId, q, queryConfig } = {}) => {
  return useQuery({
    ...getInviteCandidatesQueryOptions({ planId, q }),
    select: (data) => data?.candidates || [],
    ...queryConfig
  })
}
