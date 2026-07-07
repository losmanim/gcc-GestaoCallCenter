(function() {
    'use strict';

    const STORAGE_CLIENTES = 'gcc_g_clientes';
    const STORAGE_SERVICOS = 'gcc_g_servicos';
    const STORAGE_CONTRATOS = 'gcc_g_contratos';
    const APROVACOES_KEY = 'gcc_g_aprovacoes';
    const LEADS_KEY = 'gcc_g_leads';

    window.getClientes = function() { return JSON.parse(localStorage.getItem(STORAGE_CLIENTES) || '[]'); };
    window.getServicos = function() { return JSON.parse(localStorage.getItem(STORAGE_SERVICOS) || '[]'); };
    window.getContratos = function() { return JSON.parse(localStorage.getItem(STORAGE_CONTRATOS) || '[]'); };
    window.getAprovacoes = function() { return JSON.parse(localStorage.getItem(APROVACOES_KEY) || '[]'); };
    window.getLeads = function() { return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]'); };

    function dataParaTimestamp(v) {
      if (typeof v !== 'string') return v;
      var m = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/);
      if (!m) return v;
      return Math.floor(new Date(v + (v.includes('T') ? '' : 'T12:00:00')).getTime() / 1000);
    }

    async function syncColecao(nome, dados, storageKey) {
      try {
        for (var i = 0; i < dados.length; i++) {
          var item = dados[i];
          var docData = {};
          for (var k in item) {
            if (k !== '_appwriteId' && k !== 'id') {
              docData[k] = (k.startsWith('data')) ? dataParaTimestamp(item[k]) : item[k];
            }
          }
          var permissions = [];
          if (nome === 'aprovacoes') {
            permissions = [
              Appwrite.Permission.read(Appwrite.Role.any()),
              Appwrite.Permission.update(Appwrite.Role.any()),
            ];
          }
          if (item._appwriteId) {
            await database.updateDocument(APPWRITE_DATABASE, nome, item._appwriteId, docData);
          } else {
            var doc = await database.createDocument(APPWRITE_DATABASE, nome, 'unique()', docData, permissions);
            dados[i]._appwriteId = doc.$id;
          }
        }
        localStorage.setItem(storageKey, JSON.stringify(dados));
      } catch (e) {
        console.warn('Erro sync ' + nome + ':', e);
      }
    }

    window.saveClientes = function(v) { localStorage.setItem(STORAGE_CLIENTES, JSON.stringify(v)); syncColecao('clientes', v, STORAGE_CLIENTES); };
    window.saveServicos = function(v) { localStorage.setItem(STORAGE_SERVICOS, JSON.stringify(v)); syncColecao('servicos', v, STORAGE_SERVICOS); };
    window.saveContratos = function(v) { localStorage.setItem(STORAGE_CONTRATOS, JSON.stringify(v)); syncColecao('contratos', v, STORAGE_CONTRATOS); };
    window.saveAprovacoes = function(v) { localStorage.setItem(APROVACOES_KEY, JSON.stringify(v)); syncColecao('aprovacoes', v, APROVACOES_KEY); };
    window.saveLeads = function(arr) { localStorage.setItem(LEADS_KEY, JSON.stringify(arr)); syncColecao('leads', arr, LEADS_KEY); };

    window.newId = function(arr) { return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1; };
    window.today = function() { return new Date().toISOString().slice(0, 10); };
    window.fmtData = function(d) {
      if (!d) return '\u2014';
      try {
        var dt = typeof d === 'number' ? new Date(d * 1000) : new Date(d.includes('T') ? d : d + 'T12:00:00');
        return dt.toLocaleString('pt-PT');
      } catch (e) { return d; }
    };
    window.esc = function(s) { return String(s).replace(/[&<>"']/g, function(m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } [m]; }); };

    window.carregarTudoAppwrite = async function() {
      var colecoes = ['clientes', 'servicos', 'contratos', 'aprovacoes', 'leads'];
      var keys = {};
      keys['clientes'] = STORAGE_CLIENTES;
      keys['servicos'] = STORAGE_SERVICOS;
      keys['contratos'] = STORAGE_CONTRATOS;
      keys['aprovacoes'] = APROVACOES_KEY;
      keys['leads'] = LEADS_KEY;
      for (var n = 0; n < colecoes.length; n++) {
        var nome = colecoes[n];
        var local = JSON.parse(localStorage.getItem(keys[nome]) || '[]');
        if (local.length > 0) continue;
        try {
          var res = await database.listDocuments(APPWRITE_DATABASE, nome);
          if (res.documents && res.documents.length) {
            var maxId = 0;
            local.forEach(function(x) { if (x.id > maxId) maxId = x.id; });
            var items = res.documents.map(function(d) {
              var item = { _appwriteId: d.$id };
              for (var k in d) {
                if (!k.startsWith('$') && k !== 'token' && k !== 'leads') {
                  if (k.startsWith('data') && typeof d[k] === 'number') {
                    var dt = new Date(d[k] * 1000);
                    item[k] = dt.toISOString().slice(0, 10);
                  } else {
                    item[k] = d[k];
                  }
                }
              }
              if (item.id === undefined || item.id === null) {
                maxId++;
                item.id = maxId;
              }
              if (item.id > maxId) maxId = item.id;
              return item;
            });
            localStorage.setItem(keys[nome], JSON.stringify(items));
          }
        } catch (e) {
          console.warn('Erro ao carregar ' + nome + ':', e);
        }
      }
    };

    window.processarAprovacoes = function() {
      var aprovacoes = getAprovacoes();
      var contratos = getContratos();
      var alterado = false;
      aprovacoes.forEach(function(a) {
        if (a.status === 'pendente') return;
        var c = contratos.find(function(x) { return x.id === a.contratoId; });
        if (c && c.estado !== 'Ativo' && c.estado !== 'Cancelado') {
          c.estado = a.status === 'aprovado' ? 'Ativo' : 'Cancelado';
          alterado = true;
        }
      });
      if (alterado) {
        localStorage.setItem(STORAGE_CONTRATOS, JSON.stringify(contratos));
        syncColecao('contratos', contratos, STORAGE_CONTRATOS);
      }
    };

    window.limparDuplicados = async function() {
        var clientes = getClientes();
        var contratos = getContratos();
        var vistos = {};
        var remover = [];
        var mapa = {};

        clientes.forEach(function(c) {
            var nome = c.nome.trim().toLowerCase();
            if (vistos[nome] !== undefined) {
                remover.push(c.id);
                mapa[c.id] = vistos[nome];
            } else {
                vistos[nome] = c.id;
            }
        });

        if (!remover.length) { console.log('Nenhum duplicado encontrado.'); return; }

        contratos.forEach(function(c) {
            if (mapa[c.clienteId]) {
                c.clienteId = mapa[c.clienteId];
            }
        });

        clientes = clientes.filter(function(c) { return remover.indexOf(c.id) === -1; });

        for (var i = 0; i < remover.length; i++) {
            var dupe = getClientes().find(function(c) { return c.id === remover[i]; });
            if (dupe && dupe._appwriteId) {
                try { await database.deleteDocument(APPWRITE_DATABASE, 'clientes', dupe._appwriteId); }
                catch (e) { console.warn('Erro ao apagar duplicado do Appwrite:', e); }
            }
        }

        saveClientes(clientes);
        saveContratos(contratos);
        renderClientes();
        renderDashboard();
    };

})();
