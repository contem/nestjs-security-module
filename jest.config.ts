import type { Config } from 'jest';

const config: Config = {
  // Projenin kök dizininden başlat (test/ ve src/ dahil)
  rootDir: '.',

  // Hem .spec.ts hem .e2e-spec.ts dosyalarını test olarak tanır
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',

  // TypeScript dosyalarını jest'e dönüştür
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  // Hangi uzantılar dikkate alınsın
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Node ortamında test et (NestJS için uygun)
  testEnvironment: 'node',
};

export default config;
