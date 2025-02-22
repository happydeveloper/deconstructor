"use client";

import { HouseIcon, GithubIcon, TwitterIcon } from "lucide-react";
import ThemeToggle from "./theme-toggle";

function OutboundButton({
  href,
  Icon,
}: {
  href: string;
  Icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
    >
      <Icon size={20} />
    </a>
  );
}

export default function Outbound() {
  return (
    <div className="absolute top-5 right-5 z-50">
      <div className="flex gap-1">
        <OutboundButton href="https://ayush.digital" Icon={HouseIcon} />
        <ThemeToggle />
        <OutboundButton
          href="https://github.com/hyusap/deconstructor"
          Icon={GithubIcon}
        />
        <OutboundButton href="https://x.com/hyusapx" Icon={TwitterIcon} />
      </div>
    </div>
  );
}
