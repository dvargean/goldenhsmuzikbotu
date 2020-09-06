const Discord = require("discord.js");
const { Client, Util } = require("discord.js");
const moment = require("moment");
const env = require('./env.json')
const YouTube = require("simple-youtube-api");
const bot = new Discord.Client();
const ytdl = require("ytdl-core");
const dotenv = require("dotenv").config();
require("./server.js");

const TOKEN = env.BOT_TOKEN;
const PREFIX = env.PREFIX;
const GOOGLE_API_KEY = env.YTAPI_KEY;
const sahip = env.AUTHOR;
const developer = env.DEVELOPER;

bot.on("ready", () => {
  bot.user.setActivity(`♫ GoldenHS | s!help   `, {
    type: "LISTENING"
  });
});

bot.on("warn", console.warn);
bot.on("error", console.error);

bot.login(TOKEN).then(
  function() {
    console.log(
      `[${moment().format(
        "ss:mm:HH DD-MM-YYYY"
      )}] Talky : Token Already Active.`
    );
    console.log(`[${moment().format("ss:mm:HH DD-MM-YYYY")}] Talky : Active!`);
    console.log(
      `[${moment().format("ss:mm:HH DD-MM-YYYY")}] Talky : Servers Online!`
    );
    console.log(
      `[${moment().format("ss:mm:HH DD-MM-YYYY")}] Talky : ` +
        bot.channels.cache.size +
        ` Channel, ` +
        bot.guilds.cache.size +
        ` Server `
    );
  },
  function(err) {
    console.log(
      `[${moment().format("ss:mm:HH DD-MM-YYYY")}] Talky : Renew Token` + err
    );
    setInterval(function() {
      process.exit(0);
    }, 20000);
  }
);

const youtube = new YouTube(GOOGLE_API_KEY);
const queue = new Map();

