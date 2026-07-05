(function() {
  const USERS_KEY = 'gcc_gestao_users';
  const SESSION_KEY = 'gcc_gestao_session';

  const defaultUsers = [
    { email: 'admin@gcc.pt', password: 'admin123', nome: 'Administrador', tipo: 'admin' },
    { email: 'gestor@gcc.pt', password: 'gestor123', nome: 'Gestor Principal', tipo: 'gestor' },
  ];

  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }

  window.Auth = {
    login: function(email, password) {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, nome: user.nome, tipo: user.tipo }));
        return { success: true, user: user };
      }
      return { success: false, error: 'Email ou senha inválidos.' };
    },

    logout: function() {
      sessionStorage.removeItem(SESSION_KEY);
    },

    getUser: function() {
      try {
        const data = sessionStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
      } catch(e) { return null; }
    },

    isLoggedIn: function() {
      return !!this.getUser();
    },

    requireAuth: function() {
      if (!this.isLoggedIn()) {
        window.location.href = 'index.html';
        return false;
      }
      return true;
    },

    changePassword: function(email, currentPassword, newPassword) {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const idx = users.findIndex(u => u.email === email && u.password === currentPassword);
      if (idx === -1) return { success: false, error: 'Senha atual incorreta.' };
      users[idx].password = newPassword;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return { success: true };
    }
  };
})();
