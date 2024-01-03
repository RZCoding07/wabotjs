const { Client, LocalAuth, MessageMedia, Buttons, Button } = require('whatsapp-web.js');
const port = 4000
const express = require('express')
const app = express()
const token = process.env.APP_TOKEN

const qrcode = require('qrcode-terminal');
const client = new Client({
    authStrategy: new LocalAuth()
});


const TIMEOUT_DURATION = 30000; // Durasi timeout, misalnya 30 detik

let chatStates = {};  // Objek untuk menyimpan state dari setiap chat
let chatTimeouts = {}; // Objek untuk menyimpan timeout dari setiap chat


client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});
ada 
client.on('ready', () => {
    console.log('Client is ready!');
});


client.on('message', async (message) => {
    const chatId = message.from;
    const msgBody = message.body.toLowerCase();

    // Cek dan atur state awal jika belum ada
    if (!chatStates[chatId]) {
        chatStates[chatId] = { step: 'none' };
    }

    // Batalkan timeout sebelumnya jika ada
    if (chatTimeouts[chatId]) {
        clearTimeout(chatTimeouts[chatId]);
    }

    // Logika berdasarkan pesan dan state
    if (msgBody === 'start' && chatStates[chatId].step === 'none') {
        await message.reply('Silahkan masukkan alamat');
        chatStates[chatId].step = 'waiting_for_address';

        // Atur timeout
        chatTimeouts[chatId] = setTimeout(async () => {
            await client.sendMessage(chatId, 'Sesi telah berakhir');
            chatStates[chatId].step = 'none';
        }, TIMEOUT_DURATION);
    } else if (chatStates[chatId].step === 'waiting_for_address') {
        console.log('Alamat diterima:', msgBody);
        await message.reply('Tambahkan keperluan');
        chatStates[chatId].step = 'waiting_for_requirements';

        // Atur ulang timeout
        chatTimeouts[chatId] = setTimeout(async () => {
            await client.sendMessage(chatId, 'Sesi telah berakhir');
            chatStates[chatId].step = 'none';
        }, TIMEOUT_DURATION);
    } else if (chatStates[chatId].step === 'waiting_for_requirements') {
        console.log('Keperluan:', msgBody);
        // Reset state atau lanjutkan dengan logika lain
        chatStates[chatId].step = 'none';
        clearTimeout(chatTimeouts[chatId]);
    }
});


client.initialize();


app.listen(port, () => {
    console.log('reeady');
})