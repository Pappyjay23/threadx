const LoadingPage = () => {
	return (
		<div className='relative min-h-svh bg-[#060415] text-white flex flex-col items-center justify-center overflow-hidden'>
			<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#7556d3]/10 rounded-full blur-[100px] pointer-events-none' />

			<div className='relative flex flex-col items-center z-10 space-y-6'>
				<img
					src='logo.png'
					alt='Loading Application'
					className='h-10 w-10 rounded-[8px] animate-spin'
				/>

				<div className='w-32 h-[3px] bg-secondary rounded-full overflow-hidden relative'>
					<div className='absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-[#a286f7] to-[#7556d3] rounded-full animate-[loading_1.5s_infinite_ease-in-out]' />
				</div>
			</div>
		</div>
	);
};

export default LoadingPage;
