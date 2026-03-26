import { generate } from "@/app/lib/generator";
import Form from "next/form";
import { useFormStatus } from "react-dom";

export default function RegenerateButton() {

    const { pending } = useFormStatus();



    return (
        <section className="p-20 flex items-center justify-center bg-white border-b-2 border-primary lg:border-b-0">
            <Form action={generate} className="w-full">
                <button disabled={pending} type="submit" className="disabled:opacity-50 disabled:cursor-wait glow-crimson group relative w-full flex items-center justify-center gap-6 bg-[#A50034] py-8 border-4 border-black transition-all duration-300 transform active:scale-[0.98]">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="material-symbols-outlined text-4xl text-[#feb700] group-hover:rotate-180 transition-transform duration-700 ease-in-out">auto_awesome</span>
                    <span className="font-headline text-4xl font-black text-white uppercase tracking-tighter">Regenerate Master Routine</span>
                    <span className="material-symbols-outlined text-4xl text-[#feb700] group-hover:rotate-180 transition-transform duration-700 ease-in-out">refresh</span>
                </button>

                <span className="block text-center mt-4 text-sm text-gray-500 italic">Clicking this will regenerate the master routine based on current data. This may take a few moments.</span>

            </Form>
        </section>
    );
}