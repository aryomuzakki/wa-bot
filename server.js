const { youtube } = require("scrape-youtube");
const { startClient } = require("./lib/waweb");
const ytsr = require("ytsr");

const fastify = require("fastify")({ logger: true });

const port = process.env.PORT || 5000;

fastify.get("/", (request, reply) => {
  return reply.send({ hello: "world" });
})

let qrData;
let isReady = false;

fastify.get("/startwa/:clientId?", async (request, reply) => {


  const clientId = request.params?.clientId || request.body?.clientId || request.query?.clientId;
  console.log("clientId: ", clientId)

  if (!clientId) {
    return reply.code(400).send({ message: "clientId must be provided" })
  }

  const cb = (qr) => {
    console.log("assigning qr on qr event");
    console.log("in callback");
    qrData = qr;
  }

  const newClient = await startClient({ clientId, options: { cb } });

  newClient.on("qr", (qr) => {
    console.log("set qrData");
    qrData = qr;
  });

  newClient.on("ready", () => {
    console.log("set isReady");
    isReady = true;
  });

  return reply.send({ message: "client started, waiting for qr. Go to /getqr" });
})

fastify.get("/getqr", (request, reply) => {
  console.log(qrData)
  if (qrData) {
    return reply.send(qrData);
  }
  return reply.send({ message: "qr not ready, wait for a while then refresh" });
})

fastify.get("/listyt/:search?", async (request, reply) => {

  // const searchQuery = request.params?.search || request.query?.search || request.body?.search;
  // const type = request.query?.type || request.body?.type;

  // const results = await youtube.search(searchQuery, { type });

  // console.log("results: ", results)
  // console.log("results.videos: ", results.videos)
  // return reply.send({ success: true, data: results.videos });

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