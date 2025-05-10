import { useEffect, useRef, useState } from 'react';

const useUnmount = (fn: () => void) => {
    const fnRef = useRef(fn);
    fnRef.current = fn;
  
    useEffect(() => () => fnRef.current(), []);
};

export default function InteractiveScreen({error, keyEvent}: {error: string, keyEvent: React.KeyboardEvent | null}) {
    const [output, setOutput] = useState(error);
    const intervalRef = useRef(0);
    useUnmount(() => {
        clearInterval(intervalRef.current);
    })
    
    const inputBuffer = document.querySelector("#input-buffer") as HTMLPreElement;
    const outputBuffer = document.querySelector("#output-buffer") as HTMLPreElement;
    useEffect(() => {
        const intervalId = setInterval(() => {
            const bufferContent = outputBuffer.textContent;
            setOutput((old) => old + bufferContent);
            outputBuffer.innerText = "";
        }, 10);
        intervalRef.current = intervalId;
    }, []);
    useEffect(() => {
        if (keyEvent === null) {
            return;
        }
        if (keyEvent.key === "Shift" || keyEvent.key === "Ctrl" || keyEvent.key === "Alt" || keyEvent.key === "Meta") {
            return;
        }
        if (keyEvent.metaKey || keyEvent.ctrlKey || keyEvent.altKey) {
            return;
        }
        if (keyEvent.key === "Tab" || keyEvent.key === "Enter" || keyEvent.key.length === 1) {
            keyEvent.preventDefault();
            keyEvent.stopPropagation();
        } else {
            return;
        }
        let inputString = keyEvent.key;

        if (keyEvent.key === "Tab") {
            inputString = "    "
        } else if (keyEvent.key === "Enter") {
            inputString = "\n"
        }
        setOutput((old) => old + inputString);
        inputBuffer.textContent += inputString;
    }, [keyEvent]);
    return <pre className="font-pixel w-full">{output}
            {<span className="cursor bg-lime-50">&nbsp;</span>}</pre>
}