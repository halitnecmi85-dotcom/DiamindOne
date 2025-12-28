// Central model/provider configuration
// Set the model to use for all clients in the app.
// Update this value to change the model used by the frontend.

export const MODEL_PROVIDER = 'anthropic';
export const MODEL_NAME = 'claude-haiku-4.5';

// Optional: prefer reading from env in case you want runtime overrides
export const getModelName = () => process?.env?.REACT_APP_MODEL || MODEL_NAME;
export const getModelProvider = () => process?.env?.REACT_APP_MODEL_PROVIDER || MODEL_PROVIDER;
