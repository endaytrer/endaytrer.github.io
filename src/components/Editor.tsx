import React, { useEffect, useState } from 'react';
import "./editor.css"

function to_line_array(str: string): string[] {
    const splitted = str.split("\n");
    const lastLine = splitted.pop() as string; // should not be empty
    const mapped = splitted.map((v) => v + " ");
    mapped.push(lastLine + " "); // EOF
    return mapped;
}
function formatLineNum(i: number, len: number): string {
    const all_length = len.toString().length;
    const raw = (i + 1).toString();
    let ans = "";
    for (let i = 0; i < all_length - raw.length; i++) {
        ans += " "
    }
    ans += (i + 1).toString();
    return ans + "  "
}
export default function Editor({value, keyEvent, onChange}: {filename: string, value: string, keyEvent: React.KeyboardEvent | null, onChange: (newval: string) => void}) {
    const [cursorX, setCursorX] = useState(0);
    const [cursorY, setCursorY] = useState(0);
    const [buffer, setBuffer] = useState<string[]>(to_line_array(value));

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
            console.log("Deal with shortcut: ", keyEvent.ctrlKey, keyEvent.altKey, keyEvent.shiftKey, keyEvent.metaKey);
            return;
        }
        keyEvent.preventDefault();
        if (keyEvent.key === "ArrowRight") {
            if (realCursorX === buffer[cursorY].length - 1) {
                // already end line
                // skip end of file
                if (cursorY !== buffer.length - 1) {
                    setCursorX(0);
                    setCursorY((old) => old + 1);
                }
            } else {
                setCursorX((old) => old + 1);
            }
            return;
        }
        if (keyEvent.key === "ArrowLeft") {
            if (realCursorX === 0) {
                if (cursorY !== 0) {
                    setCursorX(buffer[cursorY - 1].length - 1);
                    setCursorY((old) => old - 1);
                }
            } else {
                setCursorX(realCursorX - 1);
            }
            return;
        }
        if (keyEvent.key === "ArrowDown") {
            setCursorY((old) => Math.min(buffer.length - 1, old + 1));
            return;
        }
        if (keyEvent.key === "ArrowUp") {
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
            setCursorY((old) => old + 1);
            return;
        }
        if (keyEvent.key === "Backspace") {
            if (realCursorX === 0) {
                if (cursorY !== 0) {
                    setBuffer((old) => {
                        const before = old.slice(0, cursorY - 1);
                        before.push(old[cursorY - 1].slice(0, -1) + old[cursorY]);
                        return before.concat(old.slice(cursorY + 1));
                    });
                    setCursorX(buffer[cursorY - 1].length - 1);
                    setCursorY((old) => old - 1);
                }
            } else {
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
        setBuffer((old) => {
            const before = old.slice();
            before[cursorY] = before[cursorY].slice(0, realCursorX) + keyEvent.key + before[cursorY].slice(realCursorX);
            return before;
        });
        setCursorX((old) => old + keyEvent.key.length);
    }, [keyEvent]);

    return <pre className="font-pixel relative h-full w-full select-none">
        {buffer.slice(0, cursorY).map((l, i) => <div key={i} onClick={() => {
            if ("virtualKeyboard" in navigator) {
                (navigator.virtualKeyboard as {show: () => void}).show();
            }
            setCursorX(l.length - 1);
            setCursorY(i);
        }}>{formatLineNum(i, buffer.length)}{l.split('').map((c, j) => <div className="inline-block" key={"" + i + "," + j} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if ("virtualKeyboard" in navigator) {
                (navigator.virtualKeyboard as {show: () => void}).show();
            }
            setCursorX(j);
            setCursorY(i);
        }}>{c}</div>)}</div>)}
        <div className="border-b-2 -mb-0.5" onClick={() => {
            setCursorX(buffer[cursorY].length - 1);
        }}>
            {formatLineNum(cursorY, buffer.length)}
            {buffer[cursorY].slice(0, realCursorX).split('').map((c, j) => <div className="inline-block" key={"" + cursorY + "," + j} onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if ("virtualKeyboard" in navigator) {
                    (navigator.virtualKeyboard as {show: () => void}).show();
                }
                setCursorX(j);
            }}>{c}</div>)}
            <div className="inline-block bg-lime-50 text-emerald-700">{buffer[cursorY][realCursorX]}</div>
            {buffer[cursorY].slice(realCursorX + 1).split('').map((c, j) => <div className="inline-block" key={"" + cursorY + "," + (realCursorX + 1 + j)} onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if ("virtualKeyboard" in navigator) {
                    (navigator.virtualKeyboard as {show: () => void}).show();
                }
                setCursorX(realCursorX + 1 + j);
            }}>{c}</div>)}
        </div>
        {buffer.slice(cursorY + 1).map((l, i) => <div key={cursorY + 1 + i} onClick={() => {
            if ("virtualKeyboard" in navigator) {
                (navigator.virtualKeyboard as {show: () => void}).show();
            }
            setCursorX(l.length - 1);
            setCursorY(i + cursorY + 1);
        }}>{formatLineNum(i + cursorY + 1, buffer.length)}{l.split('').map((c, j) => <div className="inline-block" key={"" + (cursorY + 1 + i) + "," + j} onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if ("virtualKeyboard" in navigator) {
                (navigator.virtualKeyboard as {show: () => void}).show();
            }
            setCursorX(j);
            setCursorY(i + cursorY + 1);
        }}>{c}</div>)}</div>)}
        </pre>
}