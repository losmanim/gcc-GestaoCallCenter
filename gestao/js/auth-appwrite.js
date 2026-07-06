const sdk = new Appwrite.Client();
sdk
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('TEU_PROJECT_ID');

const account = new Appwrite.Account(sdk);

window.Auth = {
  // Criar conta (só para o admin)
  register: async (email, password, nome) => {
    try {
      await account.create('unique()', email, password, nome);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login
  login: async (email, password) => {
    try {
      await account.createEmailSession(email, password);
      const user = await account.get();
      return { success: true, user: { email: user.email, nome: user.name, tipo: 'gestor' } };
    } catch (error) {
      return { success: false, error: 'Email ou senha inválidos.' };
    }
  },

  // Logout
  logout: async () => {
    try {
      await account.deleteSession('current');
    } catch (e) { /* ignore */ }
  },

  // Verificar sessão
  getUser: async () => {
    try {
      const user = await account.get();
      return { email: user.email, nome: user.name, tipo: 'gestor' };
    } catch (e) {
      return null;
    }
  },

  isLoggedIn: async () => {
    const user = await Auth.getUser();
    return !!user;
  },

  requireAuth: async () => {
    const user = await Auth.getUser();
    if (!user) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  changePassword: async (newPassword) => {
    try {
      await account.updatePassword(newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
