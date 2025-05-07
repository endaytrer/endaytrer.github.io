import "./radio-group.css";

export default function RadioGroup({options, selection, onChange}: {options: string[], selection: number, onChange: (newSelect: number) => void}) {

    return <div className="radio-container">{options.map((option, i) => <div className="button flex flex-col flex-1 items-center relative">
            <button disabled={ selection === i } key={i} onClick={() => {
                const crt = document.querySelector("#crt") as HTMLDivElement;
                crt.focus()
                onChange(i)
            }} className="bg-teal-600 rounded-sm w-full dark:bg-zinc-800">
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