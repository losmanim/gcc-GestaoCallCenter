var account = new Appwrite.Account(sdk);

window.Auth = {
  login: async function(email, password) {
    try {
      await account.createEmailPasswordSession(email, password);
      var user = await account.get();
      return { success: true, user: { email: user.email, nome: user.name, tipo: 'gestor' } };
    } catch (error) {
      console.error('Auth login error:', error);
      return { success: false, error: error.message || 'Email ou senha inv\u00e1lidos.' };
    }
  },

  logout: async function() {
    try {
      await account.deleteSession('current');
    } catch (e) { /* ignore */ }
  },

  getUser: async function() {
    try {
      var user = await account.get();
      return { email: user.email, nome: user.name, tipo: 'gestor' };
    } catch (e) {
      return null;
    }
  },

  isLoggedIn: async function() {
    var user = await Auth.getUser();
    return !!user;
  },

  requireAuth: async function() {
    var user = await Auth.getUser();
    if (!user) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  changePassword: async function(email, oldPassword, newPassword) {
    try {
      await account.updatePassword(newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
