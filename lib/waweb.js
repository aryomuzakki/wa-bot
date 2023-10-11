const qrcode = require("qrcode-terminal");

const { Client, LocalAuth } = require("whatsapp-web.js");
const { handleIncomingMessage } = require("../chat");

const startClient = async ({ clientId, options }) => {

  const waClient = new Client({
    authStrategy: new LocalAuth({ clientId, dataPath: options?.dataPath }),
    // puppeteer: {
    //   executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application",
    // }
  });

  waClient.on("qr", (qr) => {
    console.log("Open your whatsapp, go to linked devices, then scan this qr code to login");
    qrcode.generate(qr, { small: true });
    options.cb(qr);
  })

  waClient.on("ready", async () => {
    console.log("Client is ready!");
    setListener(waClient);
  })

  await waClient.initialize();
  console.log("client initialized");
  return waClient;
}

const setListener = async (theClient) => {

  //

  // auth_failure
  theClient.on("auth_failure", (message) => {
    console.log("Event: 'auth_failure'");
    console.log("message: ", message);
  })
  // authenticated
  theClient.on("authenticated", (session) => {
    console.log("Event: 'autenticated' (legacyauthsession");
    console.log("session: ", session);
  })
  // change_state
  theClient.on("change_state", (state) => {
    console.log("Event: 'change_state'");
    console.log("state", state);
  })
  // chat_archived
  theClient.on("chat_archived", (chat, currState, prevState) => {
    console.log("Event: 'chat_archived'");
    console.log("chat", chat);
    console.log("currState", currState);
    console.log("prevState", prevState);
  })
  // chat_removed
  theClient.on("chat_removed", (chat) => {
    console.log("Event: 'chat_removed'");
    console.log("chat", chat);
  })
  // contact_changed
  theClient.on("contact_changed", (message, oldId, newId, isContact) => {
    console.log("Event: 'contact_changed'");
    console.log("message", message);
    console.log("oldId", oldId);
    console.log("newId", newId);
    console.log("isContact", isContact);
  })
  // disconnected
  theClient.on("disconnected", (reason) => {
    console.log("Event: 'disconnected'");
    console.log("reason", reason);
  })
  // group_admin_changed
  theClient.on("group_admin_changed", (notification) => {
    console.log("Event: 'group_admin_changed'");
    console.log("notification", notification);
  })
  // group_join
  theClient.on("group_join", (notification) => {
    console.log("Event: 'group_join'");
    console.log("notification", notification);
  })
  // group_leave
  theClient.on("group_leave", (notification) => {
    console.log("Event: 'group_leave'");
    console.log("notification", notification);
  })
  // group_update
  theClient.on("group_update", (notification) => {
    console.log("Event: 'group_update'");
    console.log("notification", notification);
  })
  // incoming_call
  theClient.on("incoming_call", (call) => {
    console.log("Event: 'incoming_call'");
    console.log("call", call);
  })
  // media_uploaded
  theClient.on("media_uploaded", (message) => {
    console.log("Event: 'media_uploaded'");
    console.log("message", message);
  })
  // message
  theClient.on("message", (message) => {
    console.log("Event: 'message'");
    console.log("message", message);

    handleIncomingMessage(theClient, message);

  })
  // message_ack
  theClient.on("message_ack", (message, ack) => {
    console.log("Event: 'message_ack'");
    console.log("message", message);
    console.log("ack", ack);
  })
  // message_create
  theClient.on("message_create", (params) => {
    console.log("Event: 'message_create'");
    console.log("params", params);
  })
  // message_edit
  theClient.on("message_edit", (message, newBody, prevBody) => {
    console.log("Event: 'message_edit'");
    console.log("message", message);
    console.log("newBody", newBody);
    console.log("prevBody", prevBody);
  })
  // message_reaction
  theClient.on("message_reaction", (message) => {
    console.log("Event: 'message_reaction'");
    console.log("message", message);
  })
  // message_revoke_everyone
  theClient.on("message_revoke_everyone", (message, revoked_msg) => {
    console.log("Event: 'message_revoke_everyone'");
    console.log("message", message);
    console.log("revoked_msg", revoked_msg);
  })
  // message_revoke_me
  theClient.on("message_revoke_me", (message) => {
    console.log("Event: 'message_revoke_me'");
    console.log("message", message);
  })
}

module.exports = {
  startClient,
}