interface ChipProps {
  text: string;
  textColor?: string;
  bgColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Chip({ text, textColor = "text-gray-800", bgColor = "bg-gray-100", className, style }: ChipProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  
  return (
    <span className={`${baseStyles} ${bgColor} ${textColor} ${className || ""}`} style={style}>
      {text}
    </span>
  );
} 