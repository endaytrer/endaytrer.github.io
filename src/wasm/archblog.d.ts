/* tslint:disable */
/* eslint-disable */
export function run_blocking(program: Uint8Array): void;
export function machine_create(program: Uint8Array): number;
export function machine_step(m: number): boolean;
export function machine_free(m: number): void;
export function assemble(source: string): Uint8Array;
