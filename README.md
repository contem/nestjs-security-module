# NestJS Security Module 🔐

A plug-and-play security module for [NestJS](https://nestjs.com/) that enables security best practices in one go.

**Features:**
- ✅ Helmet integration (HTTP headers)
- ✅ CORS with custom options
- ✅ Rate limiting (per IP)
- ✅ Audit log middleware (file + stdout)
- ✅ CSP (Content Security Policy)
- ✅ XSS sanitization (deep recursive)
- ✅ Referrer-Policy, HSTS, Expect-CT, Permissions-Policy, COEP

---

## Installation

```bash
npm install nestjs-security-module
```

---

## Usage

```ts
// app.module.ts or test-app.module.ts
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
      rateLimit: {
        windowMs: 60 * 1000,
        max: 5,
      },
      auditLog: true,
      csp: true,
      sanitize: true,
      referrerPolicy: true,
      xFrameOptions: 'SAMEORIGIN',
      hsts: true,
      expectCt: true,
      permissionsPolicy: {
        geolocation: ['self'],
      },
      crossOriginEmbedderPolicy: true,
    }),
  ],
})
export class AppModule {}
```

---

## Custom Options

| Option                   | Type                              | Description                                 |
|--------------------------|-----------------------------------|---------------------------------------------|
| `helmet`                 | `boolean`                         | Enables Helmet middleware                   |
| `cors`                   | `boolean \| CorsOptions`          | Enables and configures CORS                 |
| `rateLimit`              | `{ windowMs: number; max: number }` | IP-based rate limiting                     |
| `auditLog`              | `boolean`                         | Logs request info to file + console         |
| `csp`                    | `boolean \| object`               | Enables Helmet CSP with optional config     |
| `sanitize`               | `boolean`                         | Sanitizes incoming body/query/params        |
| `referrerPolicy`         | `boolean \| object`               | Controls Referrer-Policy header             |
| `xFrameOptions`          | `boolean \| 'DENY' \| 'SAMEORIGIN'` | Controls X-Frame-Options header           |
| `hsts`                   | `boolean \| object`               | Enforces HTTPS via Strict-Transport         |
| `xContentTypeOptions`    | `boolean`                         | Prevents MIME sniffing                      |
| `expectCt`               | `boolean \| object`               | Enables Expect-CT header                    |
| `permissionsPolicy`      | `boolean \| object`               | Enables Permissions-Policy                  |
| `crossOriginEmbedderPolicy` | `boolean \| object`           | Enables COEP header                         |

---

## License

```
MIT 
```
