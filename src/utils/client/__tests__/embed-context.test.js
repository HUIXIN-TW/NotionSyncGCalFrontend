import { isNotionMobileApp, isNotionMobileUserAgent } from "@utils/client/embed-context";

describe("isNotionMobileUserAgent", () => {
  it("detects Notion Android user agents", () => {
    expect(
      isNotionMobileUserAgent(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) Notion-Android",
      ),
    ).toBe(true);
  });

  it("detects Notion iOS user agents", () => {
    expect(
      isNotionMobileUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) Notion-iOS",
      ),
    ).toBe(true);
  });

  it("ignores unrelated user agents", () => {
    expect(
      isNotionMobileUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15",
      ),
    ).toBe(false);
  });
});

describe("isNotionMobileApp", () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    if (originalNavigator) {
      Object.defineProperty(global, "navigator", {
        value: originalNavigator,
        configurable: true,
        writable: true,
      });
    } else {
      delete global.navigator;
    }
  });

  it("returns false when navigator is missing", () => {
    delete global.navigator;
    expect(isNotionMobileApp()).toBe(false);
  });

  it("falls back to navigator user agent when override is not provided", () => {
    Object.defineProperty(global, "navigator", {
      value: { userAgent: "Some UA Notion-Android 123" },
      configurable: true,
      writable: true,
    });

    expect(isNotionMobileApp()).toBe(true);
  });

  it("uses override when provided", () => {
    expect(
      isNotionMobileApp(
        "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Notion-Android",
      ),
    ).toBe(true);
    expect(
      isNotionMobileApp(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15",
      ),
    ).toBe(false);
  });
});
