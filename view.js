import { isDate } from "date-fns";
import { aboutMe } from "./main.js";

export const UI_ELEM = {
    messageList: document.querySelector('.message__list'),
    chatTemplate: document.querySelector('.chat_template'),
    chatBlock: document.querySelector('.chatBlock'),
    preloader: document.querySelector('.preloader'),
}

export const UI_INPUTS = {
    message: document.querySelector('.message__input'),
    approveCode: document.querySelector('.approve__input'),
    settings: document.querySelector('.settings__input'),
}

export const UI_FORMS = {
    newMessage: document.querySelector('.new_message__form'),
    authorization: document.querySelector('.authorization__form'),
    approve: document.querySelector('.approve__form'),
    settings: document.querySelector('.settings__form'),
}

export const UI_BUTTONS = {
    settings: document.querySelector('.settings'),
    settingsClose: document.querySelector('.close__button'),
    authorizationClose: document.querySelector('.close__authorization'),
    approveClose: document.querySelector('.close__approve'),
    approve: document.querySelector('.approve__button'),
}

export const UI_MODALS = {
    settings: document.querySelector('.settings__modal'),
    approve: document.querySelector('.approve__modal'),
    authorization: document.querySelector('.authorization__modal'),
    dataLoad: document.querySelector('.data__load__modal'),
}


export function sendNewMessageUI({text, sendTime, sender, email}) {

    UI_ELEM.messageList.append(UI_ELEM.chatTemplate.content.cloneNode(true));
    const newMessageItem = UI_ELEM.messageList.lastElementChild;

    const NEW_MESSAGE = {
        text: newMessageItem.querySelector('.template_message__text'),
        sendTime: newMessageItem.querySelector('.send__time'),
        sender: newMessageItem.querySelector('.sender'),
    }       

    const isSenderI = email === aboutMe.email;

    if(isSenderI) {
        newMessageItem.classList.add('my__message');
    }

    NEW_MESSAGE.text.innerText = text;
    NEW_MESSAGE.sendTime.innerText = sendTime;
    NEW_MESSAGE.sender.innerText = `${sender}: `;

    // Нужно ли действие ниже выносить в отдельную функцию?
    UI_ELEM.messageList.scrollIntoView({block: "end"});
} 

export function openCloseSettings() {
    UI_MODALS.settings.classList.toggle('displayModal');
}

export function closeModal(modal) {
    modal.classList.remove('displayModal');
}

export function openModal(modal) {
    modal.classList.add('displayModal');
}

export function showAuthorithationOk() {
    alert("Авторизация прошла успешно, проверьте свою почту");
}

export function clearInput() {
    UI_INPUTS.message.value = '';
}