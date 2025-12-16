
export const ADMIN_EMAILS = [
  'dev.caique@gmail.com' 
];

export const isAdmin = (user: any): boolean => {
  if (!user) return false;
  
  // Tenta obter o email de diferentes estruturas do objeto User do Amplify/Cognito
  const email = user?.signInDetails?.loginId || user?.attributes?.email || user?.username;
  
  if (!email) return false;

  return ADMIN_EMAILS.includes(email);
};
