import { useEffect, useRef, useState } from 'react';
import "./knob.css";
import { ESTIMATED_OVERHEAD } from '../utils';

function angularDifference(angle1: number, angle2: number): number {
    // Normalize the angles to the range [-π, π]
    const normalized1 = ((angle1 % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    const normalized2 = ((angle2 % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
    
    // Calculate the raw difference
    let difference = normalized2 - normalized1;
    
    // Normalize the difference to the range [-π, π]
    if (difference > Math.PI) {
        difference -= 2 * Math.PI;
    } else if (difference < -Math.PI) {
        difference += 2 * Math.PI;
    }
    
    return difference;
}

const dialAngleMin = Math.PI * (7 / 4);
const dialAngleMax = Math.PI * (21 / 4);
const gap = Math.PI / 4;

function clickInAngle(input: number): number {
    const clickInConstant = 0.45;
    const smoothRange = 1 - 2 * clickInConstant;
    
    if (input < dialAngleMin + gap) {
        if (input < dialAngleMin + clickInConstant * gap) {
            return dialAngleMin
        }
        if (input > dialAngleMin + (1 - clickInConstant) * gap) {
            return dialAngleMin + gap
        }
        const t = (input - dialAngleMin - clickInConstant * gap) / (gap * smoothRange);
        const smooth_t = 3 * Math.pow(t, 2) - 2 * Math.pow(t, 3);
        return (1 - smooth_t) * dialAngleMin + smooth_t * (dialAngleMin + gap);
    }
    if (input > dialAngleMax - gap) {

        if (input < dialAngleMax - (1 - clickInConstant) * gap) {
            return dialAngleMax - gap
        }
        if (input > dialAngleMax - clickInConstant * gap) {
            return dialAngleMax
        }
        const t = (input - dialAngleMax + (1 - clickInConstant) * gap) / (gap * smoothRange);
        const smooth_t = 3 * Math.pow(t, 2) - 2 * Math.pow(t, 3);
        return (1 - smooth_t) * (dialAngleMax - gap) + smooth_t * dialAngleMax;
    }
    return input
}

const minFrequency = 1 / 1024; // in KHz
const maxFrequency = 1 / ESTIMATED_OVERHEAD;

function valueToAngle(value: number | null): number {
    if (value === null) { // null means blocking
        return dialAngleMax;
    }
    if (isNaN(value)) { // NaN means single step, leftmost
        return dialAngleMin;
    }
    const frequency = 1 / (value + ESTIMATED_OVERHEAD); // latency 0 should not yield infinite frequency.
    const clampedFrequency = Math.min(Math.max(frequency, minFrequency), maxFrequency);
    // from 1000 - 0 to 0 - 1
    const normalized = (clampedFrequency - minFrequency) / (maxFrequency - minFrequency);
    return dialAngleMin + gap + (dialAngleMax - dialAngleMin - 2 * gap) * normalized;
} 
function angleToValue(angle: number): number | null | undefined {
    if (angle > dialAngleMin && angle < dialAngleMin + gap) {
        return undefined;
    }
    if (angle > dialAngleMax - gap && angle < dialAngleMax) {
        return undefined;
    }
    if (angle == dialAngleMin) {
        return NaN;
    }
    if (angle == dialAngleMin + gap) {
        return 1 / minFrequency - ESTIMATED_OVERHEAD;
    }
    if (angle == dialAngleMax - gap) {
        return 1 / maxFrequency - ESTIMATED_OVERHEAD;
    }
    if (angle == dialAngleMax) {
        return null;
    }
    const normalized = (angle - dialAngleMin - gap) / (dialAngleMax - dialAngleMin - 2 * gap);
    const frequency = normalized * (maxFrequency - minFrequency) + minFrequency;
    return Math.max(1 / frequency - ESTIMATED_OVERHEAD, 0);
}
export default function Knob({value, onChange}: {value: number | null, onChange: (val: number | null) => void }) {
    const [dialPos, setDialPos] = useState([0, 0]);

    const dialAngleRaw = useRef<number>(valueToAngle(value));
    const dialAngleClicked = useRef<number>(clickInAngle(valueToAngle(value)));
    const dragStartAngle = useRef<number>(null);

    const dial = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const rect = (dial.current as HTMLDivElement).getBoundingClientRect();
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        setDialPos([centerX, centerY]);
    }, []);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const dx = e.clientX - dialPos[0];
        const dy = e.clientY - dialPos[1];
        dragStartAngle.current = Math.atan2(dy, dx);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - dialPos[0];
        const dy = e.clientY - dialPos[1];
        const angle = Math.atan2(dy, dx);

        const deltaAngle = angularDifference((dragStartAngle.current as number), angle);
        dragStartAngle.current = angle;
        const newAngleRaw = Math.min(Math.max(dialAngleRaw.current + deltaAngle, dialAngleMin), dialAngleMax);
        const newAngleClicked = clickInAngle(newAngleRaw);
        const new_value = angleToValue(newAngleClicked);
        if (new_value !== undefined) {
            onChange(new_value);
        }
        dialAngleRaw.current = newAngleRaw;
        dialAngleClicked.current = newAngleClicked;
        
    };

    const handleMouseUp = () => {
        dragStartAngle.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
    
    
    return <div className="select-none">
        <div className="dial-container relative h-16 w-16 flex items-center justify-center">
            <div className="tick major absolute bg-teal-900" style={{transform: `rotate(${0 * 0.25 * Math.PI}rad) translateX(-31px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${1 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${2 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${3 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick major absolute bg-teal-900" style={{transform: `rotate(${1 * 0.25 * Math.PI}rad) translateX(-31px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${5 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${6 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${7 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick major absolute bg-teal-900" style={{transform: `rotate(${2 * 0.25 * Math.PI}rad) translateX(-31px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${9 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${10 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${11 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick major absolute bg-teal-900" style={{transform: `rotate(${3 * 0.25 * Math.PI}rad) translateX(-31px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${13 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${14 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${15 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick major absolute bg-teal-900" style={{transform: `rotate(${4 * 0.25 * Math.PI}rad) translateX(-31px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${17 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${18 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${19 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick major absolute bg-teal-900" style={{transform: `rotate(${5 * 0.25 * Math.PI}rad) translateX(-31px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${21 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${22 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${23 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick major absolute bg-teal-900" style={{transform: `rotate(${6 * 0.25 * Math.PI}rad) translateX(-31px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${25 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${26 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${27 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick major absolute bg-teal-900" style={{transform: `rotate(${7 * 0.25 * Math.PI}rad) translateX(-31px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${29 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${30 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div className="tick minor absolute bg-teal-900" style={{transform: `rotate(${31 * 0.0625 * Math.PI}rad) translateX(-33px)`}}></div>
            <div ref={dial} className="knob-dial w-12 h-12 rounded-full bg-teal-500 dark:bg-teal-950 relative" onMouseDown={handleMouseDown}>
                <div className="knob-dial-shading absolute w-full h-full rounded-full origin-center"></div>
                <div className="knob-dial-turnable absolute w-full h-full rounded-full origin-center" style={{backgroundImage: `
                    repeating-conic-gradient(from ${dialAngleClicked.current}rad at 50% -50%,rgba(0, 0, 0, 0.3), rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0.3) 2deg)`}}>
                </div>
                <div className="knob-dial-top rounded-full bg-teal-500 dark:bg-teal-950">
                    <div className="indicator absolute bg-teal-950 dark:bg-teal-300 h-0.5 w-2 rounded-full" style={{transform: `rotate(${dialAngleClicked.current}rad) translateX(-15px)`}}></div>
                </div>
            </div>
        </div>
    </div>
}