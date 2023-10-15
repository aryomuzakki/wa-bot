const { activeClient } = require("./lib/waweb")

const sendMessage = async (to, message, from) => {
  return await activeClient[from].sendMessage(to, message);
}

const getContacts = async (from) => {
  return await activeClient[from].getContacts();
}

const getChats = async (from) => {
  return await activeClient[from].getChats();
}

module.exports = {
  sendMessage,
  getContacts,
  getChats,
}