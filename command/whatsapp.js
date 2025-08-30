require("../system/function")

const util = require("util");
const chalk = require("chalk");
const fs = require("fs");
const axios = require("axios");
const fetch = require("node-fetch");
const ssh2 = require("ssh2");
const Obfus = require('js-confuser');
const yts = require("yt-search");

const { 
exec, 
spawn, 
execSync 
} = require('child_process');

const {
default: baileys,
proto,
jidNormalizedUser,
generateWAMessage,
generateWAMessageFromContent,
getContentType,
prepareWAMessageMedia,
} = require("@whiskeysockets/baileys")

const Premium = JSON.parse(fs.readFileSync("./system/lib/data/premium.json"))

module.exports = async (client, m) => {
try {
const body = (m.mtype === 'conversation' && m.message.conversation) ? m.message.conversation : (m.mtype == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption : (m.mtype == 'documentMessage') && m.message.documentMessage.caption ? m.message.documentMessage.caption : (m.mtype == 'videoMessage') && m.message.videoMessage.caption ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'interactiveResponseMessage') ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id : (m.mtype == 'templateButtonReplyMessage') && m.message.templateButtonReplyMessage.selectedId ? m.message.templateButtonReplyMessage.selectedId : ""

const prefix = '.'
const isCmd = body.startsWith(prefix)
const quoted = m.quoted ? m.quoted : m
const mime = quoted?.msg?.mimetype || quoted?.mimetype || null
const args = m.body.trim().split(/ +/).slice(1)
const pushname = m.pushName || "No Name";
const qmsg = (m.quoted || m)
const text = q = args.join(" ")
const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ""
const botNumber = await client.decodeJid(client.user.id);
const isOwner = global.owner+"@s.whatsapp.net" == m.sender || m.key.fromMe
const isPremium = [botNumber, ...Premium].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)

//~~~~~~~~~ Metadata Groups ~~~~~~~~~//

try {
m.isGroup = m.chat.endsWith('g.us');
m.metadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => ({})) : {};
const participants = m.metadata.participants || [];
m.isAdmin = participants.some(p => p.admin && p.id === m.sender);
m.isBotAdmin = participants.some(p => p.admin && p.id === botNumber);
} catch {
m.metadata = {};
m.isAdmin = false;
m.isBotAdmin = false;
}

//~~~~~~~~~ Console Log ~~~~~~~~~//

if (isCmd) {
console.log(chalk.blue.bold(`[ NEW MESSAGE ]`), chalk.blue.bold(`${m.sender.split("@")[0]} :`), chalk.blue.bold(`${prefix+command}`))
}

//~~~~~~~~~ Fake Quoted ~~~~~~~~~//

const FakeChannel = {
key: {
remoteJid: 'status@broadcast',
fromMe: false,
participant: '0@s.whatsapp.net'
},
message: {
newsletterAdminInviteMessage: {
newsletterJid: '123@newsletter',
caption: global.namaowner,
inviteExpiration: 0
}
}
}

const FakeLocation = {
key: {
participant: '0@s.whatsapp.net',
...(m.chat ? { remoteJid: 'status@broadcast' } : {})
},
message: {
locationMessage: {
name: global.namaowner,
jpegThumbnail: ''
}
}
}

const qtext = {
key: {
participant: '0@s.whatsapp.net',
...(m.chat ? { remoteJid: 'status@broadcast' } : {})
},
message: {
extendedTextMessage: {
text: `${prefix + command}`
}
}
}

const qtext2 = {
key: {
participant: '0@s.whatsapp.net',
...(m.chat ? { remoteJid: 'status@broadcast' } : {})
},
message: {
extendedTextMessage: {
text: `${namaowner}`
}
}
}

const qlocJpm = {
key: {
participant: '0@s.whatsapp.net',
...(m.chat ? { remoteJid: 'status@broadcast' } : {})
},
message: {
locationMessage: {
name: `WhatsApp Bot ${namaowner}`,
jpegThumbnail: ''
}
}
}

const qlocPush = {
key: {
participant: '0@s.whatsapp.net',
...(m.chat ? { remoteJid: 'status@broadcast' } : {})
},
message: {
locationMessage: {
name: `WhatsApp Bot ${namaowner}`,
jpegThumbnail: ''
}
}
}

const qpayment = {
key: {
participant: '0@s.whatsapp.net',
remoteJid: '0@s.whatsapp.net',
fromMe: false,
id: 'ownername'
},
message: {
requestPaymentMessage: {
currencyCodeIso4217: 'USD',
amount1000: 999999999,
requestFrom: '0@s.whatsapp.net',
noteMessage: {
extendedTextMessage: {
text: 'Kyra MD'
}
},
expiryTimestamp: 999999999,
amount: {
value: 91929291929,
offset: 1000,
currencyCode: 'USD'
}
}
}
}

