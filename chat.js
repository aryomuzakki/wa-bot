const { youtube } = require("scrape-youtube");
const ytsr = require("ytsr");

const handleIncomingMessage = async (theClient, message) => {

  const messageBody = message.body.toLowerCase();

  // log
  console.log("New Incoming Message: ");
  console.log({
    from: message.from,
    message: message.body,
    hasMedia: message.hasMedia,
    fromMe: message.fromMe,
    hasQuotedMsg: message.hasQuotedMsg,
    timestamp: message.timestamp
  })

  // self message
  if (message.fromMe) {
    return;
  }

  // incoming message contact
  const contact = await message.getContact();

  // group
  if (message.isGroup) {

    // mention all participant in a group

  }

  // personal chat
  if (!message.isGroup) {

  }

  // all chat

  // hello message
  if (messageBody === "hai zak") {

    message.reply(`Halo, ${contact.pushname}\n\nSilahkan pilih menu dibawah:\n  - Sticker WA (Buat sticker wa dari gambar)\n  - Youtube (cari/download youtube)\n  - Katalog (list harga produk)\n  - Cara order (info cara pesan lewat wa bot)\n  - Status order (status transaksi order)`);
    // theClient.sendMessage(message.from, "Halo,\n\nAda yang bisa saya bantu?");
  }

  // sticker maker
  if (messageBody === "buat sticker wa") {
    if (message.hasMedia) {
      (async () => {
        const media = await message.downloadMedia();
        theClient.sendMessage(message.from, media, { sendMediaAsSticker: true, stickerAuthor: "aryo", stickerName: "reply", stickerCategories: ["bot", "random"] });
      })();
    } else {
      message.reply("Maaf, kamu harus mengirimkan bersamaan dengan fotonya");
    }
  }

  // Youtube
  if (messageBody.startsWith("list youtube")) {
    const searchQuery = messageBody.replace("list youtube", "").split("sebanyak")[0].trim();

    if (searchQuery.length < 2) {
      message.reply("Maaf~ Teks pencarian yang harus diberikan minimal 2 huruf");
      return;
    }

    const listCount = parseInt(messageBody.split("sebanyak")[1].trim().split(" ")[0] ?? 5);

    const filter = (await ytsr.getFilters(searchQuery)).get("Type").get("Video");

    const searchResults = await ytsr(filter.url, {
      gl: "ID",
      hl: "id",
      safeSearch: true,
      limit: listCount + (listCount % 5),
    });

    const videoResults = searchResults.items.filter(item => item.type == "video").slice(0, listCount);

    let replyString = `Berikut hasil pencarian youtube "${searchQuery}"\n`;

    const resultItems = videoResults.map((item, idx) => {
      const duration = (item.duration || "").split(".").reverse();
      const jam = (duration?.[2]) ? duration[2] + " jam " : "";

      const formatter = new Intl.NumberFormat('id-ID');

      const resultItem = {
        judul: item.title,
        link: item.url,
        channel: item.author.name + (item.author?.ownerBadges ? ` (${item.author.ownerBadges})` : ""),
        durasi: jam + parseInt(duration[1]).toString() + " menit " + duration[0] + " detik",
        diuploadPada: item.uploadedAt,
        totalDilihat: formatter.format(item.views),
      }

      replyString += `\n${++idx}. Judul: ${resultItem.judul}\nLink: ${resultItem.link}\nChannel: ${resultItem.channel}\nDurasi: ${resultItem.durasi}\nDi Upload Pada: ${resultItem.diuploadPada}\nJumlah Dilihat: ${resultItem.totalDilihat}\n\n`;

      return resultItem;
    })

    message.reply(replyString)

  }

}

module.exports = {
  handleIncomingMessage,
}