const chalk = require("chalk");
const fs = require("fs");

global.owner = "‪60107778112‬"
global.namaowner = "Aokyra"
global.namabot = "Kyra MD"
global.versi = "1.0.0"

global.idsaluran = "120363421107312750@newsletter"
global.namasaluran = "Kyra MD x Baileys"
global.linksaluran = "https://whatsapp.com/channel/0029VbB8tc25kg79Es3JEm3K"

global.thumb = "https://i.ibb.co.com/h1x1n3Jy/c60832a4-c972-40d1-9b75-54626b3d1e8b.jpg"
global.packname = "Bot WhatsApp"

global.usePairingCode = true

global.msg = {
    owner: "Fitur ini khusus untuk owner!",
    prem: "Fitur ini khusus untuk premium!",
    group: "Fitur ini khusus didalam grup!"
}


let file = require.resolve(__filename) 
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.blue(">> Update File :"), chalk.black.bgWhite(`${__filename}`))
delete require.cache[file]
require(file)
})