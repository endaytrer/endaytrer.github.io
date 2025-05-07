import { ReactNode } from 'react';
import "./printer.css"
export default function Printer({children}: {children: ReactNode | null}) {
    return <div className="printer-container w-full h-4 rounded-full p-4 flex items-center">
        <div className="h-0 border-2 border-zinc-950 w-full bg-zinc-950 rounded-full relative">
            {children && <div className="paper font-pixel absolute p-2 w-full bg-teal-300 text-neutral-800">
                {children}
            </div>}
        </div>
    </div>
}