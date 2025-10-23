export const getDeviceAngle = (): number => {
  if (typeof window === "undefined" || !window.screen?.orientation?.type) {
    return 90;
  }
  return window.screen.orientation.angle;
};

export const getDeviceOrientation = (): string => {
  if (typeof window === "undefined" || !window.screen?.orientation?.type) {
    return "landscape";
  }
  return window.screen.orientation.type.startsWith("portrait")
    ? "portrait"
    : "landscape";
};

export const getDeviceType = (): string => {
  if (typeof window === "undefined" || !window.screen) {
    return "tablet";
  }

  const { width = 0, height = 0 } = window.screen;
  const orientation = window.screen.orientation?.type ?? "portrait-primary";
  const isPortrait = orientation.startsWith("portrait");

  return (isPortrait && width < 600 && width !== 534) ||
    (!isPortrait && height < 600 && height !== 534)
    ? "mobile"
    : "tablet";
};
