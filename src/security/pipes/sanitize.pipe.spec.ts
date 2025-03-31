import { SanitizePipe } from './sanitize.pipe';

describe('SanitizePipe', () => {
  let pipe: SanitizePipe;

  beforeEach(() => {
    pipe = new SanitizePipe();
  });

  it('should sanitize dangerous HTML/script content', () => {
    const input = {
      name: '<script>alert("xss")</script>',
      nested: {
        comment: '<img src=x onerror=alert(1)>',
      },
    };

    const result = pipe.transform(input) as
      | Record<string, unknown>
      | null
      | undefined;

    if (result) {
      expect(result.name).not.toContain('<script>');
    }
    if (result && typeof result.nested === 'object' && result.nested !== null) {
      expect((result.nested as { comment: string }).comment).not.toContain(
        'onerror',
      );
    }
  });

  it('should not alter clean values', () => {
    const input = {
      name: 'Normal name',
      age: 30,
    };

    const result = pipe.transform(input) as
      | Record<string, unknown>
      | null
      | undefined;
    expect(result).toEqual(input);
  });

  it('should return null if input is null', () => {
    const result: Record<string, unknown> | null | undefined = pipe.transform(
      null,
    ) as Record<string, unknown> | null | undefined;
    expect(result).toBeNull();
  });

  it('should return undefined if input is undefined', () => {
    const result = pipe.transform(undefined) as
      | Record<string, unknown>
      | null
      | undefined;
    expect(result).toBeUndefined();
  });
});
