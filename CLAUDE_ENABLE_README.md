# Enable Claude Haiku 4.5 for all clients (project-level guide)

This repository did not contain any direct references to model/provider names. I added a central config file `src/config.js` which sets the model provider and model name to `anthropic` / `claude-haiku-4.5` and exposes helpers that prefer `REACT_APP_*` environment variables.

How to use in the frontend
- Import the config where you prepare requests to your backend or directly to the model API:

```js
import { getModelName, getModelProvider } from './config';

const model = getModelName();
const provider = getModelProvider();
// include these in your request payloads so backend/clients use the desired model
```

Backend / API considerations
- If your app sends requests to a backend that performs the actual model calls, update the backend to accept `model` and `provider` fields from the client, or otherwise read the `REACT_APP_MODEL`/`REACT_APP_MODEL_PROVIDER` env vars on the server.
- If your backend lives outside this repo, you'll need to update that repository's config to use `claude-haiku-4.5`.

Environment variable override (recommended for deployments)
- Set `REACT_APP_MODEL=claude-haiku-4.5` and `REACT_APP_MODEL_PROVIDER=anthropic` in your environment or `.env` to override the hardcoded value.

If you want, I can:
- Update frontend files that perform API calls to include the model/provider value (if you point me to them), or
- Add `.env.example` with the recommended vars, or
- Search a separate backend repo for places to change the model setting.
