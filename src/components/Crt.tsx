import React, { ReactNode, useLayoutEffect, useState } from 'react';
import "./crt.css";

function Crt({ ref, children, cursor, onKeyDown }: { ref: React.RefObject<HTMLDivElement | null>, children: (width: number, height: number) => ReactNode, cursor: boolean, onKeyDown: (e: React.KeyboardEvent) => void }) {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useLayoutEffect(() => {
        setWidth((ref.current as HTMLDivElement).clientWidth - 16);
        setHeight((ref.current as HTMLDivElement).clientHeight - 16);
    }, []);

    return <div ref={ref} autoFocus tabIndex={0} onKeyDown={(e) => onKeyDown(e)} className="crt
        font-pixel
        mx-5
        text-xl lg:text-2xl min-h-72 lg:min-h-96
        bg-emerald-700 dark:bg-emerald-800 rounded-2xl
        border-8 border-solid border-b-teal-400 dark:border-b-teal-950 border-x-teal-600 dark:border-x-zinc-900 border-t-teal-700 dark:border-t-zinc-950
        relative
        outline-0
    ">
        <div className="layer -z-10 display text-lime-50 text-shadow-green-600
            selection:bg-lime-50 selection:text-emerald-700
            p-2 overflow-hidden
        ">
            {children(width, height)}
            {cursor &&<span className="cursor bg-lime-50">&nbsp;</span>}
        </div>
        <div className="layer scanlines pointer-events-none"></div>
        <div className="layer glow pointer-events-none"></div>
    </div>
}

export default Crt;