import { registerAs } from '@nestjs/config';

export const DbConfig = registerAs('db', () => ({
  prodBranchUrl: `${process.env.PROD_BRANCH_URL}?ssl={"rejectUnauthorized":true}`,
  devBranchUrl: `${process.env.DEV_BRANCH_URL}?ssl={"rejectUnauthorized":true}`,
}));
