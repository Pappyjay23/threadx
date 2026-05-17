import Button from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
	const navigate = useNavigate();

	return (
		<section className='relative min-h-svh bg-[#060415] text-white overflow-hidden w-full flex justify-center items-center select-none'>
			<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7556d3]/5 rounded-full blur-[140px] pointer-events-none' />

			<div className='flex flex-col items-center px-4 relative z-10 text-center max-w-md'>
				<h1 className='text-[7rem] md:text-[11rem] font-extrabold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-700/40 select-none'>
					404
				</h1>

				<h2 className='font-semibold tracking-tight text-[1.5rem] md:text-[2.5rem] mt-2 text-primary capitalize'>
					Page not found
				</h2>

				<p className='text-sm text-zinc-400 font-normal leading-relaxed mt-2 max-w-xs'>
					Sorry the page you're looking for does not exist.
				</p>

				<Button
					btnStyle='outlined'
					className='mt-8 border-primary/50 text-zinc-300 hover:text-white hover:border-primary px-8 py-2.5 w-fit'
					onClick={() => navigate("/")}>
					Back to Workspace
				</Button>
			</div>
		</section>
	);
};

export default ErrorPage;
