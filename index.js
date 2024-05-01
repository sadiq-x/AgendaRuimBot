import 'dotenv/config';
import express from 'express';
import { GetAuth, GetToken, DoAuth } from './authG.js';
import { GetBot } from './authT.js';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 9000;
const bot = GetBot();

const calendar = {
    c1: "2c01e365916fe533554e84df16db70330a4dd43354b2b1fc298f386227b00a22@group.calendar.google.com", //Google calendar aAgendaRuim
    c2: "22a56b7889d84c39d0eec1236a93ed33d3a63c4f5567f8c1e31b1ca34034014c@group.calendar.google.com"  //Google calendar aAgendaRuim IRL events
};

function server() {
    app.listen(port, () => {
        console.log(`Server on port ${port}`)
    })
}

async function GetCalendar(bot, msg, url) {
    let date = new Date()
    let dateTime = `${date.getFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
    let currentDay = `${date.getUTCDate()}-${date.getUTCMonth() + 1}-${date.getFullYear()}`

    //console.log(dateTime);
    let data = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${url}/events?timeMax=${dateTime}T23%3A59%3A59Z&timeMin=${dateTime}T00%3A00%3A00Z`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${GetToken()}`,
                Accept: 'application / json'
            }
        })
    let calendar = await data.json();
    let itens = calendar.items;
    let itemcount = calendar.items.length;
    let msgString = `*${calendar.summary}*  ${currentDay}\n`;
    if (itemcount > 0) {
        for (let item = 0; item < itemcount; item++) {
            let dateStart = new Date(itens[item].start.date || itens[item].start.dateTime)
            let dateEnds = new Date(itens[item].end.date || itens[item].end.dateTime)
            msgString += `\n*${itens[item].summary}*\n*${itens[item].location}*\n*${dateStart.getHours()}:${dateStart.getMinutes() || "00"}* || *${dateEnds.getHours()}:${dateEnds.getMinutes() || "00"}*\n`
        }
        bot.sendMessage(msg.chat.id, msgString, { parse_mode: "Markdown" });
    }
}

async function EventsUpdates(msgid, url) {
    let date = new Date()
    let dateTime = `${date.getFullYear()}-${date.getUTCMonth() + 1}-${date.getDate()}`
    let currentDay = `${date.getUTCDate()}-${date.getUTCMonth() + 1}-${date.getFullYear()}`
    let data = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${url}/events?timeMax=${dateTime}T23%3A59%3A59Z&timeMin=${dateTime}T00%3A00%3A00Z`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${GetToken()}`,
                Accept: 'application / json'
            }
        })
    let calendar = await data.json();
    let itens = calendar.items;
    let itemcount = calendar.items.length;
    let msgString = `*${calendar.summary}*  ${currentDay}\n`;
    if (itemcount > 0) {
        for (let item = 0; item < itemcount; item++) {
            let dateStart = new Date(itens[item].start.date || itens[item].start.dateTime)
            let dateEnds = new Date(itens[item].end.date || itens[item].end.dateTime)
            msgString += `\n*${itens[item].summary}*\n*${itens[item].location}*\n*${dateStart.getHours()}:${dateStart.getMinutes() || "00"}* || *${dateEnds.getHours()}:${dateEnds.getMinutes() || "00"}*\n`
        }
        bot.sendMessage(msgid, msgString, { parse_mode: "Markdown" })
    }
}

app.get("/google", DoAuth)  //Verify Google account 
app.get("/google/redirect", GetAuth)    //Response Token from Google account 

app.get("/test", (req, res) => {
})

//Request from Telegram channel "/events"
bot.onText(/\/events/, async (msg) => {
    await GetCalendar(bot, msg, calendar.c1)
    await GetCalendar(bot, msg, calendar.c2)
})

//Request from Telegram channel "/bot"
bot.onText(/\/bot/, async (msg) => {
    let msgString = "Bem vindo ao *AgendaRuimBot*\nEste bot informa a cada 12h todos os eventos diários.\nDigite /events para receber os eventos do dia!"
    bot.sendMessage(msg.chat.id, msgString, { parse_mode: "Markdown" });
})

//Reminder Events in 12h
setInterval(async () => { await EventsUpdates("-1001845051036", calendar.c1) }, 100000);
setInterval(async () => { await EventsUpdates("-1001845051036", calendar.c2) }, 100000);

server()
