import { z } from 'zod';

export const userIdSchema = z.string().uuid({ message: 'Invalid UUID format' });

export const aiScannerSchema = z.object({
  receipt_content: z.string().min(1, 'Receipt content is required').max(5000),
});

export const aiInsightsQuerySchema = userIdSchema;

export const safeToSpendQuerySchema = userIdSchema;