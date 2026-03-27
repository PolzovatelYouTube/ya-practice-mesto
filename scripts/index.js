import { api } from "./api.js";

const profileEditButton = document.querySelector(".profile__edit-button");
const profileAddButton = document.querySelector(".profile__add-button");
const profileAvatarButton = document.querySelector(".profile__image");
const logo = document.querySelector(".logo");

const placesList = document.querySelector(".places__list");
const cardTemplate = document.querySelector(".template").content;

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileImage = document.querySelector(".profile__image");

const popupEditProfile = document.querySelector(".popup_type_edit");
const popupAddCard = document.querySelector(".popup_type_new-card");
const popupImage = document.querySelector(".popup_type_image");
const popupEditAvatar = document.querySelector(".popup_type_edit-avatar");
const popupRemoveCard = document.querySelector(".popup_type_remove-card");
const popupInfo = document.querySelector(".popup_type_info");

const profileForm = popupEditProfile.querySelector(".popup__form");
const cardForm = popupAddCard.querySelector(".popup__form");
const avatarForm = popupEditAvatar.querySelector(".popup__form");
const removeCardForm = popupRemoveCard.querySelector(".popup__form");

const profileNameInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const popupImageElement = popupImage.querySelector(".popup__image");
const popupImageCaption = popupImage.querySelector(".popup__caption");

const usersStatsModalInfoList = popupInfo.querySelector(".popup-info__definition-list");
const usersStatsModalUsersList = popupInfo.querySelector(".popup-info__users-list");
const definitionTemplate = document.querySelector("#popup-info-definition-template").content;
const userPreviewTemplate = document.querySelector("#popup-info-user-preview-template").content;
const fallbackProfileData = {
  name: "Жак-Ив Кусто",
  about: "Исследователь океана",
  avatar: "./images/avatar.jpg",
};

let currentUserId = "";
let cardIdToRemove = null;
let cardElementToRemove = null;

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};
const openedPopupClass = "popup_is-opened";

const openModalWindow = (modal) => {
  modal.classList.add(openedPopupClass);
  document.addEventListener("keydown", closeByEsc);
};

const closeModalWindow = (modal) => {
  modal.classList.remove(openedPopupClass);
  document.removeEventListener("keydown", closeByEsc);
};

const closeByEsc = (evt) => {
  if (evt.key !== "Escape") {
    return;
  }

  const openedModal = document.querySelector(`.${openedPopupClass}`);
  if (openedModal) {
    closeModalWindow(openedModal);
  }
};

const setLoadingState = (button, isLoading, defaultText, loadingText) => {
  button.textContent = isLoading ? loadingText : defaultText;
};

const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
};

const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(settings.errorClass);
};

const checkInputValidity = (formElement, inputElement, settings) => {
  if (inputElement.validity.patternMismatch) {
    inputElement.setCustomValidity("Разрешены только латиница, кириллица, дефис и пробел.");
  } else {
    inputElement.setCustomValidity("");
  }

  if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    return;
  }

  hideInputError(formElement, inputElement, settings);
};

const hasInvalidInput = (inputList) =>
  inputList.some((inputElement) => !inputElement.validity.valid);

const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

const toggleButtonState = (inputList, buttonElement, settings) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
    return;
  }

  enableSubmitButton(buttonElement, settings);
};

const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  toggleButtonState(inputList, buttonElement, settings);
  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
};

const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((inputElement) => {
    inputElement.setCustomValidity("");
    hideInputError(formElement, inputElement, settings);
  });
  disableSubmitButton(buttonElement, settings);
};

const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach((formElement) => {
    if (formElement.name === "remove-card") {
      return;
    }
    setEventListeners(formElement, settings);
  });
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (name, value) => {
  const infoNode = definitionTemplate
    .querySelector(".popup-info__definition-item")
    .cloneNode(true);

  infoNode.querySelector(".popup-info__definition-name").textContent = name;
  infoNode.querySelector(".popup-info__definition-value").textContent = value;
  return infoNode;
};

const createUserPreview = (user) => {
  const userNode = userPreviewTemplate.querySelector(".popup-info__user-item").cloneNode(true);
  const avatar = userNode.querySelector(".popup-info__user-avatar");

  avatar.src = user.avatar;
  avatar.alt = user.name;
  userNode.querySelector(".popup-info__user-name").textContent = user.name;
  return userNode;
};

const isCardLiked = (likes, userId) => likes.some((user) => user._id === userId);

const updateCardLikes = (cardElement, cardData) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-count");
  const liked = isCardLiked(cardData.likes, currentUserId);

  likeButton.classList.toggle("card__like-button_active", liked);
  likeCounter.textContent = String(cardData.likes.length);
};

