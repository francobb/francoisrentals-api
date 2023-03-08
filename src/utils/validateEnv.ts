import { cleanEnv, port, str } from 'envalid';

const validateEnv = () => {
  console.log('validating env' + { prc: process.env });
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
  });
};

export default validateEnv;
