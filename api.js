const config = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-202",
  headers: {
    authorization: "a24e2ee7-2bc5-4591-9e48-ddefbbe91f26",
    "Content-Type": "application/json",
  },
};

const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

const getUserInfo = () => {
  return fetch(`${config.baseUrl}/users/me`, { // Запрос к API-серверу
    headers: config.headers, // Подставляем заголовки
  }).then(getResponseData);  // Проверяем успешность выполнения запроса
};

const setUserInfo = ({ name, about }) => {
  return fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      name,
      about,
    }),
  }).then(getResponseData);
};

const getCardList = () => {
  return fetch(`${config.baseUrl}/cards`, {
    headers: config.headers,
  }).then(getResponseData);
};

const updateAvatar = ({ avatar }) => {
  return fetch(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ avatar }),
  }).then(getResponseData);
};

const addCard = ({ name, link }) => {
  return fetch(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({ name, link }),
  }).then(getResponseData);
};

const deleteCard = (cardId) => {
  return fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: config.headers,
  }).then(getResponseData);
};

const changeLikeCardStatus = (cardID, isLiked) => {
  return fetch(`${config.baseUrl}/cards/likes/${cardID}`, {
    method: isLiked ?  "DELETE" : "PUT",
    headers: config.headers,
  }).then((res) => getResponseData(res));
};

export const api = {
  getUserInfo,
  setUserInfo,
  getCardList,
  updateAvatar,
  addCard,
  deleteCard,
  changeLikeCardStatus,
};