const handleImageClick = (name, link) => {
  popupImageElement.src = link;
  popupImageElement.alt = name;
  popupImageCaption.textContent = name;
  openModalWindow(popupImage);
};

const createCard = (cardData) => {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
  const image = cardElement.querySelector(".card__image");
  const title = cardElement.querySelector(".card__title");
  const deleteButton = cardElement.querySelector(".card__delete-button");
  const likeButton = cardElement.querySelector(".card__like-button");

  image.src = cardData.link;
  image.alt = cardData.name;
  title.textContent = cardData.name;

  updateCardLikes(cardElement, cardData);

  image.addEventListener("click", () => {
    handleImageClick(cardData.name, cardData.link);
  });

  likeButton.addEventListener("click", () => {
    const liked = isCardLiked(cardData.likes, currentUserId);
    api.changeLikeCardStatus(cardData._id, liked)
      .then((updatedCard) => {
        cardData.likes = updatedCard.likes;
        updateCardLikes(cardElement, updatedCard);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  if (cardData.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      cardIdToRemove = cardData._id;
      cardElementToRemove = cardElement;
      openModalWindow(popupRemoveCard);
    });
  }

  return cardElement;
};

const renderCards = (cards) => {
  placesList.replaceChildren();
  cards.forEach((card) => {
    placesList.append(createCard(card));
  });
};

const setProfileData = (userData) => {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileImage.style.backgroundImage = `url('${userData.avatar}')`;
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  setLoadingState(submitButton, true, "Сохранить", "Сохранение...");
  api.setUserInfo({
    name: profileNameInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      setProfileData(userData);
      closeModalWindow(popupEditProfile);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setLoadingState(submitButton, false, "Сохранить", "Сохранение...");
    });
};

const handleAddCardSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  setLoadingState(submitButton, true, "Создать", "Создание...");
  api.addCard({ name: cardNameInput.value, link: cardLinkInput.value })
    .then((newCard) => {
      placesList.prepend(createCard(newCard));
      cardForm.reset();
      closeModalWindow(popupAddCard);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setLoadingState(submitButton, false, "Создать", "Создание...");
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  setLoadingState(submitButton, true, "Сохранить", "Сохранение...");
  api.updateAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      setProfileData(userData);
      avatarForm.reset();
      closeModalWindow(popupEditAvatar);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setLoadingState(submitButton, false, "Сохранить", "Сохранение...");
    });
};

const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  if (!cardIdToRemove || !cardElementToRemove) {
    return;
  }

  setLoadingState(submitButton, true, "Да", "Удаление...");
  api.deleteCard(cardIdToRemove)
    .then(() => {
      cardElementToRemove.remove();
      cardIdToRemove = null;
      cardElementToRemove = null;
      closeModalWindow(popupRemoveCard);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      setLoadingState(submitButton, false, "Да", "Удаление...");
    });
};

const handleLogoClick = () => {
  api.getCardList()
    .then((cards) => {
      usersStatsModalInfoList.replaceChildren();
      usersStatsModalUsersList.replaceChildren();

      if (cards.length > 0) {
        usersStatsModalInfoList.append(
          createInfoString("Всего карточек:", String(cards.length))
        );
        usersStatsModalInfoList.append(
          createInfoString("Первая создана:", formatDate(new Date(cards[cards.length - 1].createdAt)))
        );
        usersStatsModalInfoList.append(
          createInfoString("Последняя создана:", formatDate(new Date(cards[0].createdAt)))
        );
      }

      const usersById = new Map();
      cards.forEach((card) => {
        usersById.set(card.owner._id, card.owner);
      });

      usersById.forEach((user) => {
        usersStatsModalUsersList.append(createUserPreview(user));
      });

      openModalWindow(popupInfo);
    })
    .catch((err) => {
      console.log(err);
    });
};

const setupCommonPopupHandlers = () => {
  document.querySelectorAll(".popup").forEach((popup) => {
    popup.addEventListener("mousedown", (evt) => {
      if (
        evt.target.classList.contains("popup") ||
        evt.target.classList.contains("popup__close")
      ) {
        closeModalWindow(popup);
      }
    });
  });
};

profileEditButton.addEventListener("click", () => {
  profileNameInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(popupEditProfile);
});

profileAddButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(popupAddCard);
});

profileAvatarButton.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(popupEditAvatar);
});

logo.addEventListener("click", handleLogoClick);
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardSubmit);
setupCommonPopupHandlers();
enableValidation(validationConfig);

Promise.all([api.getCardList(), api.getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    setProfileData(userData);
    renderCards(cards);
  })
  .catch((err) => {
    setProfileData(fallbackProfileData);
    console.error("Ошибка загрузки данных с API:", err);
    console.info("Проверьте правильность baseUrl (cohort) и authorization токена в scripts/api.js");
  });