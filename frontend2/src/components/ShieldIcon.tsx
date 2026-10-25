import React from "react";
import { LogoMark } from "./Logo";

interface ShieldIconProps {
  className?: string;
  size?: number;
}

/**
 * @deprecated Use `LogoMark` from `./Logo` instead.
 * Kept as a thin wrapper so older imports keep rendering the current brand mark.
 */
export const ShieldIcon: React.FC<ShieldIconProps> = ({ className = "", size = 128 }) => (
  <LogoMark size={size} className={className} />
);

export default ShieldIcon;
