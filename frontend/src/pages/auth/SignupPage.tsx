import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";

const SignupPage = () => {
	const navigate = useNavigate();
	const { setIsAuthenticated } = useAuthStore();

	return (
		<div className='relative min-h-svh bg-[#060415] text-white flex items-center overflow-hidden selection:bg-[#7556d3]/30'>
			<div className='absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7556d3]/5 rounded-full blur-[140px] pointer-events-none' />
			<div className='absolute bottom-12 right-1/4 w-[400px] h-[400px] bg-[#6347b7]/5 rounded-full blur-[120px] pointer-events-none' />

			<div className='container mx-auto px-4 md:px-12 xl:px-16 w-full z-10 py-6 lg:py-0'>
				<div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center'>
					<div className='hidden lg:flex flex-col items-start lg:col-span-5 space-y-6 max-w-md'>
						<Link to='/landing' className='flex items-center gap-2 group'>
							<div className='relative h-10 w-10 rounded-[10px] bg-[#0c0926] border border-[#7556d3]/20 group-hover:border-[#7556d3]/50 transition-colors duration-300 overflow-hidden'>
								<img
									src='logo.png'
									alt='ThreadX'
									className='h-full w-full object-cover'
								/>
							</div>
							<div className='flex flex-col'>
								<span className='text-xl font-semibold tracking-tight text-white/95'>
									ThreadX
								</span>
								<span className='text-xs text-zinc-500 group-hover:text-[#a286f7] transition-colors duration-300'>
									← Back to Overview
								</span>
							</div>
						</Link>

						<h2 className='text-4xl font-semibold tracking-tighter leading-tight pt-4'>
							Simplicity is the ultimate premium feature.
						</h2>

						<p className='text-sm text-zinc-400 leading-relaxed'>
							Join a workspace calculated for deep focus. Access persistent
							architecture, automated contextual threading, and millisecond
							message delivery.
						</p>
					</div>

					<div className='col-span-1 lg:col-span-7 flex justify-center lg:justify-end w-full'>
						<div className='w-full max-w-[460px] rounded-[24px] border border-white/5 bg-[#0e0b24]/30 p-8 md:p-10 backdrop-blur-xl shadow-2xl'>
							{/* Mobile-Only Header Navigation */}
							<div className='flex lg:hidden items-center justify-center mb-8'>
								<Link
									to='/landing'
									className='text-[10px] font-medium text-zinc-200 hover:text-white transition-colors'>
									<div className='flex flex-col items-center gap-2'>
										<img
											src='logo.png'
											alt='ThreadX'
											className='h-8 w-8 rounded-[8px] object-contain'
										/>
										<span className='text-xl font-bold tracking-tighter'>
											ThreadX
										</span>
									</div>
								</Link>
							</div>

							<div className='space-y-1 mb-8 text-center'>
								<h1 className='text-xl md:text-2xl font-semibold tracking-tight text-white'>
									Create your account
								</h1>
								<p className='text-[10px] md:text-xs text-zinc-400 text-center'>
									Fill in your workspace credentials to begin.
								</p>
							</div>

							<button className='w-full flex items-center justify-center gap-3 bg-transparent border border-primary text-zinc-200 text-xs md:text-sm font-medium py-3 px-4 rounded-full transition-all duration-300 cursor-pointer active:scale-[0.99]'>
								<svg className='h-4 w-4' viewBox='0 0 24 24'>
									<path
										fill='#EA4335'
										d='M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.56 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3A7.02 7.02 0 0 1 12 5.04z'
									/>
									<path
										fill='#4285F4'
										d='M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46a5.5 5.5 0 0 1-2.4 3.61l3.71 2.87c2.17-2 3.42-4.94 3.42-8.63z'
									/>
									<path
										fill='#FBBC05'
										d='M5.36 14.5a6.95 6.95 0 0 1 0-5c-.17-.5-.4-1-.7-1.48l-3.86-3A11.96 11.96 0 0 0 0 12c0 2.53.78 4.88 2.14 6.83l3.86-3a7.1 7.1 0 0 1-.64-1.33z'
									/>
									<path
										fill='#34A853'
										d='M12 23c3.24 0 5.97-1.08 7.96-2.92l-3.71-2.87a7.03 7.03 0 0 1-10.45-3.71l-3.87 3A11.97 11.97 0 0 0 12 23z'
									/>
								</svg>
								Continue with Google
							</button>

							<div className='relative flex items-center my-6'>
								<div className='flex-grow border-t border-white/5'></div>
								<span className='flex-shrink mx-4 text-[10px] uppercase font-bold tracking-widest text-zinc-500 select-none'>
									or configure mail
								</span>
								<div className='flex-grow border-t border-white/5'></div>
							</div>

							<form
								className='space-y-4'
								onSubmit={(e) => {
									e.preventDefault();
									navigate("/");
									setIsAuthenticated(true);
								}}>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-1.5'>
										<label
											htmlFor='firstName'
											className='text-[9px] md:text-[11px] font-semibold tracking-wider uppercase text-zinc-400 block px-1'>
											First Name
										</label>
										<Input
											type='text'
											placeholder='John'
											id='firstName'
											name='firstName'
										/>
									</div>
									<div className='space-y-1.5'>
										<label
											htmlFor='lastName'
											className='text-[9px] md:text-[11px] font-semibold tracking-wider uppercase text-zinc-400 block px-1'>
											Last Name
										</label>
										<Input
											type='text'
											placeholder='Doe'
											id='lastName'
											name='lastName'
										/>
									</div>
								</div>

								<div className='space-y-1.5'>
									<label
										htmlFor='email'
										className='text-[9px] md:text-[11px] font-semibold tracking-wider uppercase text-zinc-400 block px-1'>
										Email Address
									</label>
									<Input
										type='email'
										placeholder='name@domain.com'
										id='email'
										name='email'
									/>
								</div>

								<div className='space-y-1.5'>
									<label
										htmlFor='password'
										className='text-[9px] md:text-[11px] font-semibold tracking-wider uppercase text-zinc-400 block px-1'>
										Password
									</label>
									<Input
										type='password'
										placeholder='••••••••••••'
										id='password'
										name='password'
									/>
								</div>

								<Button
									type='submit'
									className='w-full !mt-10 md:mt-6 py-3 shadow-lg shadow-[#7556d3]/10 text-xs'>
									Create Account
								</Button>
							</form>

							<div className='mt-8 pt-4 border-t border-white/5 text-center'>
								<p className='text-xs text-zinc-400'>
									Already have an account?{" "}
									<Link
										to='/login'
										className='text-[#a286f7] hover:text-[#7556d3] font-medium transition-colors duration-200'>
										Sign In
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignupPage;
