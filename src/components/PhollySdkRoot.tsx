import { initPholly } from "pholly-web-sdk";
import { useKeycloak } from "phenom-auth-react-adapter";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  buildPhollyInitConfig,
  refNumFromPathname,
  resolveRefNumForPholly,
} from "../utils/phollyConfig";

type PhollyInstance = ReturnType<typeof initPholly>;

/**
 * Initializes Pholly after Keycloak auth, enables SPA navigation, and keeps
 * user / route / tenant context in sync (global attributes + baggage).
 */
const PhollySdkRoot = (): null => {
  const { keycloak } = useKeycloak();
  const location = useLocation();
  const phollyRef = useRef<PhollyInstance | null>(null);

  useLayoutEffect(() => {
    const env = window._env_;
    if (!env || !keycloak?.authenticated) {
      return;
    }
    if (phollyRef.current) {
      return;
    }

    const pholly = initPholly(
      buildPhollyInitConfig({ env, keycloak }) as Parameters<typeof initPholly>[0]
    );
    pholly.enableAutoNavigation();
    phollyRef.current = pholly;

    return () => {
      pholly.destroy();
      phollyRef.current = null;
    };
  }, [keycloak?.authenticated]);

  useEffect(() => {
    const pholly = phollyRef.current;
    if (!pholly?.isInitialized) {
      return;
    }

    const ud = keycloak?.tokenParsed?.userDetails;
    pholly.setGlobalAttributes({
      userId: ud?.legacyUserId ?? ud?.id,
      userEmail: ud?.userName,
      userName: keycloak?.tokenParsed?.name,
    });
  }, [
    keycloak?.tokenParsed?.userDetails?.id,
    keycloak?.tokenParsed?.userDetails?.userName,
    keycloak?.tokenParsed?.name,
  ]);

  useEffect(() => {
    const pholly = phollyRef.current;
    if (!pholly?.isInitialized) {
      return;
    }

    pholly.clearBaggage();

    let sessionRef = sessionStorage.getItem("refNum") || undefined;
    if (sessionRef && !location.pathname.includes(sessionRef)) {
      sessionStorage.removeItem("refNum");
      sessionRef = undefined;
    }

    let tenantRef: string | undefined;
    try {
      const t = JSON.parse(localStorage.getItem("selectedTenant") || "{}");
      tenantRef = t?.refNum;
    } catch {
      tenantRef = undefined;
    }

    const pathRef = refNumFromPathname(location.pathname);
    const refNum = resolveRefNumForPholly(sessionRef, tenantRef, pathRef);

    const ud = keycloak?.tokenParsed?.userDetails;
    const userId = ud?.legacyUserId ?? ud?.id;

    pholly.setGlobalAttributes({
      origin: window.location.origin,
      pathname: `${location.pathname}${location.search}`,
      refNum,
    });

    pholly.setBaggage({
      userId: userId != null ? String(userId) : "",
      refNum: refNum ?? "",
    });
  }, [
    location.pathname,
    location.search,
    keycloak?.tokenParsed?.userDetails?.id,
  ]);

  return null;
};

export default PhollySdkRoot;
