import {
  ReportReasonType,
  ReportStatusType,
  ReportType,
} from 'features/shared/report/report.types';

export const reportPopulate = [];
export const returnType: ReportType[] = ['comment', 'post', 'user'];
export const reportStatus: ReportStatusType[] = [
  'dismissed',
  'pending',
  'resolved',
  'reviewed',
];

export const reportReason: ReportReasonType[] = [
  'harassment',
  'inappropriate',
  'misinformation',
  'spam',
  'violence',
  'other',
];
