import dotenv from "dotenv";

const EXPECTED_ENV_VARS = ["MONGOURL", "JWT_SECRET"];

dotenv.config();
let path;
switch (process.env.NODE_ENV) {
  case "test":
    path = `${__dirname}/../.env.test`;
    break;
  case "production":
    path = `${__dirname}/../.env.production`;
    break;
  default:
    // path = `${__dirname}/../.env.development`
    path = `${__dirname}/../.env.development`;
}
dotenv.config({ path: path });

//MAKING SURE VARIABLES ARE DEFINED.
for (const variable of EXPECTED_ENV_VARS) {
  if (!process.env[variable]) {
    throw new Error(`process.env.${variable} is required.`);
  }
}
export const JWT_SECRET = process.env.JWT_SECRET!;
export const MONGOURL = process.env.MONGOURL || "mongodb://127.0.0.1:27017";