const qtoko = {
key: {
participant: '0@s.whatsapp.net',
...(m.chat ? { remoteJid: 'status@broadcast' } : {}),
fromMe: false
},
message: {
productMessage: {
product: {
productImage: {
mimetype: 'image/jpeg',
jpegThumbnail: ''
},
title: `${namaowner} - Marketplace`,
description: null,
currencyCode: 'IDR',
priceAmount1000: '999999999999999',
retailerId: `Powered By ${namaowner}`,
productImageCount: 1
},
businessOwnerJid: '0@s.whatsapp.net'
}
}
}

const qlive = {
key: {
participant: '0@s.whatsapp.net',
...(m.chat ? { remoteJid: 'status@broadcast' } : {})
},
message: {
liveLocationMessage: {
caption: `${namabot} By ${namaowner}`,
jpegThumbnail: ''
}
}
}

//=============================================//

switch (command) {
case "menj": case "menu": {
let mbut = `
Hello *${pushname}*..
Thank you for using base *Kyra MD*

Silahkan pilih menu dibawah ini.
`
client.sendMessage(m.chat, {
image: {url: global.thumb},
caption: mbut,
footer: `© ${namaowner}`,
buttons: [
{
buttonId: ".owner",
buttonText: {
displayText: "Developer"
},
type: 1,
},
{
buttonId: 'action',
buttonText: {
displayText: "Ini pesan interactiveMeta"
},
type: 4,
nativeFlowInfo: {
name: 'single_select',
paramsJson: JSON.stringify({
title: 'Pilih Menu',
sections: [
{
title: `${namaowner}`,
highlight_label: `Powered By ${namaowner}`,
rows: [
{
header: 'All Menu',
title: 'All Menu',
description: 'Tampilkan All Menu',
id: '.allmenu',
},
{
header: 'Owner Menu',
title: 'Owner Menu',
description: 'Tampilkan Owner Menu',
id: '.ownermenu',
},
],
},
],
}),
},
},
],
headerType: 1,
viewOnce: true,
contextInfo: {
forwardingScore: 1,
isForwarded: true,
mentionedJid: [m.sender],
forwardedNewsletterMessageInfo: {
newsletterName: global.namasaluran,
newsletterJid: global.idsaluran,
},
externalAdReply: {
title: `${namabot} - ${versi}`,
body: `Developed By ${namaowner}`,
thumbnail: fs.readFileSync("./system/lib/media/image.jpg"),
sourceUrl: global.linksaluran,
mediaType: 1,
renderLargerThumbnail: true
}
}
}, { quoted: FakeLocation })
}
break

//=============================================//

case "allmenu": {
let teksnya = `
Hello *${pushname}*
Thank you for using base *Kyra MD*

> All Command
- ${prefix}addprem
- ${prefix}delprem
- ${prefix}self
- ${prefix}public
- ${prefix}hidetag
- ${prefix}backup
`
client.sendMessage(m.chat, {
image: {url: global.thumb},
caption: teksnya,
footer: `© ${namaowner}`,
buttons: [
{
buttonId: '.menu',
buttonText: {
displayText: 'Kembali'
},
type: 1,
},
],
headerType: 1,
viewOnce: true,
contextInfo: {
forwardingScore: 1,
isForwarded: true,
mentionedJid: [m.sender],
forwardedNewsletterMessageInfo: {
newsletterName: global.namasaluran,
newsletterJid: global.idsaluran,
},
externalAdReply: {
title: `${namabot} - ${versi}`,
body: `Developed By ${namaowner}`,
thumbnail: fs.readFileSync("./system/lib/media/image.jpg"),
sourceUrl: global.linksaluran,
mediaType: 1,
renderLargerThumbnail: true
}
}
}, { quoted: FakeLocation })
}
break

//=============================================//

case "ownermenu": {
let mbut = `
Hello *${pushname}*
Thank you for using base *Kyra MD*

> Owner Menu
- ${prefix}addpremium
- ${prefix}delpremium
`
client.sendMessage(m.chat, {
image: {url: global.thumb},
caption: mbut,
footer: `© ${namaowner}`,
buttons: [
{
buttonId: '.menu',
buttonText: {
displayText: 'Kembali'
},
type: 1,
},
],
headerType: 1,
viewOnce: true,
contextInfo: {
forwardingScore: 1,
isForwarded: true,
mentionedJid: [m.sender],
forwardedNewsletterMessageInfo: {
newsletterName: global.namasaluran,
newsletterJid: global.idsaluran,
},
externalAdReply: {
title: `${namabot} - ${versi}`,
body: `Developed By ${namaowner}`,
thumbnail: fs.readFileSync("./system/lib/media/image.jpg"),
sourceUrl: global.linksaluran,
mediaType: 1,
renderLargerThumbnail: true
}
}
}, { quoted: FakeLocation })
}
break

//=============================================//

case "addpremium": case "addprem": {
if (!isOwner) return m.reply(msg.owner)
if (!m.quoted && !text) return m.reply(`\n*Penggunaan Salah!*\nContoh: *${prefix + command}* 62xxx\n`)
const input = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
const input2 = input.split("@")[0]
if (input2 === global.owner || Premium.includes(input) || input === botNumber) return m.reply(`Nomor ${input2} sudah menjadi owner bot!`)
Premium.push(input)
await fs.writeFileSync("./system/lib/data/premium.json", JSON.stringify(Premium, null, 2))
m.reply(`Berhasil menambah user premium ✅`)
}
break

//=============================================//

case "delpremium": case "delprem": {
if (!isOwner) return m.reply(msg.owner)
if (!m.quoted && !text) return m.reply(`\n*Penggunaan Salah!*\nContoh: *${prefix + command}* 62xxx\n`)
const input = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
const input2 = input.split("@")[0]
if (input2 === global.owner || input == botNumber) return m.reply(`Tidak bisa menghapus owner utama!`)
if (!Premium.includes(input)) return m.reply(`Nomor ${input2} bukan owner bot!`)
let posi = Premium.indexOf(input)
await Premium.splice(posi, 1)
await fs.writeFileSync("./system/lib/data/premium.json", JSON.stringify(Premium, null, 2))
m.reply(`Berhasil menghapus user premium ✅`)
}
break

//=============================================//

case "owner": {
let mbut = `
Halo *${pushname}*..
Silahkan klik tombol dibawah untuk menghubungi owner ku.
`
client.sendMessage(m.chat, {
interactiveMessage: {
title: mbut,
footer: `© ${namaowner}`,
buttons: [
{
name: "cta_url",
buttonParamsJson: JSON.stringify({
display_text: "Contact here!",
url: "https://t.me/KyraaMD",
merchant_url: "https://t.me/KyraaMD",
})
}
]
}
}, {quoted: qlive})
}
break

//=============================================//

case "self": case "public": {
if (!isOwner) return m.reply(msg.owner);

const mode = command === "public";
client.public = mode;
return m.reply(`✅ Bot berhasil beralih ke mode *${mode ? "public" : "self"}*.`);
}
break

//=============================================//

case "ht": case "hidetag": {
if (!m.isGroup) return m.reply(msg.group)
if (!isOwner) return m.reply(msg.owner)
if (!text) return m.reply(`\n*Penggunaan Salah!*\nContoh: *${prefix + command}* pesannya\n`)

let member = m.metadata.participants.map(v => v.id)
await client.sendMessage(m.chat, {text: text, mentions: [...member]}, {quoted: m})
}
break

//=============================================//

case "backupsc": case "bck": case "backup": {
if (!isOwner) return m.reply(msg.owner)
try { 
const tmpDir = "./system/tmp";
if (fs.existsSync(tmpDir)) {
const files = fs.readdirSync(tmpDir).filter(f => !f.endsWith(".js"));
for (let file of files) {
fs.unlinkSync(`${tmpDir}/${file}`);
}
}
await m.reply("Processing Backup Script . ."); 
const name = `KyraMD-wabot`; 
const exclude = ["node_modules", "session", "package-lock.json", "yarn.lock", ".npm", ".cache"];
const filesToZip = fs.readdirSync(".").filter(f => !exclude.includes(f) && f !== "");

if (!filesToZip.length) return m.reply("Tidak ada file yang dapat di-backup.");

execSync(`zip -r ${name}.zip ${filesToZip.join(" ")}`);

await client.sendMessage(m.chat, {
document: fs.readFileSync(`./${name}.zip`),
caption: "Script berhasil dibackup",
fileName: `${name}.zip`,
mimetype: "application/zip"
}, { quoted: m });

fs.unlinkSync(`./${name}.zip`);
} catch (err) {
console.error("Backup Error:", err);
m.reply("Terjadi kesalahan saat melakukan backup.");
}
}
break
        
//=============================================//

default:
if (m.text.startsWith("=>")) {
if (!isOwner) return;

try {
const result = await eval(`(async () => { ${text} })()`);
const output = typeof result !== "string" ? util.inspect(result) : result;
return client.sendMessage(m.chat, { text: util.format(output) }, { quoted: m });
} catch (err) {
return client.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
}
}

if (m.text.startsWith(">")) {
if (!isOwner) return;

try {
let result = await eval(text);
if (typeof result !== "string") result = util.inspect(result);
return client.sendMessage(m.chat, { text: util.format(result) }, { quoted: m });
} catch (err) {
return client.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
}
}

if (m.text.startsWith('$')) {
if (!isOwner) return;

exec(m.text.slice(2), (err, stdout) => {
if (err) {
return client.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
}
if (stdout) {
return client.sendMessage(m.chat, { text: util.format(stdout) }, { quoted: m });
}
});
}

}

} catch (err) {
console.log(err)
await client.sendMessage(m.chat, {text: err.toString()}, {quoted: m})
}}

//=============================================//

process.on("uncaughtException", (err) => {
console.error("Caught exception:", err);
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(chalk.blue(">> Update File:"), chalk.black.bgWhite(__filename));
delete require.cache[file];
require(file);
});