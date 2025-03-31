import { SecurityModuleOptions } from '../src/security/security.config';

export const securityConfig: SecurityModuleOptions = {
  helmet: true,
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  },
  rateLimit: {
    windowMs: 60 * 1000,
    max: 5,
  },
  auditLog: true,
  csp: {
    directives: {
      defaultSrc: ["'self'"],
    },
  },
  sanitize: true,
  referrerPolicy: { policy: 'no-referrer' },
  xFrameOptions: 'SAMEORIGIN',
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  xContentTypeOptions: true,
  expectCt: {
    enforce: true,
    maxAge: 30,
  },
  permissionsPolicy: {
    geolocation: ['self'],
    microphone: [],
  },
  crossOriginEmbedderPolicy: true,
};
