# NestJS Security Module 🔐

[![npm version](https://badge.fury.io/js/nestjs-security-module.svg)](https://badge.fury.io/js/nestjs-security-module)
[![Downloads/week](https://img.shields.io/npm/dw/nestjs-security-module.svg)]()

> A plug-and-play security module for NestJS, bundling best-practice HTTP headers, CORS, rate-limiting, audit logging, CSP, XSS sanitization and more.

---

## Table of Contents

1. [Features](#features)  
2. [Installation](#installation)  
3. [Basic Usage](#basic-usage)  
4. [Async / Env-Based Configuration](#async--env-based-configuration)  
5. [Options Reference](#options-reference)  
6. [Example `.env`](#example-env)  

---

## Features

- 🔒 **Helmet** integration for standard security headers  
- 🌐 **CORS** support with customizable origins/methods  
- 🛡️ **Rate Limiting** (per-IP)  
- 📋 **Audit Logging** (to console + file)  
- 🛑 **Content-Security-Policy** (CSP)  
- 🧹 **XSS Sanitization** (deep sanitize middleware)  
- ⚙️ Additional headers: Referrer-Policy, HSTS, Expect-CT, Permissions-Policy, COEP …and more  

---

## Installation

```bash
npm install nestjs-security-module
# or
yarn add nestjs-security-module
````

---

## Basic Usage

Import and configure the module in your `AppModule`:

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { SecurityModule } from 'nestjs-security-module';

@Module({
  imports: [
    SecurityModule.forRoot({
      helmet: true,
      cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
      rateLimit: { windowMs: 60_000, max: 10 },
      auditLog: true,
      csp: true,
      sanitize: true,
      referrerPolicy: true,
      xFrameOptions: 'SAMEORIGIN',
      hsts: true,
      expectCt: true,
      permissionsPolicy: { geolocation: ['self'] },
      crossOriginEmbedderPolicy: true,
    }),
    // … your other modules
  ],
})
export class AppModule {}
```

---

## Async / Env-Based Configuration

If you prefer loading options from environment variables via `@nestjs/config`, use the async API:

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecurityModule } from 'nestjs-security-module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SecurityModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        helmet: cfg.get<boolean>('SECURITY_HELMET', true),
        cors: cfg.get<boolean>('SECURITY_CORS', true)
          ? {
              origin: cfg.get<string>('CORS_ORIGIN', '*'),
              methods: cfg.get<string>('CORS_METHODS', 'GET,HEAD,PUT,PATCH,POST,DELETE'),
            }
          : undefined,
        rateLimit: cfg.get<boolean>('SECURITY_RATE_LIMIT', true)
          ? {
              windowMs: cfg.get<number>('RATE_LIMIT_WINDOW', 60_000),
              max:      cfg.get<number>('RATE_LIMIT_MAX', 10),
            }
          : undefined,
        auditLog: cfg.get<boolean>('SECURITY_AUDIT_LOG', true),
        csp:      cfg.get<boolean>('SECURITY_CSP', true) ? { directives: { defaultSrc: ["'self'"] } } : undefined,
        sanitize: cfg.get<boolean>('SECURITY_SANITIZE', true),
        // …other flags
      }),
    }),
  ],
})
export class AppModule {}
```

---

## Options Reference

| Option                      | Type                                             | Description                                 |
| --------------------------- | ------------------------------------------------ | ------------------------------------------- |
| `helmet`                    | `boolean`                                        | Enable Helmet middleware                    |
| `cors`                      | `boolean \| { origin: string; methods: string }` | Enable/customize CORS                       |
| `rateLimit`                 | `{ windowMs: number; max: number }`              | IP-based rate limiting                      |
| `auditLog`                  | `boolean`                                        | Log requests to console + file              |
| `csp`                       | `boolean \| object`                              | Enable CSP (Content Security Policy)        |
| `sanitize`                  | `boolean`                                        | Deep sanitize incoming payloads             |
| `referrerPolicy`            | `boolean \| object`                              | Set Referrer-Policy header                  |
| `xFrameOptions`             | `boolean \| 'DENY' \| 'SAMEORIGIN'`              | Set X-Frame-Options header                  |
| `hsts`                      | `boolean \| object`                              | Enforce HTTPS via Strict-Transport-Security |
| `xContentTypeOptions`       | `boolean`                                        | Prevent MIME sniffing                       |
| `expectCt`                  | `boolean \| object`                              | Set Expect-CT header                        |
| `permissionsPolicy`         | `boolean \| Record<string, string[]>`            | Set Permissions-Policy header               |
| `crossOriginEmbedderPolicy` | `boolean \| object`                              | Enable COEP header                          |

---

## Example `.env`

```dotenv
SECURITY_HELMET=true
SECURITY_CORS=true
CORS_ORIGIN=*
CORS_METHODS=GET,HEAD,POST
SECURITY_RATE_LIMIT=true
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=10
SECURITY_AUDIT_LOG=true
SECURITY_CSP=true
SECURITY_SANITIZE=true
SECURITY_REFERRER=true
SECURITY_XFRAME=true
SECURITY_HSTS=true
SECURITY_HSTS_MAX_AGE=31536000
SECURITY_XCONTENT_TYPE_OPTIONS=true
SECURITY_EXPECT_CT=true
SECURITY_EXPECT_CT_MAX_AGE=30
SECURITY_PERMISSIONS=true
SECURITY_COEP=true
```

---

