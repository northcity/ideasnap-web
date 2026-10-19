import { externalLinks } from "./content";

export type DownloadTarget = {
  platform: "ios" | "android" | "windows" | "macos-arm64" | "macos-x64" | "macos" | "linux" | "unknown";
  href: string;
  label: { zh: string; en: string };
  device: { zh: string; en: string };
};

export type DeviceSignals = {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  architecture?: string;
  webglRenderer?: string;
};

const makeTarget = (
  platform: DownloadTarget["platform"],
  value: Omit<DownloadTarget, "platform">,
): DownloadTarget => ({ platform, ...value });

const TARGETS: Record<DownloadTarget["platform"], DownloadTarget> = {
  ios: makeTarget("ios", {
    href: externalLinks.appStore,
    label: { zh: "前往 App Store", en: "Open App Store" },
    device: { zh: "iPhone / iPad", en: "iPhone / iPad" },
  }),
  android: makeTarget("android", {
    href: externalLinks.android,
    label: { zh: "下载 Android APK", en: "Download Android APK" },
    device: { zh: "Android 手机 / 平板", en: "Android phone / tablet" },
  }),
  windows: makeTarget("windows", {
    href: externalLinks.windowsSetup,
    label: { zh: "下载 Windows 安装版", en: "Download Windows Setup" },
    device: { zh: "Windows 电脑", en: "Windows PC" },
  }),
  "macos-arm64": makeTarget("macos-arm64", {
    href: externalLinks.macosArm64,
    label: { zh: "下载 macOS 版（Apple 芯片）", en: "Download for macOS (Apple silicon)" },
    device: { zh: "macOS · Apple 芯片", en: "macOS · Apple silicon" },
  }),
  "macos-x64": makeTarget("macos-x64", {
    href: externalLinks.macos,
    label: { zh: "下载 macOS 版（Intel 芯片）", en: "Download for macOS (Intel)" },
    device: { zh: "macOS · Intel 芯片", en: "macOS · Intel" },
  }),
  macos: makeTarget("macos", {
    href: "#desktop-packages",
    label: { zh: "选择 macOS 版本", en: "Choose a macOS build" },
    device: { zh: "macOS", en: "macOS" },
  }),
  linux: makeTarget("linux", {
    href: externalLinks.linuxDeb,
    label: { zh: "下载 Linux DEB", en: "Download Linux DEB" },
    device: { zh: "Linux", en: "Linux" },
  }),
  unknown: makeTarget("unknown", {
    href: "#all-downloads",
    label: { zh: "查看全部下载", en: "See all downloads" },
    device: { zh: "", en: "" },
  }),
};

function macArchitecture(signals: DeviceSignals): "macos-arm64" | "macos-x64" | "macos" {
  const renderer = String(signals.webglRenderer || "");
  // WebGL exposes the GPU even when UA-CH is unavailable (Safari).
  // "Apple GPU" is what Safari reports on Apple silicon.
  if (/Apple\s*(M\d|GPU|Silicon)/i.test(renderer)) return "macos-arm64";
  if (/\b(Intel|AMD|Radeon|Iris)\b/i.test(renderer)) return "macos-x64";

  const architecture = String(signals.architecture || "").toLowerCase();
  if (architecture === "arm" || architecture === "arm64" || architecture === "aarch64") return "macos-arm64";
  if (architecture === "x86" || architecture === "x86_64" || architecture === "amd64") return "macos-x64";

  // Unknown architecture is usually a modern Mac with WebGL blocked;
  // Apple silicon is the safer default, with a manual fallback below.
  return "macos-arm64";
}

export function detectDownloadTarget(signals: DeviceSignals): DownloadTarget {
  const ua = signals.userAgent || "";
  const platform = signals.platform || "";
  const isIPadDesktopMode = platform === "MacIntel" && signals.maxTouchPoints > 1;

  if (/iPhone|iPad|iPod/i.test(ua)) return TARGETS.ios;
  // Android before iPad desktop mode: mobile emulation can keep a MacIntel
  // platform while sending an Android user agent.
  if (/Android/i.test(ua)) return TARGETS.android;
  if (isIPadDesktopMode) return TARGETS.ios;
  if (/Windows|Win32|Win64|WOW64/i.test(ua)) return TARGETS.windows;
  if (/CrOS/i.test(ua)) return TARGETS.linux;
  if (/Macintosh|Mac OS X/i.test(ua) || /^Mac/i.test(platform)) return TARGETS[macArchitecture(signals)];
  if (/Linux/i.test(ua)) return TARGETS.linux;
  return TARGETS.unknown;
}

function readWebglRenderer(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return "";
    const extension = gl.getExtension("WEBGL_debug_renderer_info");
    if (!extension) return "";
    return String(gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) || "");
  } catch {
    return "";
  }
}

export async function resolveDownloadTarget(): Promise<DownloadTarget> {
  if (typeof navigator === "undefined") return TARGETS.unknown;

  let architecture = "";
  const userAgentData = (navigator as Navigator & {
    userAgentData?: { getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }> };
  }).userAgentData;
  if (userAgentData?.getHighEntropyValues) {
    try {
      const values = await userAgentData.getHighEntropyValues(["architecture"]);
      architecture = values.architecture || "";
    } catch {
      // Safari and some privacy modes do not expose UA-CH; WebGL is the fallback.
    }
  }

  return detectDownloadTarget({
    userAgent: navigator.userAgent || "",
    platform: navigator.platform || "",
    maxTouchPoints: navigator.maxTouchPoints || 0,
    architecture,
    webglRenderer: readWebglRenderer(),
  });
}
