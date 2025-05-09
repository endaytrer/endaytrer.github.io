import React, { useEffect, useRef, useState } from 'react';
import "./editor.css"

function to_line_array(str: string): string[] {
    const splitted = (str + " ").split("\n"); // EOF
    const lastLine = splitted.pop() as string; // should not be empty
    const mapped = splitted.map((v) => v + " ");
    mapped.push(lastLine);
    return mapped;
}
function formatLineNum(i: number, len: number): string {
    const all_length = len.toString().length;
    const raw = (i + 1).toString();
    let ans = " ";
    for (let i = 0; i < all_length - raw.length; i++) {
        ans += " "
    }
    ans += (i + 1).toString();
    return ans + " "
}
export default function Editor({width, height, filename, value, keyEvent, onChange}: {width: number, height: number, filename: string, value: string, keyEvent: React.KeyboardEvent | null, onChange: (newval: string) => void}) {
    const [cursorX, setCursorX] = useState(0);
    const [cursorY, setCursorY] = useState(0);
    const [cursorWidth, setCursorWidth] = useState(9.6);
    const [cursorHeight, setCursorHeight] = useState(32);
    const [viewportX, setViewportX] = useState(0);
    const [viewportY, setViewportY] = useState(0);
    const [buffer, setBuffer] = useState<string[]>(to_line_array(value));

    const lineNumberWidth = buffer.length.toString().length + 2;

    const viewportWidth = Math.floor(width / cursorWidth) - lineNumberWidth;
    const viewportHeight = Math.floor((height + 8) / cursorHeight) - 1; // give 8px error
    const realWidth = Math.floor(width / cursorWidth) * cursorWidth;
    const realHeight = Math.floor(height / cursorHeight) * cursorHeight;



    const cursor = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const rect = (cursor.current as HTMLDivElement).getBoundingClientRect();
        setCursorWidth(rect.width);
        setCursorHeight(rect.height);
    }, []);

    const realCursorX = Math.min(cursorX, buffer[cursorY].length - 1);

    useEffect(() => {
        setBuffer(to_line_array(value));
    }, [value]);

    useEffect(() => {
        if (keyEvent === null) {
            return;
        }
        if (keyEvent.key === "Shift" || keyEvent.key === "Ctrl" || keyEvent.key === "Alt" || keyEvent.key === "Meta") {
            return;
        }
        if (keyEvent.metaKey || keyEvent.ctrlKey || keyEvent.altKey) {
            if (keyEvent.metaKey && ! keyEvent.ctrlKey && ! keyEvent.altKey && ! keyEvent.shiftKey && keyEvent.key.toLowerCase() == "s") {
                keyEvent.preventDefault();
                keyEvent.stopPropagation();
                onChange(buffer.map((l) => l.slice(0, -1)).join("\n"));
                return;
            }
            return;
        }
        keyEvent.preventDefault();
        if (keyEvent.key === "ArrowRight") {
            if (realCursorX === buffer[cursorY].length - 1) {
                // already end line
                // skip end of file
                if (cursorY !== buffer.length - 1) {
                    if (cursorY === viewportY + viewportHeight - 1) {
                        setViewportY((old) => old + 1);
                    }
                    setCursorX(0);
                    setViewportX(0);
                    setCursorY((old) => old + 1);
                }
            } else {
                if (realCursorX === viewportX + viewportWidth - 1) {
                    setViewportX((old) => old + 1)
                }
                setCursorX((old) => old + 1);
            }
            return;
        }
        if (keyEvent.key === "ArrowLeft") {
            if (realCursorX === 0) {
                if (cursorY !== 0) {
                    if (cursorY === viewportY) {
                        setViewportY((old) => old - 1);
                    }
                    if (buffer[cursorY - 1].length - 1 >= viewportX + viewportWidth) {
                        setViewportX(buffer[cursorY - 1].length - viewportX - viewportWidth);
                    }
                    setCursorX(buffer[cursorY - 1].length - 1);
                    setCursorY((old) => old - 1);
                }
            } else {
                if (realCursorX === viewportX) {
                    setViewportX((old) => old - 1);
                }
                setCursorX(realCursorX - 1);
            }
            return;
        }
        if (keyEvent.key === "ArrowDown") {
            if (cursorY === viewportY + viewportHeight - 1 && cursorY !== buffer.length - 1) {
                setViewportY((old) => old + 1);
            }
            const new_real_cursorX = Math.min(cursorX, buffer[Math.min(buffer.length - 1, cursorY + 1)].length - 1);
            if (new_real_cursorX != realCursorX) { // cursor has visual changes. reset viewportX
                setViewportX(Math.max(0, new_real_cursorX - viewportWidth + 1));
            }
            setCursorY((old) => Math.min(buffer.length - 1, old + 1));
            return;
        }
        if (keyEvent.key === "ArrowUp") {
            if (cursorY === viewportY && cursorY !== 0) {
                setViewportY((old) => old - 1);
            }
            const new_real_cursorX = Math.min(cursorX, buffer[Math.max(0, cursorY - 1)].length - 1);
            if (new_real_cursorX != realCursorX) { // cursor has visual changes. reset viewportX
                setViewportX(Math.max(0, new_real_cursorX - viewportWidth + 1));
            }
            setCursorY((old) => Math.max(0, old - 1));
            return;
        }
        if (keyEvent.key === "Enter") {
            setBuffer((old) => {
                const before = old.slice(0, cursorY);
                before.push(old[cursorY].slice(0, realCursorX) + " ");
                before.push(old[cursorY].slice(realCursorX));
                return before.concat(old.slice(cursorY + 1));
            });
            setCursorX(0);
            setViewportX(0);
            if (cursorY === viewportY + viewportHeight - 1) {
                setViewportY((old) => old + 1);
            }
            setCursorY((old) => old + 1);
            return;
        }
        if (keyEvent.key === "Backspace") { // behave like backspace, but set ViewportX eagerly
            if (realCursorX === 0) {
                if (cursorY !== 0) {
                    if (cursorY === viewportY) {
                        setViewportY((old) => old - 1);
                    }
                    if (buffer[cursorY - 1].length - 1 >= viewportX + viewportWidth) {
                        setViewportX(buffer[cursorY - 1].length - viewportX - viewportWidth);
                    }
                    setBuffer((old) => {
                        const before = old.slice(0, cursorY - 1);
                        before.push(old[cursorY - 1].slice(0, -1) + old[cursorY]);
                        return before.concat(old.slice(cursorY + 1));
                    });
                    setCursorX(buffer[cursorY - 1].length - 1);
                    setCursorY((old) => old - 1);
                }
            } else {
                if (viewportX !== 0) {
                    setViewportX((old) => old - 1);
                }
                setBuffer((old) => {
                    const before = old.slice();
                    before[cursorY] = before[cursorY].slice(0, realCursorX - 1) + before[cursorY].slice(realCursorX);
                    return before;
                });
                setCursorX(realCursorX - 1);
            }
            return;
        }
        if (keyEvent.key === "Delete") {
            if (realCursorX === buffer[cursorY].length - 1) {
                if (cursorY !== buffer.length - 1) {
                    setBuffer((old) => {
                        const before = old.slice(0, cursorY);
                        before.push(old[cursorY].slice(0, -1) + old[cursorY + 1]);
                        return before.concat(old.slice(cursorY + 2));
                    });
                }
            } else {
                setBuffer((old) => {
                    const before = old.slice();
                    before[cursorY] = before[cursorY].slice(0, realCursorX) + before[cursorY].slice(realCursorX + 1);
                    return before;
                });
            }
            return;
        }
        // behaves like ArrowRight
        let inputString = keyEvent.key;
        if (keyEvent.key === "Tab") {
            inputString = "    ";
        }
        if (realCursorX + inputString.length > viewportX + viewportWidth) {
            setViewportX(realCursorX + inputString.length - viewportWidth)
        }
        setBuffer((old) => {
            const before = old.slice();
            before[cursorY] = before[cursorY].slice(0, realCursorX) + inputString + before[cursorY].slice(realCursorX);
            return before;
        });
        setCursorX((old) => old + inputString.length);
    }, [keyEvent]);

    return <pre style={{width: realWidth, height: realHeight}}className="font-pixel relative h-full w-full select-none">
        
        {buffer.slice(viewportY, cursorY).map((l, i) => <div className="absolute w-full" style={{top: i * cursorHeight}} key={(i + viewportY)} onClick={() => {
            // cursor should always be visible in viewport. only slice to cursorY
            if ("virtualKeyboard" in navigator) {
                (navigator.virtualKeyboard as {show: () => void}).show();
            }
            setViewportX(Math.max(l.length - viewportWidth, 0));
            setCursorX(l.length - 1);
            setCursorY((i + viewportY));
        }}>
            <div className="inline-block" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setViewportX(0);
                setCursorX(0);
                setCursorY((i + viewportY));
            }}>{formatLineNum(i + viewportY, buffer.length)}</div>
            {l.slice(viewportX, viewportX + viewportWidth).split('').map((c, j) => <div className="inline-block" key={"" + (i + viewportY) + "," + (j + viewportX)} onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCursorX(j + viewportX);
                setCursorY(i + viewportY);
            }}>{c}</div>)}
        </div>)}
        <div className="absolute w-full border-b-2 -mb-0.5" style={{top: (cursorY - viewportY) * cursorHeight}} onClick={() => {
            setViewportX(Math.max(buffer[cursorY].length - viewportWidth, 0));
            setCursorX(buffer[cursorY].length - 1);
        }}>
            <div className="inline-block" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setViewportX(0);
                setCursorX(0);
            }}>{formatLineNum(cursorY, buffer.length)}</div>
            {buffer[cursorY].slice(viewportX, realCursorX).split('').map((c, j) => <div className="inline-block" key={"" + cursorY + "," + (j + viewportX)} onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCursorX(j + viewportX);
            }}>{c}</div>)}
            <div ref={cursor} className="inline-block bg-lime-50 text-emerald-700">{buffer[cursorY][realCursorX]}</div>
            {buffer[cursorY].slice(realCursorX + 1, viewportX + viewportWidth).split('').map((c, j) => <div className="inline-block" key={"" + cursorY + "," + (realCursorX + 1 + j)} onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCursorX(realCursorX + 1 + j);
            }}>{c}</div>)}
        </div>
        {buffer.slice(cursorY + 1, viewportY + viewportHeight).map((l, i) => <div className="absolute w-full" style={{top: (i + cursorY - viewportY + 1) * cursorHeight}} key={cursorY + 1 + i} onClick={() => {
            setViewportX(Math.max(l.length - viewportWidth, 0));
            setCursorX(l.length - 1);
            setCursorY(i + cursorY + 1);
        }}>
            <div className="inline-block" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setViewportX(0);
                setCursorX(0);
                setCursorY(i + cursorY + 1);
            }}>{formatLineNum(i + cursorY + 1, buffer.length)}
            </div>
            {l.slice(viewportX, viewportX + viewportWidth).split('').map((c, j) => <div className="inline-block" key={"" + (cursorY + 1 + i) + "," + (j + viewportX)} onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCursorX(j + viewportX);
                setCursorY(i + cursorY + 1);
            }}>{c}</div>)}
        </div>)}
        {// last line: status
            <div className="absolute bg-lime-50 text-emerald-700 w-full flex justify-between" style={{top: viewportHeight * cursorHeight + 4}}>
                <div> {filename}</div>
                <div>{cursorY + 1},{realCursorX + 1} </div>
            </div>
        }
        </pre>
}