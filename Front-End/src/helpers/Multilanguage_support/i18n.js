import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend) // Use the HTTP backend to load translations
  .use(initReactI18next) // Initialize react-i18next
  .init({
    fallbackLng: "en", // Fallback language
    lng: "en", // Default language
    backend: {
      loadPath: "/locales/{{lng}}/translation.json", // Path to translation files in the public folder
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
