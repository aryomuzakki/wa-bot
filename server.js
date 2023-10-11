const { youtube } = require("scrape-youtube");
const { startClient } = require("./lib/waweb");

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

  const searchQuery = request.params?.search || request.query?.search || request.body?.search;
  const type = request.query?.type || request.body?.type;

  const results = await youtube.search(searchQuery, { type });

  console.log("results: ", results)
  console.log("results.videos: ", results.videos)
  return reply.send({ success: true, data: results.videos });
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