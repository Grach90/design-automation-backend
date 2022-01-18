const { AuthClientTwoLegged } = require("forge-apis");

const config = require("../../config");

/**
 * Initializes a Forge client for 2-legged authentication.
 * @param {string[]} scopes List of resource access scopes.
 * @returns {AuthClientTwoLegged} 2-legged authentication client.
 */
async function getClient(scopes) {
  scopes = scopes || config.scopes.internal;
  const key = scopes.join("+");
  if (cache[key]) return cache[key];

  const { client_id, client_secret } = config.credentials;
  let client = new AuthClientTwoLegged(
    client_id,
    client_secret,
    scopes || config.scopes.internal,
    true
  );
  let credentials = await client.authenticate();
  cache[key] = client;
  console.log(`OAuth2 client created for ${key}`);
  return client;
}

let cache = new Map();
async function getToken(scopes) {
  const key = scopes.join("+");
  if (cache.has(key) && cache.get(key).expires_at > Date.now()) {
    return cache.get(key);
  }
  const client = await getClient(scopes);
  let credentials = await client.authenticate();
  credentials.expires_at = Date.now() + credentials.expires_in * 1000;
  cache.set(key, credentials);
  return credentials;
}

/**
 * Retrieves a 2-legged authentication token for preconfigured public scopes.
 * @returns Token object: { "access_token": "...", "expires_at": "...", "expires_in": "...", "token_type": "..." }.
 */
async function getPublicToken() {
  return getToken(config.scopes.public);
}

/**
 * Retrieves a 2-legged authentication token for preconfigured internal scopes.
 * @returns Token object: { "access_token": "...", "expires_at": "...", "expires_in": "...", "token_type": "..." }.
 */
async function getInternalToken() {
  return getToken(config.scopes.internal);
}

module.exports = {
  getClient,
  getPublicToken,
  getInternalToken,
};
