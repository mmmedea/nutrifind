import app from "./app";
import { getEnv } from "./config/env";

const PORT = process.env.PORT || 4000;

const env = getEnv();
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
