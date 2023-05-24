import { cleanEnv, port, str } from 'envalid';

console.log(process.env);
const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
  });
};

export default validateEnv;
