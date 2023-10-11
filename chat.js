const handleIncomingMessage = (theClient, message) => {

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

  // all chat

  // hello message
  if (message.body.toLowerCase() === "hai zak") {
    message.reply("Halo, zak disini\n\nAda yang bisa saya bantu?");
    // theClient.sendMessage(message.from, "Halo, Ryo disini\n\nAda yang bisa saya bantu?");
  }

  // sticker maker
  if (message.body.toLowerCase() === "hai zak, tolong buat jadi sticker") {
    if (message.hasMedia) {
      (async () => {
        const media = await message.downloadMedia();
        theClient.sendMessage(message.from, media, { sendMediaAsSticker: true, stickerAuthor: "aryo", stickerName: "reply", stickerCategories: ["bot", "random"] });
      })();
    } else {
      message.reply("Sertakan Fotonya");
    }
  }

  // personal chat
  if (!message.isGroup) {

  }

  // group
  if (message.isGroup) {

    // mention all participant in a group

  }
}

module.exports = {
  handleIncomingMessage,
}