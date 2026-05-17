import Button from "@/components/ui/Button";
import { Link } from "react-router-dom";

const LandingPage = () => {
	return (
		<div className='relative min-h-svh bg-[#060415] text-white flex items-center overflow-hidden selection:bg-[#7556d3]/30'>
			{/* Ambient Premium Glow Layer */}
			<div className='absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7556d3]/10 rounded-full blur-[120px] pointer-events-none' />
			<div className='absolute bottom-1/4 right-10 w-[600px] h-[600px] bg-[#6347b7]/5 rounded-full blur-[150px] pointer-events-none' />

			<div className='container mx-auto px-6 md:px-12 xl:px-16 w-full z-10 py-12 lg:py-0'>
				<div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center'>
					<div className='flex flex-col items-start lg:col-span-5 space-y-6 max-w-xl'>
						<div className='flex items-center gap-2 group'>
							<img
								src='logo.png'
								alt='ThreadX Icon'
								className='h-10 w-10 rounded-[10px]'
							/>
							<span className='text-[1.7rem] font-semibold tracking-tighter text-white/90 group-hover:text-white transition-colors duration-300'>
								ThreadX
							</span>
						</div>

						<h1 className='text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] text-white'>
							Your workspace for{" "}
							<span className='text-transparent bg-clip-text bg-gradient-to-r from-[#a286f7] to-[#7556d3]'>
								structured
							</span>{" "}
							conversation.
						</h1>

						<p className='text-sm text-[#fff]/50 font-normal leading-relaxed max-w-md'>
							Connect your teams inside a real-time messaging workspace built
							for persistent engineering, advanced search capabilities, and
							noise-free threads.
						</p>

						<div className='pt-4 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto'>
							<Link to='/signup' className='w-full sm:w-auto'>
								<Button className='w-full sm:w-fit px-8 py-3 shadow-lg shadow-[#7556d3]/20'>
									Start Messaging
								</Button>
							</Link>
							<Link to='/login' className='w-full sm:w-auto'>
								<Button
									btnStyle='outlined'
									className='w-full sm:w-fit px-8 py-3 transition-all duration-300'>
									Sign In
								</Button>
							</Link>
						</div>
					</div>

					<div className='lg:col-span-7 flex justify-center lg:justify-end w-full relative group'>
						{/* Decorative Background Accent for Image */}
						<div className='absolute inset-0 bg-gradient-to-tr from-[#7556d3]/10 to-transparent rounded-[24px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none' />

						<div className='relative w-full max-w-[680px] rounded-[18px] border border-white/5 bg-[#0e0b24]/40 p-2 backdrop-blur-md shadow-2xl transition-all duration-500 hover:border-white/10 hover:scale-[1.01]'>
							{/* Window Top Bar Emulation */}
							<div className='flex items-center gap-1.5 px-3 pt-1 pb-3 border-b border-white/5'>
								<div className='w-2.5 h-2.5 rounded-full bg-green-500' />
								<div className='w-2.5 h-2.5 rounded-full bg-orange-500' />
								<div className='w-2.5 h-2.5 rounded-full bg-red-500' />
							</div>

							<div className='overflow-hidden rounded-b-[12px] bg-[#060415]'>
								<img
									src='dashboard.png'
									alt='ThreadX Interactive Architecture Dashboard Preview'
									className='w-full h-auto opacity-85 group-hover:opacity-100 transition-opacity duration-500 object-cover select-none pointer-events-none'
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
