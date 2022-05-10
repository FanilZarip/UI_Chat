import Cookies from 'js-cookie';
import { aboutMe } from './main';
import { openModal, closeModal, UI_MODALS } from './view';
import { AuthorizationError } from './errors.js';

const ERROR_MESSAGES = {
	setUserName: 'Error while seting userData\n',
	checkToken: 'Check your token',
}

export const Rest_API_Data = {
    url: 'https://mighty-cove-31255.herokuapp.com/api',
    messageAPI: 'messages',
    senderAPI: 'user/me',
    user: 'user',
    webSocket: `wss://mighty-cove-31255.herokuapp.com/websockets?${Cookies.get('approveCode')}`,
    bearer: `Bearer ${Cookies.get('approveCode')}`,
}

export async function getAboutMe({url, senderAPI, bearer}) {
    try {
        const response = await fetch(`${url}/${senderAPI}`, {
            method: 'GET',
            headers: {
                Authorization: bearer,
            },
        });
        
		return response;

    } catch (error) {
        alert(`Error while Fetch running API: ${senderAPI}\n Check console log for details`, error.stack);
        console.log(error.stack);
    }    
}

export async function checkAuthorization() {

    try {
		const response = await getAboutMe(Rest_API_Data);
        const authorizationError = response.status === 401;

		if (authorizationError) {
			openModal(UI_MODALS.approve);
			openModal(UI_MODALS.authorization);
			closeModal(UI_MODALS.dataLoad);
			throw new AuthorizationError('Ошибка авторизации');
		}
        
    } catch (err) {
		if (err instanceof AuthorizationError) {
			alert("Проверьте токен: " + err.message);
		  } else {
			console.log(err);
		  }
    }
}

export async function updateAboutMe() {

	try {
		const response = await getAboutMe(Rest_API_Data);
		const aboutMeJSON = await response.json();
		const {name, email} = aboutMeJSON;

        aboutMe.name = name;
        aboutMe.email = email;

	} catch (error) {
		console.log(error);
		console.log('error while updating data');
	}
}

export async function setSenderName(name, url, user) {

	try {
		const userName = await fetch(`${url}/${user}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${Cookies.get('approveCode')}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(name),
		});		
	} catch (error) {
		console.log(ERROR_MESSAGES.setUserName, error.stack);
	}
}