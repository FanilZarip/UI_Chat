import {UI_INPUTS, sendNewMessageUI} from './view.js';
import {aboutMe, collectMessageData, Rest_API_Data} from './main.js';
import { Rest_API_Data } from "./backend.js";
import ReconnectingWebSocket from 'reconnecting-websocket';


export const socket = new ReconnectingWebSocket(Rest_API_Data.webSocket);

export function sendMessageWebSocket() {

    try {
        const message = UI_INPUTS.message.value;
        const sessionStatus = socket.readyState;
        const sessionClosed = {
            closing: 2,
            closed: 3,
        }

        const sessionWasClosed = sessionStatus === sessionClosed.closed || sessionStatus === sessionClosed.closing;

        socket.send(JSON.stringify({
            text: message,
        }));

        if (sessionWasClosed) {
            console.log('sessionClosed');
        }

    } catch (error) {
        console.log(error.stack);
    }

}

socket.onmessage = function(event) {
    try {
        const newSocketMessage = JSON.parse(event.data);
        console.log(newSocketMessage);
        const {text, createdAt, user: {email, name}} = newSocketMessage;
        const brokenJSON = !text || !createdAt || !name || !email;

        if (brokenJSON) {
            throw new Error('JSON was broken')
        } else {
            console.log(collectMessageData(text, createdAt, name, email));
            sendNewMessageUI(collectMessageData(text, createdAt, name, email));   
        }
    } catch (error) {
        console.log(error.stack)
    }
};