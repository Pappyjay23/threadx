interface PresenceAvatarProps {
  src?: string;
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PresenceAvatar = ({ src, isOnline, size = 'md' }: PresenceAvatarProps) => {
  const dimensions = {
    sm: 'h-8 w-8 rounded-[8px]',
    md: 'h-10 w-10 rounded-[10px]',
    lg: 'h-16 w-16 rounded-[16px]',
  };

  return (
    <div className="relative inline-block shrink-0 select-none">
      {src ? (
        <img src={src} alt="Avatar" className={`${dimensions[size]} object-cover bg-[#0c0926]`} />
      ) : (
        <div className={`${dimensions[size]} bg-gradient-to-br from-[#7556d3]/30 to-[#a286f7]/10 border border-[#7556d3]/20`} />
      )}
      <span
        className={`absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-[#10b981] ring-2 ring-[#060415] transition-all duration-300 ${
          isOnline ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      />
    </div>
  );
};

export default PresenceAvatar