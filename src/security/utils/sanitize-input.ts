import { JSDOM } from 'jsdom';
import * as createDOMPurify from 'isomorphic-dompurify';
import type { DOMPurify, WindowLike } from 'isomorphic-dompurify';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const window = new JSDOM('').window as unknown as Window;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const DOMPurify: DOMPurify = (createDOMPurify as any)(
  window as unknown as WindowLike,
);

/**
 * Derin XSS temizleyici: string, array ve nested object'leri sanitize eder.
 */
export function sanitizeInput<T>(value: T): T {
  if (typeof value === 'string') {
    return DOMPurify.sanitize(value) as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item: T extends Array<infer U> ? U : never) =>
      sanitizeInput(item),
    ) as unknown as T;
  }

  if (typeof value === 'object' && value !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const key in value as Record<string, unknown>) {
      sanitized[key] = sanitizeInput((value as Record<string, unknown>)[key]);
    }
    return sanitized as T;
  }

  return value;
}
