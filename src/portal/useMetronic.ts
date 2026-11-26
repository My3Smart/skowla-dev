
import { useEffect, useState } from "react";

const CSS = [
  "https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700",
  "/assets/plugins/global/plugins.bundle.css",
  "/assets/css/style.bundle.css",
];

const JS = [
  "/assets/plugins/global/plugins.bundle.js",
  "/assets/js/scripts.bundle.js",
];

// Shared across AppLayout remounts
let metronicPromise: Promise<void> | null = null;
let metronicLoaded = false;

function loadCSS() {
  CSS.forEach((href) => {
    const existing = Array.from(
      document.querySelectorAll<HTMLLinkElement>(
        'link[rel="stylesheet"]'
      )
    ).some((link) => link.href === new URL(href, window.location.href).href);

    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.metronic = href;

    document.head.appendChild(link);
  });
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const absoluteSrc = new URL(src, window.location.href).href;

    const existing = Array.from(
      document.querySelectorAll<HTMLScriptElement>("script[src]")
    ).find((script) => script.src === absoluteSrc);

    if (existing) {
      if (existing.dataset.metronicLoaded === "true") {
        resolve();
        return;
      }

      if (existing.dataset.metronicLoading === "true") {
        existing.addEventListener("load", () => resolve(), {
          once: true,
        });
        existing.addEventListener("error", () => reject(
          new Error(`Failed to load ${src}`)
        ), { once: true });
        return;
      }

      // An existing script may have been loaded elsewhere.
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.dataset.metronic = src;
    script.dataset.metronicLoading = "true";

    script.onload = () => {
      script.dataset.metronicLoaded = "true";
      delete script.dataset.metronicLoading;
      resolve();
    };

    script.onerror = () => {
      script.remove();
      reject(new Error(`Failed to load ${src}`));
    };

    document.body.appendChild(script);
  });
}

function configureBody() {
  document.body.id = "kt_app_body";

  document.body.setAttribute(
    "data-kt-app-header-fixed-mobile",
    "true"
  );

  document.body.setAttribute(
    "data-kt-app-toolbar-enabled",
    "true"
  );

  document.body.classList.add("app-default");
  document.body.style.background = "#f9f9f9";
  document.body.style.color = "#252f4a";

  document.documentElement.setAttribute(
    "data-bs-theme",
    "light"
  );
}

function loadMetronic(): Promise<void> {
  if (metronicLoaded) {
    return Promise.resolve();
  }

  if (metronicPromise) {
    return metronicPromise;
  }

  metronicPromise = (async () => {
    loadCSS();

    const win = window as any;

    if (!win.KTThemeMode) {
      win.KTThemeMode = {
        on: () => {},
        getMode: () => "light",
        getMenuMode: () => "light",
        setMode: () => {},
        init: () => {},
      };
    }

    for (const src of JS) {
      await loadScript(src);
    }

    metronicLoaded = true;
  })().catch((error) => {
    metronicPromise = null;
    throw error;
  });

  return metronicPromise;
}

export function useMetronic() {
  const [ready, setReady] = useState(metronicLoaded);

  useEffect(() => {
    let cancelled = false;

    configureBody();

    loadMetronic()
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch((error) => {
        console.error("Metronic loading failed:", error);
      });

    return () => {
      cancelled = true;

      // Do not remove the shared Metronic styles/scripts
      // during React Router navigation.
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const timer = window.setTimeout(() => {
      const win = window as any;

      // Initialize only the components needed by the header.
      // Avoid KTComponents.init() plus duplicate initializers.
      win.KTMenu?.createInstances?.();
      win.KTDrawer?.createInstances?.();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [ready]);

  return ready;
}
