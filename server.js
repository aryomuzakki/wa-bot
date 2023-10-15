const { startClient } = require("./lib/waweb");
const ytsr = require("ytsr");
const QRCode = require("qrcode");
const { sendMessage, getContacts, getChats } = require("./waapi");

const fastify = require("fastify")({ logger: true });

const port = process.env.PORT || 5000;

fastify.get("/", (request, reply) => {
  return reply.send({ hello: "world" });
})

let qrCode;

fastify.get("/startwa/:clientId?", async (request, reply) => {


  const clientId = request.params?.clientId || request.body?.clientId || request.query?.clientId;
  console.log("clientId: ", clientId)

  if (!clientId) {
    return reply.code(400).send({ message: "clientId must be provided" })
  }

  // run after on qr ready
  const cb = (qr) => {
    console.log("in callback");

    QRCode.toDataURL(qr, (err, url) => {
      qrCode = url;
      return reply.send({ message: "waiting to scan qr", qrCode: url });
    })
  }

  return await startClient({ clientId, options: { cb } });
})

fastify.get("/getqr", (request, reply) => {
  if (qrCode) {
    reply.send(qrCode);
  }
  return reply.send({ message: "no qr" });
})

fastify.get("/send_message", async (request, reply) => {

  const to = request.body?.to || request.params?.to;
  const message = request.body?.message || request.params?.message;
  const from = request.body?.from || request.params?.from;

  if (!to || !message || !from) {
    return reply.send({ success: false, message: "'to', 'message', and 'from' is required" });
  }

  const result = await sendMessage(to, message, from);

  return reply.send({ success: true, result });
})

fastify.get("/contacts", async (request, reply) => {
  const from = request.body?.from || request.params?.from;

  const result = await getContacts(from);

  return reply.send({ success: true, result });
})

fastify.get("/chats", async (request, reply) => {
  const from = request.body?.from || request.params?.from;

  const result = await getChats(from);

  return reply.send({ success: true, result });
})

fastify.get("/listyt/:search?", async (request, reply) => {

  const messageBody = request.params?.messageBody || request.query?.messageBody || request.body?.messageBody || "";

  if (!messageBody) {
    return reply.code(400).send({ success: false, message: "messageBody is required" });
  }

  const searchQuery = messageBody.replace("list youtube", "").split("sebanyak")[0].trim();

  if (searchQuery.length < 2) {
    return reply.code(400).send({ success: false, message: "Maaf~ Teks pencarian yang harus diberikan minimal 2 huruf" });
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

  return reply.send({ success: true, data: resultItems, replyString });
})

const startServer = (port) => {
  fastify.listen({ port }, (err) => {
    if (err) {
      fastify.log.error(err);
      console.log(err.code)
      if (err.code == "EADDRINUSE") {
        startServer(port + 1);
      } else {
        process.exit(1);
      }
    }
  })
}
startServer(port);