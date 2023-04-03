import Cli from "./cli";

const cli: Cli = new Cli();
cli.handleCommand().then(() => {
    console.log("Finish");
}).catch(err => {
    console.error(`Something went wrong : ${err}`);
});
