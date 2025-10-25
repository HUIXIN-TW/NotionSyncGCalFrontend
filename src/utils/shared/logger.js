const isServer = typeof window === "undefined";

function resolveIsProd() {
  if (isServer) {
    const b = // build time
      (
        process.env.AWS_BRANCH ||
        // runtime
        process.env.APP_ENV ||
        ""
      ).toLowerCase();
    return ["master", "production"].includes(b);
  } else {
    // client side
    const env = (process.env.APP_ENV || "").toLowerCase();
    return env === "production";
  }
}
const isProd = resolveIsProd();

// helpers
export function maskValue(value, visible = 4) {
  if (typeof value !== "string" || !value) return value;
  if (value.length <= visible) return "*".repeat(value.length);
  return `${value.slice(0, visible)}${"*".repeat(Math.max(4, value.length - visible))}`;
}

// sinks
const noop = () => {};
const sinks =
  !isServer && isProd
    ? { debug: noop, info: noop, warn: noop, error: noop, sensitive: noop }
    : {
        debug: (...args) => {
          if (!isProd) console.debug("[DEBUG]", ...args);
        },
        info: (...args) => {
          if (!isProd) console.info("[INFO]", ...args);
        },
        warn: (...args) => {
          if (!isProd) console.warn("[WARN]", ...args);
        },
        error: (...args) => {
          if (isProd) {
            const safe = args.map((a) => (a instanceof Error ? a.message : a));
            console.error("[ERROR]", ...safe);
          } else {
            console.error("[ERROR]", ...args);
          }
        },
        sensitive: (...args) => {
          if (!isServer) return;
          if (!isProd) console.log("[SENSITIVE]", ...args);
        },
      };

export default sinks;
export const isProdRuntime = isProd;
export const isServerRuntime = isServer;
