import { IO } from "./mod.ts";

const axone = IO.color("axone: ", 0, 255, 255),
    aliiice = IO.color("aliiice: ", 244, 160, 241),
    akira = IO.color("aptura: ", 107, 253, 53)

IO.drown();

setTimeout(() => setInterval(() => {
    IO.print(aliiice + "I kissed a girl and I liked it 💓");
}, 2500), 1000);

setTimeout(() => setInterval(() => {
    IO.print(akira + "i'm a bot 🤖");
}, 3000), 2000);


while (true) {
    const msg = await IO.prompt(axone);
    await IO.print(axone + msg);
}
