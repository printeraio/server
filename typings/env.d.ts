declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    DEV_BRANCH_URL: string;
    PROD_BRANCH_URL: string;
    JWT_SECRET_KEY: string;
    JWT_REFRESH_SECRET_KEY: string;
    AWS_ACCOUNT_REGION: string;
    AWS_ACCOUNT_ID: string;
    AWS_ACCOUNT_ACCESS_KEY: string;
    AWS_ACCOUNT_SECRET_KEY: string;
    AWS_USER_POOL_ID: string;
    AWS_USER_POOL_WEB_CLIENT_ID: string;
  }
}
