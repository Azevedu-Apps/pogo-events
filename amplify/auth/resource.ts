import { defineAuth, secret } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['email', 'profile'],
        attributeMapping: {
          email: 'email'
        }
      },
      callbackUrls: [
        'http://localhost:5500/', // Ajuste para sua porta local se não for 5500 ou 3000
        'https://main.d1czh377za5dxp.amplifyapp.com/' // Sua URL de produção do print
      ],
      logoutUrls: [
        'http://localhost:5500/',
        'https://main.d1czh377za5dxp.amplifyapp.com/'
      ]
    }
  },
});
