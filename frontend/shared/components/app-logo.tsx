"use client";

import * as React from "react";
import Image from "next/image";

import { getLoginPageSettings } from "@/shared/api/auth";
import { useTheme } from "@/shared/components/theme-provider";
import { brandAssets, brandText } from "@/shared/lib/branding";

type AppLogoProps = {
  alt?: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
};

export const APP_LOGO_SETTINGS_CHANGED_EVENT = "deeix-chat:app-logo-settings-changed";

let cachedLogoURL: string | null = null;
let logoURLPromise: Promise<void> | null = null;
const logoURLListeners = new Set<() => void>();

function normalizeLogoURL(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return "";
}

function notifyLogoURLListeners() {
  logoURLListeners.forEach((listener) => listener());
}

function loadLogoURL() {
  if (cachedLogoURL !== null) return logoURLPromise;
  if (!logoURLPromise) {
    logoURLPromise = getLoginPageSettings()
      .then((settings) => {
        cachedLogoURL = normalizeLogoURL(settings.logoURL);
      })
      .catch(() => {
        cachedLogoURL = "";
      })
      .finally(() => {
        logoURLPromise = null;
        notifyLogoURLListeners();
      });
  }
  return logoURLPromise;
}

function useConfiguredLogoURL(): string {
  const [logoURL, setLogoURL] = React.useState(() => cachedLogoURL ?? "");

  React.useEffect(() => {
    let mounted = true;
    const update = () => {
      if (mounted) setLogoURL(cachedLogoURL ?? "");
    };
    const refresh = () => {
      cachedLogoURL = null;
      void loadLogoURL();
      update();
    };
    logoURLListeners.add(update);
    window.addEventListener(APP_LOGO_SETTINGS_CHANGED_EVENT, refresh);
    void loadLogoURL();
    update();
    return () => {
      mounted = false;
      logoURLListeners.delete(update);
      window.removeEventListener(APP_LOGO_SETTINGS_CHANGED_EVENT, refresh);
    };
  }, []);

  return logoURL;
}

export function AppLogo({
  alt = brandText.title,
  width,
  height,
  priority,
  className,
}: AppLogoProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Image
      src={brandAssets.logo ?? (resolvedTheme === "dark" ? "/logo-white.svg" : "/logo.svg")}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}

export function DeeixLogo({
  alt = "DEEIX Chat",
  width,
  height,
  priority,
  className,
}: AppLogoProps) {
  const { resolvedTheme } = useTheme();
  const configuredLogoURL = useConfiguredLogoURL();
  const [failedLogoURL, setFailedLogoURL] = React.useState("");
  const defaultLogoURL = resolvedTheme === "dark" ? "/logo-white.svg" : "/logo.svg";
  const canUseConfiguredLogo = configuredLogoURL && configuredLogoURL !== failedLogoURL;

  if (canUseConfiguredLogo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={configuredLogoURL}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setFailedLogoURL(configuredLogoURL)}
      />
    );
  }

  return (
    <Image
      src={defaultLogoURL}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
