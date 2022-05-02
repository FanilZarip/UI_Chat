import { UI_ELEM, UI_BUTTONS, UI_MODALS, UI_FORMS, UI_INPUTS, sendNewMessageUI, openCloseSettings, closeModal, openModal, showAuthorithationOk, clearInput } from "./view.js";
import { format } from 'date-fns';
import Cookies from 'js-cookie';

const Rest_API_Data = {
    email: {
        email:'fanilfan1994@mail.ru',
    },
    url: 'https://mighty-cove-31255.herokuapp.com/api',
    messageAPI: 'messages',
    senderAPI: 'user/me',
    user: 'user',
}

export const aboutMe = {
    name: 'Я',
    email: 'fanilfan@mail.ru',
}

const messagesShowCount = 2;

getAboutMe(Rest_API_Data);
checkCookie();

const chatCodeApprove = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZhbmlsZmFuMTk5NEBtYWlsLnJ1IiwiaWF0IjoxNjUxNTA1MDUyLCJleHAiOjE2NTE5NTE0NTJ9.zkWiJFql2pfCa2UTlNYSeVawr8o7C9-fq0vrjIRQUHE';

UI_BUTTONS.settings.addEventListener('click', openCloseSettings);
UI_BUTTONS.settingsClose.addEventListener('click', openCloseSettings);

UI_BUTTONS.authorizationClose.addEventListener('click', () => {closeModal(UI_MODALS.authorization);});

UI_BUTTONS.approveClose.addEventListener('click', () => {closeModal(UI_MODALS.approve);});
UI_FORMS.approve.addEventListener('submit', (event) => {event.preventDefault()});
UI_FORMS.approve.addEventListener('submit', setApproveCodeCookie);

UI_FORMS.settings.addEventListener('submit', (event) => {event.preventDefault()});
UI_FORMS.settings.addEventListener('submit', () => {sendUserName(Rest_API_Data)});

UI_FORMS.newMessage.addEventListener('submit', (event) => {event.preventDefault()});
UI_FORMS.newMessage.addEventListener('submit', () => {sendMessageWebSocket()});
UI_FORMS.newMessage.addEventListener('submit', clearInput);

function loadData() {
    getHistory(Rest_API_Data, messagesShowCount);
    getAboutMe(Rest_API_Data);
}

function collectMessageData(text, sendTime, sender, email) {

    const messageData = {
        text: text,
        sendTime: format(new Date(sendTime), 'HH:mm'),
        sender: sender,
        email: email,
    }
    return messageData;
}

function setApproveCodeCookie() {
    const approveCode = UI_INPUTS.approveCode.value;
    Cookies.set('approveCode', approveCode, { expires: 1 });
    UI_INPUTS.approveCode.value = '';
    closeModal(UI_MODALS.approve);
}

function checkCookie() {
    const notHasCookie = Cookies.get('approveCode') === '' || Cookies.get('approveCode') === undefined;
    if (!notHasCookie) {
        closeModal(UI_MODALS.approve);
        closeModal(UI_MODALS.authorization);
        loadData();
    } else {
        closeModal(UI_MODALS.dataLoad);
    }
}

async function getAboutMe({url, senderAPI}) {
    try {
        const response = await fetch(`${url}/${senderAPI}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${Cookies.get('approveCode')}`,
            },
        });
        
        if (response.status === 401) {
            openModal(UI_MODALS.approve);
            openModal(UI_MODALS.authorization);
            closeModal(UI_MODALS.dataLoad);
            throw new Error('Check that approve code was correct');
        }

        const {name, email} = await response.json();
        
        console.log(name, email);

        aboutMe.name = name;
        aboutMe.email = email;
        
    } catch (error) {
        alert(`Error while Fetch running API: ${senderAPI}\n Check console log for details`, error.stack);
        console.log(error.stack);
    }    
}

async function getHistory({url, messageAPI}, count) {
    
    try {
        const response = await fetch(`${url}/${messageAPI}`);
        const result = await response.json();
        const messages = result.messages;

        getMessageByCount(count);

        function getMessageByCount(n) {
            if (n < 1) {
                return;
            }
            const {text, createdAt, user: {email}} = messages[messages.length - n];
            sendNewMessageUI(collectMessageData(text, createdAt, aboutMe.name, email));
            getMessageByCount(n-1);
        }

        closeModal(UI_MODALS.dataLoad);  
    
    } catch (error) {
        const errorMessage = `Error while Fetch running API: ${url}/${messageAPI}`;
        console.log(errorMessage, error.stack);
    }    
}

async function sendUserName({url, user}) {

    try {

        UI_ELEM.preloader.classList.add('display__preloader');
        const senderName = {name: UI_INPUTS.settings.value};
        const userName = await fetch(`${url}/${user}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${Cookies.get('approveCode')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(senderName),
        });
        aboutMe.name = senderName.name;
        getAboutMe(Rest_API_Data);
        UI_ELEM.preloader.classList.remove('display__preloader');
        closeModal(UI_MODALS.settings);
        
    } catch (error) {
        alert(error.stack)
    }
}

UI_FORMS.authorization.addEventListener('submit', (event) => {event.preventDefault();});
UI_FORMS.authorization.addEventListener('submit', () => {sendAuthorizationData(Rest_API_Data)});

async function sendAuthorizationData({email, url, user}) {

    try {
        const response = await fetch(`${url}/${user}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': 'POST',
            },
            body: JSON.stringify(email),
        });        

        const responseStatus = response.status;

        if (responseStatus === 200) {
            showAuthorithationOk();
            closeModal(UI_MODALS.authorization);
            console.log(response);
        } else {
            throw new Error();
        }
    } catch (Error) {
        console.log(`Fetch ${user}}`, Error.stack);
    }
}

function socketInit() {
    const socket = new WebSocket(`ws://mighty-cove-31255.herokuapp.com/websockets?${Cookies.get('approveCode')}`);
    return socket;
}

socketInit();

const socket = socketInit();

function sendMessageWebSocket() {

    try {
        const message = UI_INPUTS.message.value;
        const sessionStatus = socket.readyState;
        const sessionClosed = {
            closing: 2,
            closed: 3,
        }

        const sessionWasClosed = sessionStatus === sessionClosed.closed || sessionStatus === sessionClosed.closing;

        console.log(socket.readyState);
        socket.send(JSON.stringify({
            text: message,
        }));

        if (sessionWasClosed) {
            console.log('sessionClosed');
            socketInit();
        }

    } catch (error) {
        console.log(error.stack);
    }

}

// socket.addEventListener('open', sendMessageWebSocket);


socket.onmessage = function(event) {
    try {
        const newSocketMessage = JSON.parse(event.data);
        const {text, createdAt, user: {email}} = newSocketMessage;
        const name = aboutMe.name;
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
