// Shared by the server layout (pre-paint gate script) and the client splash.
// Lives outside the 'use client' module so the server gets the real string,
// not a client reference.
export const SPLASH_SESSION_KEY = 'jembatan:splash-seen';
