/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const run_blocking: (a: number, b: number) => [number, number];
export const machine_create: (a: number, b: number) => [number, number, number];
export const machine_step: (a: number) => number;
export const machine_free: (a: number) => void;
export const assemble: (a: number, b: number) => [number, number, number, number];
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_export_2: WebAssembly.Table;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_start: () => void;
