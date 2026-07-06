(function() {
  'use strict';

  var USERS_KEY = 'gcc_g_users';
  var SESSION_KEY = 'gcc_g_session';

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  var users = getUsers();
  if (!users.length) {
    users.push(
      { email: 'admin@gcc.pt', password: 'admin123', nome: 'Admin', tipo: 'admin' },
      { email: 'gestor@gcc.pt', password: 'gestor123', nome: 'Gestor', tipo: 'gestor' }
    );
    saveUsers(users);
  }

  window.Auth = {
    login: function(email, password) {
      var users = getUsers();
      var user = users.find(function(u) { return u.email === email && u.password === password; });
      if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, nome: user.nome, tipo: user.tipo }));
        return { success: true };
      }
      return { success: false, error: 'Email ou senha inv\u00e1lidos.' };
    },

    logout: function() {
      sessionStorage.removeItem(SESSION_KEY);
    },

    getUser: function() {
      try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY));
      } catch(e) {
        return null;
      }
    },

    isLoggedIn: function() {
      return !!Auth.getUser();
    },

    requireAuth: function() {
      if (!Auth.isLoggedIn()) {
        window.location.href = 'index.html';
        return false;
      }
      return true;
    },

    changePassword: function(email, oldPassword, newPassword) {
      var users = getUsers();
      var idx = users.findIndex(function(u) { return u.email === email && u.password === oldPassword; });
      if (idx === -1) return { success: false, error: 'Senha atual incorreta.' };
      users[idx].password = newPassword;
      saveUsers(users);
      return { success: true };
    }
  };
})();
