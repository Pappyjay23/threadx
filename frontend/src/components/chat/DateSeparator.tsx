const DateSeparator = ({ label }: { label: string }) => {
  return (
    <div className='flex items-center gap-3 my-4 px-2'>
      <div className='flex-1 h-px bg-primary/10' />
      <span className='text-[10px] font-light text-foreground/40 tracking-wide shrink-0'>
        {label}
      </span>
      <div className='flex-1 h-px bg-primary/10' />
    </div>
  );
};

export default DateSeparator;