bot.on("message", async msg => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(PREFIX)) return;

  const args = msg.content.split(" ");
  const searchString = args.slice(1).join(" ");
  const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
  const serverQueue = queue.get(msg.guild.id);

  let command = msg.content.toLowerCase().split(" ")[0];
  command = command.slice(PREFIX.length);

  if (command === "help") {
    const helpembed = new Discord.MessageEmbed()
      .setColor("36393F")
      .setAuthor(bot.user.username, bot.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(`Komutu kullanan ${msg.author.username}`)
      .setTimestamp()
      .setTitle("Prefix: ``s!``")
      .addField(
        "Çalma Komutu:",
        "``s!play (şarkı/url)`` ya da ``s!p (şarkı/url)``"
      )
      .addField("Arama Komutu:", "``s!search (şarkı ismi)`` ya da ``s!sc (şarkı ismi)``")
      .addField("Çıkma Komutu:", "``s!leave``")
      .addField("Geçme Komutu:", "``s!skip `` ya da ``s!s``")
      .addField("Ses Komutu:", "``s!volume 1-120`` ya da ``s!vol 1-120``")
      .addField("Şuanda Çalan Komutu:", "``s!nowplaying`` ya da ``s!np``")
      .addField("Liste Komutu:", "``s!queue`` or ``s!q``")
      .addField("Durdur Komutu:", "``s!pause``")
      // .addField("Loop Command:", "``s!sloop`` or ``s!lp``")
      .addField("Devam Komutu:", "``s!resume``")
      .addField("Yapımcı Komutu:", "``s!author``")
      .addField("Davet Komutu:", "``s!invite``");
    msg.channel.send(helpembed);
    msg.delete();
  }
  if (command === "author") {
    const embed = new Discord.MessageEmbed()
      .setColor("36393F")
      .setAuthor(bot.user.username, bot.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(`Used by. ${msg.author.username}`)
      .setTimestamp()
      .addField(
        `Bot Yapımcısı:`,
        `**<@!277880174442184705>**`
      );
    msg.channel.send(embed);
  }
  if (command === "invite") {
    const embed = new Discord.MessageEmbed()
      .setColor("36393F")
      .setAuthor(bot.user.username, bot.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(`Komutu kullanan ${msg.author.username}`)
      .setTimestamp()
      .addField(
        `Site Linki: [tıkla](https://goldenhs.net) \n Discord Linki: [tıkla](https://discord.gg/VycCrYy) \n Bot Davet Linki: [tıkla](https://discord.com/oauth2/authorize?client_id=728083942363889715&scope=bot&permissions=7341120) `
      );
    msg.channel.send(embed);
  }
  if (command === "restart") {
    if (msg.author.id != sahip) return msg.reply(`**You Need a Author ID**`);
    msg.channel.send(`**The Bot Has Been Restarted**`).then(msg => {
      console.log("Restart Command Has Been Used.");
      process.exit(0);
    });
  }
  if (command === "dev-restart") {
    if (msg.author.id != developer)
      return msg.reply(`**You Need a Author ID**`);
    msg.channel.send(`**The Bot Has Been Restarted**`).then(msg => {
      console.log("Restart Command Has Been Used.");
      process.exit(0);
    });
  }
  if (command === "play" || command === "p") {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel)
      return msg.channel.send("Sesli odada olmalısınız!");
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return msg.channel.send(
        `<:Hayir:> **Bağlanma** yetkisine sahip olmam gerekli!`
      );
    }
    if (!permissions.has("SPEAK")) {
      return msg.channel.send(
        `<:Hayir:> **KONUŞMA** yetkisine sahip olmam gerekli!`
      );
    }
    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id);
        await handleVideo(video2, msg, voiceChannel, true);
      }
      return msg.channel.send(
        `<:Evet:> **・** **\`${playlist.şarkıismi}\`** listeye alındı!`
      );
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          var video = await youtube.getVideoByID(videos[0].id);
          if (!video)
            return msg.channel.send(
              `<a:vol2:727487017650225232> **・** sonuç bulunamadı.`
            );
        } catch (err) {
          console.error(err);
          return msg.channel.send(
            `<a:vol2:> **・**  sonuç bulunamadı.`
          );
        }
      }
      return handleVideo(video, msg, voiceChannel);
    }
  }
  if (command === "search" || command === "sc") {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel)
      return msg.channel.send("Bu komutu kullanabilmek için, sesli odada olmalısın!");
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return msg.channel.send(
        `<:Hayir:> I Need **CONNECT** Permission To Proceed!`
      );
    }
    if (!permissions.has("SPEAK")) {
      return msg.channel.send(
        `<:Hayir:> I Need **SPEAK** Permission To Proceed!`
      );
    }
    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id);
        await handleVideo(video2, msg, voiceChannel, true);
      }
      return msg.channel.send(
        `<:Evet:> **・** **\`${playlist.şarkıismi}\`** Has been Added To The Queue!`
      );
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          let index = 0;
          const embed234222 = new Discord.MessageEmbed()
            .setColor("36393F")
            .setAuthor(bot.user.username, bot.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(`Used by. ${msg.author.username}`)
            .setTimestamp()
            /*------*/
            .setşarkıismi("**Arama Sonuçları**")
            .setDescription(
              `${videos
                .map(video2 => `**${++index}**  **・**  ${video2.şarkıismi}`)
                .join("\n")}`,
              "Lütfen sonuçlardan birini seçmek için, sayı yazın.."
            );
          /*------*/

          msg.channel.send(embed234222);
          try {
            var response = await msg.channel.awaitMessages(
              msg2 => msg2.content > 0 && msg2.content < 11,
              {
                max: 1,
                time: 10000,
                errors: ["time"]
              }
            );
          } catch (err) {
            console.error(err);
            return msg.channel.send(
              `Video Search are canceled! <:Hayir:> \n**Reason:** Timeout`
            );
          }
          const videoIndex = parseInt(response.first().content);
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
          console.error(err);
          return msg.channel.send(
            `Herhangi Bir Arama Sonucu Elde Edemedim. <:Hayir:>`
          );
        }
      }
      return handleVideo(video, msg, voiceChannel);
    }
  } else if (command === "skip" || command === "s") {
    if (!msg.member.voice.channel)
      return msg.channel.send("Bu komutu kullanabilmek için, sesli odada bulunmalısın!");
    if (!serverQueue)
      return msg.channel.send(
        `There is Nothing Playing. <:Hayir:>`
      );
    serverQueue.connection.dispatcher.end("Geçme komutu kullanıldı!");
    return msg.channel.send("⏭️  **|**  Geçme komutu kullanıldı!");
  } else if (command === "leave") {
    if (!msg.member.voice.channel)
      return msg.channel.send("Bu komutu kullanabilmek için, sesli odada bulunmalısın!");
    if (!serverQueue)
      return msg.channel.send(
        `There is Nothing Playing. <:Hayir:>`
      );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end("Çıkma komutu kullanıldı!");
    return msg.channel.send("⏹️  **|**  Çıkma komutu kullanıldı!");
  } else if (command === "volume" || command === "vol") {
    if (!msg.member.voice.channel)
      return msg.channel.send(
        "Üzgünüm, aynı odada bulunmalısın!"
      );
    if (!serverQueue)
      return msg.channel.send(
        `Şuanda birşey çalınmıyor. <:Hayir:>`
      );

    if (!args[1])
      return msg.channel.send(
        `<a:vol2:727487017650225232> **・** Şuanki Değer: **${serverQueue.volume}%**`
      );
    if (isNaN(args[1]) || args[1] > 120)
      return msg.channel.send("**Bu komutun minimum değeri: 1 \n maksimum değeri 120 olmalı!**");
    serverQueue.volume = args[1];
    serverQueue.connection.dispatcher.setVolume(args[1] / 120);
    return msg.channel.send(
      `<a:vol2:727487017650225232> **・** Yeni Değer: **${args[1]}%**`
    );
  } else if (command === "nowplaying" || command === "np") {
    if (!serverQueue)
      return msg.channel.send(
        `📀 Şuanda birşey çalınmıyor. <:Hayir:>`
      );

    return msg.channel.send(`Şuan çalınan: **${serverQueue.songs[0].şarkıismi}**`);
  } else if (command === "queue" || command === "q") {
    if (!serverQueue)
      return msg.channel.send(
        `Şuanda birşey çalınmıyor. <:Hayir:>`
      );
    const embed23422 = new Discord.MessageEmbed()
      .setColor("#36393F")
      .setAuthor(bot.user.username, bot.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(`Used by. ${msg.author.username}`)
      .setTimestamp()
      /*------*/
      .setşarkıismi("**Şarkı Sırası:**")
      .setDescription(
        `${serverQueue.songs
          .map(song => `**・** ${song.title}`)
          .join("\n")} \n\n**Şuan çalınan:** \n*${serverQueue.songs[0].title}*`
      );

    return msg.channel.send(embed23422);
  } else if (command === "pause") {
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause();
      return msg.channel.send("⏸  **|**  Müzik durduruldu!");
    }
    return msg.channel.send(
      `Şuanda birşey çalınmıyor. <:Hayir:>`
    );
  } else if (command === "resume") {
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return msg.channel.send("▶  **|**  Müzik devamediyor!");
    }
    return msg.channel.send(
      `Şuanda birşey çalınmıyor. <:Hayir:>`
    );
  } 
  else if (command === "loop" || command === "lp") {
    if (serverQueue) {
      serverQueue.loop = !serverQueue.loop;
      return msg.channel.send(
        `📀 **・** Music Loop Command ${
          serverQueue.loop === true ? "Enabled!" : "Disabled!"
        }`
      );
    }
    return msg.channel.send(
      `There is Nothing Playing. <:Hayir:>`
    );
  } 
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
  const serverQueue = queue.get(msg.guild.id);
  const song = {
    id: video.id,
    title: Util.escapeMarkdown(video.title),
    url: `https://www.youtube.com/watch?v=${video.id}`,
    channel: video.channel.title,
    durationm: video.duration.minutes,
    durations: video.duration.seconds,
    durationh: video.duration.hours,
    publishedAt: video.publishedAt
  };
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: msg.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 100,
      playing: true,
      loop: false
    };
    queue.set(msg.guild.id, queueConstruct);

    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(msg.guild, queueConstruct.songs[0]);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      queue.delete(msg.guild.id);
      return msg.channel.send(
        `**Bu kanala bağlanamıyorum. <:Hayir:>**`
      );
    }
  } else {
    serverQueue.songs.push(song);
    if (playlist) return;
    else
      return msg.channel.send(
        `<:Evet:> **・** **${song.title}** listeye eklendi.!`
      );
  }
  return;
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    return queue.delete(guild.id);
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      const shiffed = serverQueue.songs.shift();
      if (serverQueue.loop === true) {
        serverQueue.songs.push(shiffed);
      }
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolume(serverQueue.volume / 100);

  serverQueue.textChannel.send({
    embed: {
      color: "#36393F",
      footer: {
        icon_url: "https://cdn.discordapp.com/emojis/727487028958199870.gif",
        text: " ・ GoldenHS Müzik Botu"
      },
      thumbnail: {
        url: `https://i.ytimg.com/vi/${song.id}/sddefault.jpg`
      },
      fields: [
        {
          name: "Yükleyen:",
          value: `${song.channel}`
        },
        {
          name: "Şarkı İsmi:",
          value: `📀 ・ ${song.title}\n\n   `
        },
        {
          name: "Şarkı Linki:",
          value: `- [Tıkla](${song.url}) \n\n `,
          inline: true
        },
        {
          name: "Şarkı Süresi:",
          value: `**${song.durationh}** Saat, **${song.durationm}** Dakika, **${song.durations}** Saniye`
        }
        /* {
          name: "Uploaded At:",
          value: `- ${song.publishedAt} \n\n `,
          inline: true
        },*/
      ],
      author: {
        name: "GoldenHS Müzik",
        icon_url:
          "https://goldenhs.net/folders/img/top/logo.png"
      }
    }
  });
}

/*--------------------------------------------------------------------------------------------------*/
/*
bot.on("ready", () => {
  setInterval(() => {
    let channell = bot.channels.cache.find(c => c.id === "727902407865925712");
    const embed = new Discord.MessageEmbed()
      .setColor("36393F")
      .setTitle("Ready Bots Status")
      .addField(
        "**Ram Usage:**",
        (process.memoryUsage().heapUsed / 512 / 512).toFixed(2) + " MB",
        true
      )
      .addField("**Music Channels:**;", bot.voice.connections.size)
      .addField("**Server:**", bot.guilds.cache.size.toLocaleString(), true)
      .setTimestamp()
      .setFooter(
        "Time:",
        "https://cdn.discordapp.com/emojis/726722827298013214.png?v=1"
      );
    channell.send(embed);
  }, 3600000);
});
*/
/*--------------------------------------------------------------------------------------------------*/

bot.on("message", async message => {
  if (message.channel.id !== "727990769947902093") return;
  message.react(`:Evet:`);
  await message.react(`:Hayir:`);
});

/*--------------------------------------------------------------------------------------------------*/
client.login(process.env.BOT_TOKEN);
