// src/server.ts
import { app } from './app';
import { config } from './config';

app.listen(config.PORT, () => {
  console.log(`✅ API listening at http://localhost:${config.PORT}`);
});
