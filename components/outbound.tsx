"use client";

import { HouseIcon, GithubIcon, TwitterIcon } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import TTSToggle from "./tts-toggle";

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
    <>
      <div className="absolute top-5 right-5 z-50">
        <div className="flex gap-1">
          {/* <OutboundButton href="https://ayush.digital" Icon={HouseIcon} /> */}
          <ThemeToggle />
          <TTSToggle />
          <OutboundButton
            href="https://github.com/happydeveloper/deconstructor/tree/ko-style"
            Icon={GithubIcon}
          />
          {/* <OutboundButton href="https://x.com/hyusapx" Icon={TwitterIcon} /> */}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 py-3 px-4 z-50 shadow-lg overflow-hidden">
  <div className="max-w-4xl mx-auto relative text-center h-8 overflow-hidden">
    <div className="rolling-text">
      <p className="text-xs text-gray-700 dark:text-gray-300">
        Inspired by
        <a 
          href="https://github.com/hyusap/deconstructor"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline mx-1 font-medium"
        >
          Deconstructor
        </a>
        by
        <a 
          href="https://ayush.digital"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline mx-1 font-medium"
        >
          Ayush Gupta
        </a>
      </p>

      <p className="text-xs text-gray-700 dark:text-gray-300">
        Extended with Korean learning content from
        <a 
          href="https://talktomeinkorean.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline mx-1 font-medium"
        >
          Talk To Me In Korean (TTMIK)
        </a>
      </p>

    </div>
  </div>
</div>


    </>
  );
}
