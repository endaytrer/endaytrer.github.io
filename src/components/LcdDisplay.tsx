import "./lcd-display.css";
const glyphs: Record<string, number> = {
    "0": 0b01111110,
    "1": 0b00110000,
    "2": 0b01101101,
    "3": 0b01111001,
    "4": 0b00110011,
    "5": 0b01011011,
    "6": 0b01011111,
    "7": 0b01110000,
    "8": 0b01111111,
    "9": 0b01111011,
    "A": 0b01110111,
    "B": 0b00011111,
    "C": 0b01001110,
    "D": 0b00111101,
    "E": 0b01001111,
    "F": 0b01000111,
    "G": 0b01011110,
    "H": 0b00110111,
    "I": 0b00110000,
    "L": 0b00001110,
    "N": 0b01110110,
    "S": 0b01011011,
    "Y": 0b00111011,
    "Z": 0b01101101,
}
function SevenSegmentDigit({ value, decimal_point }: { value: string, decimal_point: boolean }) {
    const glyph = glyphs[value] | (decimal_point ? 0x80 : 0);
    return <div className="h-8 lg:h-10 w-5 lg:w-6">
        <svg className="w-full h-full" viewBox="0 0 22 36">
            <g className="A" fill={`#000000${(glyph & 0x40) ? "FF" : "10"}`}>
                <polygon points=" 6, 4  8, 6 16, 6 18, 4 16, 2  8, 2"></polygon>
            </g>
            <g className="B" fill={`#000000${(glyph & 0x20) ? "FF" : "10"}`}>
                <polygon points="19, 5 17, 7 16,15 18,17 20,15 21, 7"></polygon>
            </g>
            <g className="C" fill={`#000000${(glyph & 0x10) ? "FF" : "10"}`}>
                <polygon points="17.5,19 15.5,21 14.5,29 16.5,31 18.5,29 19.5,21"></polygon>
            </g>
            <g className="D" fill={`#000000${(glyph & 0x8) ? "FF" : "10"}`}>
                <polygon points=" 3.5,32  5.5,34 13.5,34 15.5,32 13.5,30  5.5,30"></polygon>
            </g>
            <g className="E" fill={`#000000${(glyph & 0x4) ? "FF" : "10"}`}>
                <polygon points=" 3.5,19  1.5,21  0.5,29  2.5,31  4.5,29  5.5,21"></polygon>
            </g>
            <g className="F" fill={`#000000${(glyph & 0x2) ? "FF" : "10"}`}>
                <polygon points=" 5, 5  3, 7  2,15  4,17  6,15  7, 7"></polygon>
            </g>
            <g className="G" fill={`#000000${(glyph & 0x1) ? "FF" : "10"}`}>
                <polygon points=" 4.75,18  6.75,20 14.75,20 16.75,18 14.75,16  6.75,16"></polygon>
            </g>
            <circle fill={`#000000${(glyph & 0x80) ? "FF" : "10"}`} cx={20} cy={32} r={2} />
        </svg>
    </div>
}
export default function LcdDisplay({ width, value }: { width: number, value: string }) {
    const splitted = value.split(".");
    const mapped = splitted.flatMap((subarr, i) => {
        const each_char = subarr.split("").map((a) => ({ value: a, decimal: false }));
        if (i !== splitted.length - 1) {
            each_char[each_char.length - 1].decimal = true;
        }
        return each_char;
    });
    const resized: { value: string; decimal: boolean; }[] = [...mapped, ...Array(Math.max(width - mapped.length, 0)).fill({ value: " ", decimal: false })]
    // return <div className="flex bg-yellow-500">{splitted.slice(0, -1).flatMap((segment) => {
    //     let chars = segment.split("");
    //     return chars.slice(0, -1).map((char) => <SevenSegmentDigit value={char} decimal_point={false}/>)
    //         .concat([<SevenSegmentDigit value={chars[chars.length - 1]} decimal_point/>])

    // }).concat(splitted[splitted.length - 1].split("")
    //         .map((char) => <SevenSegmentDigit value={char} decimal_point={false}/>))}</div>

    return <div className="lcd-container relative w-full p-2 bg-zinc-800 dark:bg-zinc-950 flex items-center justify-center rounded-sm">
        <div className="flex bg-emerald-600 w-fit px-2 rounded-xs">
            {resized.map(({ value, decimal }, idx) => <SevenSegmentDigit key={idx} value={value} decimal_point={decimal}></SevenSegmentDigit>)}
        </div>
    </div>
}