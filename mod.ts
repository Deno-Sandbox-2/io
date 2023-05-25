export namespace IO {
    const decoder = new TextDecoder();

    const encoder = new TextEncoder();

    export const input = Deno.stdin;

    export const output = Deno.stdout;

    export async function write(string: string) {
        await output.write(encoder.encode(string));
    }

    const ESC = "\x1b[" as const;

    const action = (cmd: string) => {
        const buffer = encoder.encode(cmd);
        return async () => {
            await output.write(buffer);
        };
    };

    export const cursor = {
        hide: action(ESC + "?25l"),
        show: action(ESC + "?25h"),

        home: action(ESC + "H"),
        goTo: (x: number, y: number) => write(ESC + y + ";" + x + "H"),

        up: (y = 1) => write(ESC + y + "A"),
        down: (y = 1) => write(ESC + y + "B"),
        right: (x = 1) => write(ESC + x + "C"),
        left: (x = 1) => write(ESC + x + "D"),

        clearRight: action(ESC + "0K"),
        clearLeft: action(ESC + "1K"),
        clearLine: action(ESC + "2K"),

        clearDown: action(ESC + "0J"),
        clearUp: action(ESC + "1J"),
        clearScreen: action(ESC + "2J"),

        clear: action("\x1bc"),

        nextLine: action(ESC + "1E"),
        prevLine: action(ESC + "1F"),
    };

    const cache = {
        used: false,
        buffer: new Uint8Array(2048),
        prompt: "> ",
        i: 0,
        update: async () => {
            await write("\n" + cache.prompt);
            await output.write(cache.buffer.subarray(0, cache.i));
        },
    };

    export async function print(line: string) {
        if (cache.used) {
            await cursor.clearLine();
            await write("\r" + line);
            await cache.update();
        } else await write(line + "\n");
    }

    export async function prompt(question: string) {
        input.setRaw(true);
        cache.used = true;

        await write(question);
        cache.prompt = question;
        cache.i = 0;

        loop:
        while (cache.i < cache.buffer.length) {
            let char = cache.buffer.subarray(cache.i, cache.i+1),
                n = await input.read(char);

            if (!n) break loop;

            test:
            switch (char[0]) {
                case 3: {
                    await cursor.clearLine();
                    Deno.exit();
                }
                case 13: {
                    await cursor.clearLine();
                    await write("\r");
                    break loop;
                }
                case 127: {
                    await cursor.left();
                    await cursor.clearRight();
                    cache.i--;
                    break test;
                }
                case 9: {
                    await write(" ");
                    cache.i++;
                    break test;
                }
                default: {
                    await output.write(char);
                    cache.i++;
                }
            }
        }

        input.setRaw(false);
        cache.used = false;

        return decoder.decode(cache.buffer.subarray(0, cache.i));
    }

    export function drown() {
        const { rows } = Deno.consoleSize();
        write(Array(rows).join("\n"));
    }

    export function color(string: string, r: number, g: number, b: number) {
        return ESC + `38;2;${r};${g};${b}m` +  string + ESC + "0m";
    }
}

