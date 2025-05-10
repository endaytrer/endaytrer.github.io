const inputBufferId = "input-buffer";
const outputBufferId = "output-buffer";

export function buffer_get_char() {
    const input_buffer = document.getElementById(inputBufferId);
    const buffer_content = input_buffer.textContent;
    if (buffer_content.length === 0) {
        return null;
    }
    const res = buffer_content.charAt(0);
    input_buffer.textContent = buffer_content.slice(res.length);

    return res;
}

export function buffer_print(char) {
    const output_buffer = document.getElementById(outputBufferId);
    output_buffer.textContent += char
}