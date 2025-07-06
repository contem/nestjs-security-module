import { DynamicModule, Type } from "@nestjs/common";

export interface SecurityModuleOptions {
  helmet?: boolean;
  cors?: boolean | Record<string, any>;
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  auditLog?: boolean;
  csp?: boolean | Record<string, any>; // ✅ CSP eklendi
  sanitize?: boolean; // ✅ yeni eklendi
  // ✅ Yeni gelişmiş güvenlik başlıkları
  referrerPolicy?: boolean | Record<string, any>;
  xFrameOptions?: boolean | 'DENY' | 'SAMEORIGIN';
  hsts?: boolean | Record<string, any>;
  xContentTypeOptions?: boolean;
  expectCt?: boolean | Record<string, any>;
  permissionsPolicy?: boolean | Record<string, string[]>;
  crossOriginEmbedderPolicy?: boolean | Record<string, any>;
}

export interface SecurityModuleAsyncOptions {
  imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule>>;
  inject?: any[];
  useFactory: (...args: any[]) => SecurityModuleOptions | Promise<SecurityModuleOptions>;
}