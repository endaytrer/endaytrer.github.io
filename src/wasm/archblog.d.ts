/* tslint:disable */
/* eslint-disable */
export function run_blocking(dmem_size: number, program: Uint8Array): void;
export function machine_create(dmem_size: number, program: Uint8Array): number;
export function machine_step(m: number): boolean;
export function machine_free(m: number): void;
export function assemble_executable(file_name: string | null | undefined, source: string): Uint8Array;
