import "./radio-group.css";

export default function RadioGroup({crtRef, options, selection, onChange}: {crtRef: React.RefObject<HTMLDivElement | null>, options: string[], selection: number, onChange: (newSelect: number) => void}) {

    return <div className="radio-container">{options.map((option, i) => <div key={i} className="button flex flex-col flex-1 items-center relative">
            <button disabled={ selection === i } key={i} onClick={() => {
                crtRef.current?.focus()
                onChange(i)
            }} className="bg-teal-600 rounded-sm w-full dark:bg-zinc-900">
                <div className="button-face bg-teal-500 dark:bg-teal-950">
                    <div className="button-face-texture"></div>
                </div>
            </button>
            <label className="absolute flex flex-row items-center gap-2">
                <div className="font-pixel text-sm">{option}</div>
                <div className={"indicator" + (selection === i ? " lit" : "")}></div>
            </label>
        </div>
    )}</div>
}