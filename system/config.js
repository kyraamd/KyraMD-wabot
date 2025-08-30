const {
  extractMessageContent: a,
  jidNormalizedUser: b,
  proto: c,
  delay: d,
  getContentType: e,
  areJidsSameUser: f,
  generateWAMessage: g
} = require("@whiskeysockets/baileys");
const h = require("chalk");
const i = require("fs");

module.exports = (j, k) => {
  if (!k) return k;
  let l = c.WebMessageInfo;
  if (k.key) {
    k.id = k.key.id;
    k.chat = k.key.remoteJid;
    k.from = k.chat.startsWith('status') ? b(k.key.participant || k.participant) : b(k.chat);
    k.isBaileys = k.id.startsWith('BAE5') && k.id.length === 16;
    k.fromMe = k.key.fromMe;
    k.isGroup = k.chat.endsWith('@g.us');
    k.sender = j.decodeJid(k.fromMe ? j.user.id : (k.participant || k.key.participant || k.chat));
    if (k.isGroup) k.participant = j.decodeJid(k.key.participant) || '';
  }

  if (k.message) {
    k.mtype = e(k.message);
    k.prefix = ".";
    const m = k.message[k.mtype];
    k.msg = (k.mtype === 'viewOnceMessage') ? k.message[k.mtype].message[e(k.message[k.mtype].message)] : m;

    k.body = k?.message?.conversation || k?.msg?.caption || k?.msg?.text ||
      (k.mtype === 'extendedTextMessage' && k.msg.text) ||
      (k.mtype === 'buttonsResponseMessage' && k.msg.selectedButtonId) ||
      (k.mtype === 'interactiveResponseMessage' && JSON.parse(k.msg.nativeFlowResponseMessage.paramsJson)?.id) ||
      (k.mtype === 'templateButtonReplyMessage' && k.msg.selectedId) ||
      (k.mtype === 'listResponseMessage' && k.msg.singleSelectReply?.selectedRowId) || "";

    let n = k.quoted = k.msg?.contextInfo?.quotedMessage || null;
    k.mentionedJid = k.msg?.contextInfo?.mentionedJid || [];

    if (n) {
      let o = e(n);
      k.quoted = n[o];
      if (o === 'productMessage') {
        o = e(k.quoted);
        k.quoted = k.quoted[o];
      }
      if (typeof k.quoted === 'string') k.quoted = { text: k.quoted };

      k.quoted.key = {
        remoteJid: k.msg.contextInfo.remoteJid || k.from,
        participant: b(k.msg.contextInfo.participant),
        fromMe: f(b(k.msg.contextInfo.participant), b(j.user.id)),
        id: k.msg.contextInfo.stanzaId
      };

      k.quoted.mtype = o;
      k.quoted.chat = k.quoted.key.remoteJid;
      k.quoted.id = k.quoted.key.id;
      k.quoted.from = /g\.us|status/.test(k.quoted.chat) ? k.quoted.key.participant : k.quoted.chat;
      k.quoted.isBaileys = k.quoted.id?.startsWith('BAE5') && k.quoted.id.length === 16;
      k.quoted.sender = j.decodeJid(k.quoted.key.participant);
      k.quoted.fromMe = k.quoted.sender === j.user.id;
      k.quoted.text = k.quoted.text || k.quoted.caption || k.quoted.conversation || k.quoted.contentText || k.quoted.selectedDisplayText || k.quoted.title || '';
      k.quoted.mentionedJid = k.msg.contextInfo?.mentionedJid || [];

      const p = k.quoted.fakeObj = l.fromObject({
        key: k.quoted.key,
        message: n,
        ...(k.isGroup ? { participant: k.quoted.sender } : {})
      });

      k.quoted.download = (saveToFile = false) => j.downloadM(k.quoted, k.quoted.mtype.replace(/message/i, ''), saveToFile);
    }
  }

  if (k.msg?.url) k.download = (saveToFile = false) => j.downloadM(k.msg, k.mtype.replace(/message/i, ''), saveToFile);
  k.text = k.body;

  k.reply = async (q, r = {}) => {
    const s = r.chat || k.chat;
    const t = r.quoted || k;
    const u = [...(q.matchAll(/@(\d{0,16})/g))].map(v => v[1] + '@s.whatsapp.net');
    return j.sendMessage(s, { text: q, mentions: u, ...r }, { quoted: t });
  };

  return k;
};

let z = require.resolve(__filename);
i.watchFile(z, () => {
  i.unwatchFile(z);
  console.log(h.blue(">> Update File:"), h.black.bgWhite(__filename));
  delete require.cache[z];
  require(z);
});