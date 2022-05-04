import Cookies from 'js-cookie';
import { aboutMe } from './main';
import { openModal, closeModal, UI_MODALS } from './view';

export const Rest_API_Data = {
    email: {
        email:'fanilfan1994@mail.ru',
    },
    url: 'https://mighty-cove-31255.herokuapp.com/api',
    messageAPI: 'messages',
    senderAPI: 'user/me',
    user: 'user',
    webSocket: `ws://mighty-cove-31255.herokuapp.com/websockets?${Cookies.get('approveCode')}`,
}

export async function getAboutMe({url, senderAPI}) {
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

export async function setSenderName(name, url, user) {
    const userName = await fetch(`${url}/${user}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${Cookies.get('approveCode')}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(name),
    });
}