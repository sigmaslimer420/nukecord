
import { Client, GatewayIntentBits, SlashCommandBuilder, Events } from 'discord.js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const colors = {
    RED: chalk.red,
    BLUE: chalk.blue,
    YELLOW: chalk.yellow
};

let premium: number[] = [111111111111111111, 222222222222222222];
const botadmin: number[] = [1369398821238472788, 222222222222222222];

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

function load_premium_users(): void {
    try {
        const data = fs.readFileSync("premium_users.json", "utf8");
        const premium_data = JSON.parse(data);
        premium = premium_data.map((uid: any) => parseInt(uid.toString()));
    } catch (error) {
        premium = [];
    }
}

function save_premium_users(): void {
    fs.writeFileSync("premium_users.json", JSON.stringify(premium));
}

function display_logo(): void {
    const logo = `
 _______         __                                 .___
 \      \  __ __|  | __ ____   ____  ___________  __| _/
 /   |   \|  |  \  |/ // __ \_/ ___\/  _ \_  __ \/ __ | 
/    |    \  |  /    <\  ___/\  \__(  <_> )  | \/ /_/ | 
\____|__  /____/|__|_ \\___  >\___  >____/|__|  \____ | 
        \/           \/    \/     \/                 \/ 
`;
    console.clear();
    console.log(colors.RED(logo));
}

function display_status(connected: boolean): void {
    console.log(connected ? colors.RED("Status: Connected") : colors.BLUE("Status: Disconnected"));
}

load_premium_users();

bot.once(Events.ClientReady, async () => {
    display_logo();
    display_status(true);
    console.log("Connected as " + colors.YELLOW(`${bot.user?.tag}`));

    const commands = [
        new SlashCommandBuilder()
            .setName('customraid')
            .setDescription('Send a message and trigger spam')
            .addStringOption(option =>
                option.setName('message').setDescription('The message to spam').setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('addpremium')
            .setDescription('Add a user to the premium list.')
            .addUserOption(option =>
                option.setName('user').setDescription('User to add').setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('raid')
            .setDescription('Send default spam message'),
        new SlashCommandBuilder()
            .setName('fakeadmin')
            .setDescription('Simulate admin grant')
            .addUserOption(option =>
                option.setName('user').setDescription('Target user').setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('fakeban')
            .setDescription('Simulate ban')
            .addUserOption(option =>
                option.setName('user').setDescription('Target user').setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('idtoip')
            .setDescription('Generate fake IP address')
            .addUserOption(option =>
                option.setName('user').setDescription('Target user').setRequired(true)
            ),
        new SlashCommandBuilder()
            .setName('idtocredit')
            .setDescription('Generate fake credit info')
            .addUserOption(option =>
                option.setName('user').setDescription('Target user').setRequired(true)
            )
    ];

    if (bot.application) {
        await bot.application.commands.set(commands);
        console.log(colors.RED("Commands registered."));
    }
});

bot.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'customraid') {
        if (!premium.includes(interaction.user.id)) return;
        const message = interaction.options.getString('message', true);
        console.log(`Custom Raid Message: ${message}`);
    }

    if (commandName === 'addpremium') {
        if (!botadmin.includes(interaction.user.id)) return;
        const user = interaction.options.getUser('user', true);
        if (!premium.includes(user.id)) {
            premium.push(user.id);
            save_premium_users();
            console.log(`${user.username} added to premium.`);
        }
    }

    if (commandName === 'raid') {
        const message = "# RAIDED BY NUKECORD LABS! JOIN https://discord.gg/QQ9mv4Hq";
        console.log(`Raid Message: ${message}`);
    }

    if (commandName === 'fakeadmin') {
        if (!premium.includes(interaction.user.id)) return;
        const user = interaction.options.getUser('user', true);
        console.log(`Fake Admin: ${user.username}`);
    }

    if (commandName === 'fakeban') {
        if (!premium.includes(interaction.user.id)) return;
        const user = interaction.options.getUser('user', true);
        console.log(`Fake Ban: ${user.username}`);
    }

    if (commandName === 'idtoip') {
        const user = interaction.options.getUser('user', true);
        const ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
        console.log(`Fake IP for ${user.username}: ${ip}`);
    }

    if (commandName === 'idtocredit') {
        if (!premium.includes(interaction.user.id)) return;
        const user = interaction.options.getUser('user', true);
        const cc = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
        const ssn = `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`;
        const expiry = `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${(new Date().getFullYear() + 1).toString().slice(-2)}`;
        console.log(`Credit Info for ${user.username}: CC=${cc}, SSN=${ssn}, Exp=${expiry}`);
    }
});

bot.login(process.env.BOT_TOKEN);
