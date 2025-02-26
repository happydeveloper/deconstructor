"use client";

import { HouseIcon, GithubIcon, TwitterIcon } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import TTSToggle from "./tts-toggle";
import { useAtom } from "jotai";
import { ttsEnabledAtom } from "./tts-toggle";
import { speak } from "@/utils/tts";

function OutboundButton({
  href,
  icon: Icon,
  label,
  sound,
}: {
  href: string;
  icon: any;
  label: string;
  sound?: string;
}) {
  const [ttsEnabled] = useAtom(ttsEnabledAtom);

  const handleClick = () => {
    if (sound && ttsEnabled) {
      speak(sound);
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
      title={label}
    >
      <Icon size={20} />
    </a>
  );
}

export default function Outbound() {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <OutboundButton
        href="/"
        icon={HouseIcon}
        label="홈으로"
        sound="홈으로 이동합니다"
      />
      <OutboundButton
        href="https://github.com/your-repo"
        icon={GithubIcon}
        label="GitHub"
        sound="깃허브로 이동합니다"
      />
      <OutboundButton
        href="https://twitter.com/your-account"
        icon={TwitterIcon}
        label="Twitter"
        sound="트위터로 이동합니다"
      />
      <ThemeToggle />
      <TTSToggle />
    </div>
  );
}
