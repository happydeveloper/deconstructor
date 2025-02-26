export interface TTSToggleEvent extends CustomEvent {
  detail: { enabled: boolean };
}

export interface TTSButtonProps {
  enabled: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
} 