// Dynamic layer on top of app.json. Static config (name, icon, plugins, ...)
// stays in app.json so it's easy to diff; this file only adds the one thing
// that has to be computed at config-eval time: which backend to point at.
//
// API_BASE_URL is intentionally NOT hardcoded here for either environment.
// Set EXPO_PUBLIC_API_BASE_URL in a local `.env` file (copy `.env.example`,
// which is git-ignored) to switch between a local Spring Boot instance and
// the Render deployment. Expo CLI loads `.env`/`.env.local` into
// process.env automatically before this file runs — see
// https://docs.expo.dev/guides/environment-variables/.
const appJson = require('./app.json');

const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || DEFAULT_API_BASE_URL;

/** @type {import('@expo/config-types').ExpoConfig} */
module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    apiBaseUrl: API_BASE_URL,
  },
};
