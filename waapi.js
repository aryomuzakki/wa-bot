const { activeClient } = require("./lib/waweb")

const sendMessage = async (to, message, from) => {
  console.log("activeClient: ", activeClient);
  const currentClient = activeClient[from];
  // todo: wrap in await
  const chatId = await currentClient.getNumberId(to);
  console.log("numberid: ", chatId);
  const contact = await currentClient.getContactById(chatId._serialized);
  console.log("contactbyid: ", contact);
  console.log("contactbyid id: ", contact.id);
  return await currentClient.sendMessage(chatId._serialized, message);
}

const getContacts = async (from) => {
  console.log("activeClient: ", activeClient);
  return await activeClient[from].getContacts();
}

const getChats = async (from) => {
  console.log("activeClient: ", activeClient);
  return await activeClient[from].getChats();
}

module.exports = {
  sendMessage,
  getContacts,
  getChats,
}