import { apiClient } from '@/core/api/axios-client';
import type {
  VoiceAnnotationJob,
  VoiceAnnotationJobListResponse,
  VoiceAnnotationJobSummary,
  VoiceAnnotationUtteranceListResponse,
  UpdateGroundTruthRequest,
  UpdateGroundTruthResponse,
} from './voice-annotation-types';

/**
 * Voice Annotation API service.
 *
 * All endpoints require JWT (role: annotator or admin).
 */
export const voiceAnnotationApi = {
  /** GET /voice-annotation/jobs — list jobs needing voice annotation */
  getJobs: (params?: { page?: number; page_size?: number; dataset_id?: string }) =>
    apiClient
      .get<VoiceAnnotationJobListResponse>('/voice-annotation/jobs', { params })
      .then((r) => r.data),

  /**
   * Every job for a dataset. /voice-annotation/jobs is paginated, so one call
   * only returns a single page; walk all pages so older jobs are not silently
   * dropped from the list.
   */
  getAllJobs: async (datasetId?: string): Promise<VoiceAnnotationJobListResponse> => {
    const pageSize = 100;
    const items: VoiceAnnotationJob[] = [];
    let page = 1;
    let pages = 1;
    let total = 0;

    do {
      const { data } = await apiClient.get<VoiceAnnotationJobListResponse>(
        '/voice-annotation/jobs',
        { params: { page, page_size: pageSize, dataset_id: datasetId } },
      );
      items.push(...data.items);
      pages = data.pages;
      total = data.total;
      page += 1;
    } while (page <= pages);

    return { items, total, page: 1, page_size: items.length, pages: 1 };
  },

  /** GET /voice-annotation/jobs/:jobId — job summary */
  getJobSummary: (jobId: string) =>
    apiClient
      .get<VoiceAnnotationJobSummary>(`/voice-annotation/jobs/${jobId}`)
      .then((r) => r.data),

  /** GET /voice-annotation/jobs/:jobId/utterances — all utterances with flag data */
  getUtterances: (jobId: string) =>
    apiClient
      .get<VoiceAnnotationUtteranceListResponse>(`/voice-annotation/jobs/${jobId}/utterances`)
      .then((r) => r.data),

  /** PATCH /voice-annotation/utterances/:id — update ground truth */
  updateGroundTruth: (voiceAnnotationId: string, data: UpdateGroundTruthRequest) =>
    apiClient
      .patch<UpdateGroundTruthResponse>(`/voice-annotation/utterances/${voiceAnnotationId}`, data)
      .then((r) => r.data),

  /** POST /voice-annotation/jobs/:jobId/initialize — admin: manual init */
  initializeJob: (jobId: string) =>
    apiClient
      .post(`/voice-annotation/jobs/${jobId}/initialize`)
      .then((r) => r.data),
};
