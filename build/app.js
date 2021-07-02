import * as DC from "discord.js";
import knex from "knex";
import * as env from 'dotenv';
env.config();
const PG_Client = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    },
    debug: true,
});
const DC_Client = new DC.Client();
DC_Client.on('ready', () => {
    console.log('ready');
});
DC_Client.on('message', async (msg) => {
    if (msg.content.startsWith(' '))
        return;
    let command = msg.content.split(" "); // <@!id>
    let cuote = command[0];
    if (cuote === '!cuote') {
        let member = command[1].substr(3, 18);
        let messageNumber = parseInt(command[2]);
        if (isNaN(messageNumber) || !msg.guild.member(member)) {
            msg.channel.send("Invalid Syntax\n Correct Syntax is: !cuote @User messageNumber");
            return;
        }
        else if (messageNumber > 100) {
            msg.channel.send("messageNumber cannot be bigger than 100");
            return;
        }
        msg.channel.messages.fetch({ limit: 100 }).then(messages => {
            let usermsg = messages.filter((m, id) => m.author.id === member);
            if (usermsg.size === 0 || messageNumber > usermsg.size) {
                msg.channel.send("Unable to quote user");
                return;
            }
            let quote = usermsg.first(messageNumber)[messageNumber - 1];
            msg.channel.send(`Quoted: \n ${quote.content} \n - ${quote.author.username} ${new Date().getFullYear()}`);
            let embed_types = [];
            let embed_urls = [];
            for (let embed of quote.embeds) {
                embed_types.push(embed.type);
                embed_urls.push(embed.url);
            }
            let result = PG_Client('cuotes').insert({
                'message_id': quote.id,
                'author_id': quote.author.id,
                'author_uname': quote.author.username,
                'content': quote.content,
                'embed_type': embed_types,
                'embed_url': embed_urls,
                'message_date': quote.createdAt
            }).then().catch(err => {
                msg.channel.send(err);
            });
        }).catch(err => {
            msg.channel.send(err);
        });
    }
});
DC_Client.login(process.env.TOKEN);
//# sourceMappingURL=app.js.map