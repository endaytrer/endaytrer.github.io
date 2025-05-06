import { ReactNode } from 'react';
import "./crt.css";

function Crt({ children, cursor }: { children: ReactNode[], cursor: boolean }) {
    return <div className="crt
        mx-5
        text-2xl min-h-72 lg:min-h-96
        bg-emerald-700 dark:bg-emerald-900 rounded-2xl
        border-8 border-solid border-b-teal-400 dark:border-b-teal-950 border-x-teal-600 dark:border-x-zinc-900 border-t-teal-700 dark:border-t-zinc-950
        relative
    ">
        <div className="layer -z-10 display text-lime-50 text-shadow-green-600
            selection:bg-lime-50 selection:text-emerald-900
            px-10 py-12
        ">
            {children}
            {cursor &&<span className="cursor bg-lime-50">&nbsp;</span>}
        </div>
        <div className="layer scanlines pointer-events-none"></div>
        <div className="layer glow pointer-events-none"></div>
    </div>
}


export default Crt;