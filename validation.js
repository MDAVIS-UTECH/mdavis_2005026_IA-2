/* Registration form validation, image preview, and local client-side persistence. */
"use strict";

const registrationForm = document.getElementById("registration-form");
const nameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const githubInput = document.getElementById("github");
const avatarInput = document.getElementById("avatar");
const uploadPreview = document.getElementById("upload-preview");
const previewImage = document.getElementById("preview-image");
const previewName = document.getElementById("preview-name");
const uploadZone = document.getElementById("upload-zone");
const formMessage = document.getElementById("form-message");
let avatarDataUrl = "";

/* Map each field to its accessible inline error element. */
const errorTargets = {
  fullName: document.getElementById("name-error"),
  email: document.getElementById("email-error"),
  github: document.getElementById("github-error"),
  avatar: document.getElementById("avatar-error")
};

function showError(input, message) {
  errorTargets[input.name].textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateName() {
  const value = nameInput.value.trim();
  if (!value) {
    showError(nameInput, "Please enter your full name.");
    return false;
  }
  if (value.length < 2) {
    showError(nameInput, "Please enter at least two characters.");
    return false;
  }
  showError(nameInput, "");
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!value) {
    showError(emailInput, "Please enter your email address.");
    return false;
  }
  if (!emailPattern.test(value)) {
    showError(emailInput, "Use a valid format, such as name@example.com.");
    return false;
  }
  showError(emailInput, "");
  return true;
}

function validateGithub() {
  const value = githubInput.value.trim();
  
  const githubPattern = /^@[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
  if (!value) {
    showError(githubInput, "Please enter your GitHub handle with @.");
    return false;
  }
  if (!githubPattern.test(value)) {
    showError(githubInput, "Start with @ and use letters, numbers, or hyphens.");
    return false;
  }
  showError(githubInput, "");
  return true;
}

function validateAvatar() {
  const file = avatarInput.files[0];
  if (!file || !avatarDataUrl) {
    showError(avatarInput, "Please choose a JPG or PNG profile image.");
    return false;
  }
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    showError(avatarInput, "Only JPEG and PNG images are accepted.");
    return false;
  }
  if (file.size > 2 * 1024 * 1024) {
    showError(avatarInput, "Your image must be 2 MB or less.");
    return false;
  }
  showError(avatarInput, "");
  return true;
}

function clearAvatar() {
  avatarInput.value = "";
  avatarDataUrl = "";
  uploadPreview.hidden = true;
  uploadZone.hidden = false;
  previewImage.removeAttribute("src");
  previewName.textContent = "";
  showError(avatarInput, "");
}

avatarInput.addEventListener("change", function () {
  const file = avatarInput.files[0];
  avatarDataUrl = "";
  if (!file) {
    clearAvatar();
    return;
  }
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    showError(avatarInput, "Only JPEG and PNG images are accepted.");
    avatarInput.value = "";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showError(avatarInput, "Your image must be 2 MB or less.");
    avatarInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", function () {
    avatarDataUrl = String(reader.result);
    previewImage.src = avatarDataUrl;
    previewName.textContent = file.name;
    uploadPreview.hidden = false;
    uploadZone.hidden = true;
    showError(avatarInput, "");
  });
  reader.addEventListener("error", function () {
    showError(avatarInput, "This image could not be read. Please choose another.");
  });
  reader.readAsDataURL(file);
});

document.getElementById("remove-file").addEventListener("click", clearAvatar);
nameInput.addEventListener("blur", validateName);
emailInput.addEventListener("blur", validateEmail);
githubInput.addEventListener("blur", validateGithub);

/* Keep non-file fields if the visitor returns to the form. */
try {
  const savedDraft = JSON.parse(sessionStorage.getItem("codingConfDraft") || "{}");
  if (savedDraft.fullName) nameInput.value = savedDraft.fullName;
  if (savedDraft.email) emailInput.value = savedDraft.email;
  if (savedDraft.github) githubInput.value = savedDraft.github;
} catch (error) {
  sessionStorage.removeItem("codingConfDraft");
}

registrationForm.addEventListener("input", function () {
  sessionStorage.setItem("codingConfDraft", JSON.stringify({
    fullName: nameInput.value,
    email: emailInput.value,
    github: githubInput.value
  }));
});

registrationForm.addEventListener("submit", function (event) {
  event.preventDefault();
  formMessage.textContent = "";
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isGithubValid = validateGithub();
  const isAvatarValid = validateAvatar();

  if (!(isNameValid && isEmailValid && isGithubValid && isAvatarValid)) {
    formMessage.textContent = "A few details need attention. Check the messages above.";
    const firstInvalid = registrationForm.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const attendee = {
    fullName: nameInput.value.trim(),
    email: emailInput.value.trim(),
    github: githubInput.value.trim(),
    avatar: avatarDataUrl,
    serial: "#CC" + String(Date.now()).slice(-5)
  };

  try {
    /* localStorage lets the ticket page read the same browser-side state. */
    localStorage.setItem("codingConfAttendee", JSON.stringify(attendee));
    sessionStorage.removeItem("codingConfDraft");
    window.location.href = "ticket.html";
  } catch (error) {
    formMessage.textContent = "Your browser could not save the ticket. Try a smaller image or enable browser storage.";
  }
});
