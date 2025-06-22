import React from "react";

export default function Tag({selected, onClick, children}: {selected: boolean, onClick: ((_: React.MouseEvent) => void) | undefined, children: React.ReactNode}) {
    return <span onClick={onClick} className={`font-sans capitalize rounded-sm  ${selected ? "text-teal-900 dark:text-lime-50 bg-lime-200 dark:bg-lime-600 font-bold" : "bg-teal-300 dark:bg-teal-900 text-teal-600"} ${onClick && "cursor-pointer"} py-0 px-1`}><b>#</b> {children}</span>
}