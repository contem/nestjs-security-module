import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';

export function createRateLimitMiddleware(options?: {
  windowMs?: number;
  max?: number;
}): RequestHandler {
  return rateLimit({
    windowMs: options?.windowMs ?? 60_000, // default: 1 dakika
    max: options?.max ?? 100, // default: 100 istek/IP
    standardHeaders: true, // RateLimit-* header’larını aktif et
    legacyHeaders: false, // X-RateLimit-* header’larını kapat
    message: 'Çok fazla istek gönderildi, lütfen sonra tekrar deneyin.',
  });
}
