(async function() {
    'use strict';

    if (!window.Auth) return;
    if (!(await Auth.requireAuth())) return;

    var loadingEl = document.getElementById('loadingOverlay');

    const STORAGE_CLIENTES = 'gcc_g_clientes';
    const STORAGE_SERVICOS = 'gcc_g_servicos';
    const STORAGE_CONTRATOS = 'gcc_g_contratos';
    const APROVACOES_KEY = 'gcc_g_aprovacoes';
    const LEADS_KEY = 'gcc_g_leads';

    function getClientes() { return JSON.parse(localStorage.getItem(STORAGE_CLIENTES) || '[]'); }

    function getServicos() { return JSON.parse(localStorage.getItem(STORAGE_SERVICOS) || '[]'); }

    function getContratos() { return JSON.parse(localStorage.getItem(STORAGE_CONTRATOS) || '[]'); }

    function getAprovacoes() { return JSON.parse(localStorage.getItem(APROVACOES_KEY) || '[]'); }

    async function syncColecao(nome, dados, storageKey) {
      try {
        for (var i = 0; i < dados.length; i++) {
          var item = dados[i];
          var docData = {};
          for (var k in item) { if (k !== '_appwriteId' && k !== 'id') docData[k] = item[k]; }
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

    function saveClientes(v) { localStorage.setItem(STORAGE_CLIENTES, JSON.stringify(v)); syncColecao('clientes', v, STORAGE_CLIENTES); }

    function saveServicos(v) { localStorage.setItem(STORAGE_SERVICOS, JSON.stringify(v)); syncColecao('servicos', v, STORAGE_SERVICOS); }

    function saveContratos(v) { localStorage.setItem(STORAGE_CONTRATOS, JSON.stringify(v)); syncColecao('contratos', v, STORAGE_CONTRATOS); }

    function saveAprovacoes(v) { localStorage.setItem(APROVACOES_KEY, JSON.stringify(v)); syncColecao('aprovacoes', v, APROVACOES_KEY); }

    function newId(arr) { return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1; }

    function today() { return new Date().toISOString().slice(0, 10); }

    function fmtData(d) { if (!d) return '\u2014'; try { return new Date(d.includes('T') ? d : d + 'T12:00:00').toLocaleString('pt-PT'); } catch (e) { return d; } }

    function getLeads() {
        return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
    }

    function saveLeads(arr) {
        localStorage.setItem(LEADS_KEY, JSON.stringify(arr));
        syncColecao('leads', arr, LEADS_KEY);
    }

    async function carregarTudoAppwrite() {
      var colecoes = ['clientes', 'servicos', 'contratos', 'aprovacoes', 'leads'];
      var keys = {};
      keys['clientes'] = STORAGE_CLIENTES;
      keys['servicos'] = STORAGE_SERVICOS;
      keys['contratos'] = STORAGE_CONTRATOS;
      keys['aprovacoes'] = APROVACOES_KEY;
      keys['leads'] = LEADS_KEY;
      for (var n = 0; n < colecoes.length; n++) {
        var nome = colecoes[n];
        try {
          var res = await database.listDocuments(APPWRITE_DATABASE, nome);
          if (res.documents && res.documents.length) {
            var maxId = 0;
            var local = JSON.parse(localStorage.getItem(keys[nome]) || '[]');
            local.forEach(function(x) { if (x.id > maxId) maxId = x.id; });
            var items = res.documents.map(function(d) {
              var item = { _appwriteId: d.$id };
              for (var k in d) {
                if (!k.startsWith('$')) item[k] = d[k];
              }
              if (item.id === undefined || item.id === null) {
                maxId++;
                item.id = maxId;
              }
              if (item.id > maxId) maxId = item.id;
              return item;
            });
            var merged = items.slice();
            local.forEach(function(l) {
              var localMatch = merged.find(function(m) { return m._appwriteId && l._appwriteId && m._appwriteId === l._appwriteId; });
              if (localMatch) {
                localMatch.id = l.id;
              } else {
                merged.push(l);
              }
            });
            localStorage.setItem(keys[nome], JSON.stringify(merged));
          }
        } catch (e) {
          console.warn('Erro ao carregar ' + nome + ':', e);
        }
      }
    }

    function updateLeadsBadge() {
        var leads = getLeads();
        var naoLidos = leads.filter(function(l) { return !l.lido; }).length;
        var badge = document.getElementById('leadsBadge');
        if (!badge) return;
        if (naoLidos > 0) {
            badge.style.display = 'flex';
            badge.textContent = naoLidos;
        } else {
            badge.style.display = 'none';
        }
    }

    const user = await Auth.getUser();

    /* ===== SIDEBAR ===== */
    function initSidebar() {
        document.getElementById('userName').textContent = user.nome;
        document.getElementById('userEmail').textContent = user.email;
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                const page = this.dataset.page;
                document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
                const el = document.getElementById('page-' + page);
                if (el) el.style.display = 'block';
                if (page === 'dashboard') renderDashboard();
                else if (page === 'clientes') renderClientes();
                else if (page === 'servicos') renderServicos();
                else if (page === 'contratos') renderContratos();
                else if (page === 'leads') renderLeads();
                else if (page === 'relatorios') renderRelatorios();
                if (window.innerWidth < 768) document.querySelector('.sidebar-nav').scrollIntoView({ behavior: 'smooth' });
            });
        });
        document.getElementById('logoutBtn').addEventListener('click', async function() {
            await Auth.logout();
            window.location.href = 'index.html';
        });
    }

    /* ===== TOAST ===== */
    function toast(msg, tipo) {
        const container = document.getElementById('toastContainer');
        const el = document.createElement('div');
        el.className = 'toast ' + (tipo || 'info');
        el.innerHTML = '<span>' + msg + '</span><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>';
        container.appendChild(el);
        setTimeout(function() { if (el.parentElement) el.remove(); }, 4000);
    }

    /* ===== DASHBOARD ===== */
    function renderDashboard() {
        const clientes = getClientes();
        const servicos = getServicos();
        const contratos = getContratos();
        const totalCli = clientes.length;
        const cAtivos = contratos.filter(c => c.estado === 'Ativo');
        const ops = [...new Set(cAtivos.map(c => { const s = servicos.find(x => x.id === c.servicoId); return s ? s.operadora : null; }).filter(Boolean))];
        const receita = cAtivos.reduce(function(s, c) { return s + (parseFloat(c.valor) || 0); }, 0);
        const pendentes = contratos.filter(c => c.estado === 'Pendente').length;

        document.getElementById('kpiClientes').textContent = totalCli;
        document.getElementById('kpiContratos').textContent = cAtivos.length;
        document.getElementById('kpiReceita').innerHTML = receita.toFixed(2) + '&euro; <span class="small">/m&ecirc;s</span>';
        document.getElementById('kpiPendentes').textContent = pendentes;

        var leads = getLeads();
        var leadsNaoLidos = leads.filter(function(l) { return !l.lido; }).length;
        var kpiLeads = document.getElementById('kpiLeads');
        if (kpiLeads) {
            kpiLeads.textContent = leadsNaoLidos;
            kpiLeads.className = 'kpi-value' + (leadsNaoLidos > 0 ? ' amber' : '');
        }

        updateLeadsBadge();
        renderGraficoOperadoras();
        renderGraficoServicos();
        renderUltimosClientes();
    }

    function renderGraficoOperadoras() {
        const contratos = getContratos();
        const servicos = getServicos();
        const el = document.getElementById('graficoOperadoras');
        const count = {};
        contratos.filter(c => c.estado === 'Ativo').forEach(function(c) {
            const s = servicos.find(function(x) { return x.id === c.servicoId; });
            const op = s ? s.operadora : 'Outro';
            count[op] = (count[op] || 0) + 1;
        });
        const total = Object.values(count).reduce(function(a, b) { return a + b; }, 0);
        if (!Object.keys(count).length) { el.innerHTML = '<p class="small" style="color:var(--slate-400)">Nenhum contrato ativo</p>'; return; }
        el.innerHTML = Object.entries(count).map(function(e) {
            const op = e[0],
                qtd = e[1];
            const pct = total ? (qtd / total * 100).toFixed(0) : 0;
            return '<div class="bar-item"><span class="bar-label">' + op + '</span><div class="bar-track"><div class="bar-fill ' + op.toLowerCase() + '" style="width:' + pct + '%">' + qtd + ' (' + pct + '%)</div></div></div>';
        }).join('');
    }

    function renderGraficoServicos() {
        const contratos = getContratos();
        const servicos = getServicos();
        const el = document.getElementById('graficoServicos');
        const count = {};
        contratos.filter(c => c.estado === 'Ativo').forEach(function(c) {
            const s = servicos.find(function(x) { return x.id === c.servicoId; });
            const t = s ? (s.tipo || 'Outro') : 'Outro';
            count[t] = (count[t] || 0) + 1;
        });
        const total = Object.values(count).reduce(function(a, b) { return a + b; }, 0);
        if (!Object.keys(count).length) { el.innerHTML = '<p class="small" style="color:var(--slate-400)">Nenhum contrato ativo</p>'; return; }
        el.innerHTML = Object.entries(count).map(function(e) {
            const t = e[0],
                qtd = e[1];
            const pct = total ? (qtd / total * 100).toFixed(0) : 0;
            return '<div class="bar-item"><span class="bar-label">' + t + '</span><div class="bar-track"><div class="bar-fill accent" style="width:' + pct + '%">' + qtd + ' (' + pct + '%)</div></div></div>';
        }).join('');
    }

    function renderUltimosClientes() {
        const clientes = getClientes();
        const contratos = getContratos();
        const servicos = getServicos();
        const el = document.getElementById('tabelaUltimos');
        const ultimos = clientes.slice().reverse().slice(0, 5);
        if (!ultimos.length) { el.innerHTML = '<tr><td colspan="5" class="text-center" style="color:var(--slate-400);padding:2rem">Nenhum cliente registado</td></tr>'; return; }
        el.innerHTML = ultimos.map(function(c) {
            const ct = contratos.filter(function(x) { return x.clienteId === c.id; });
            const sNome = ct.length ? (servicos.find(function(x) { return x.id === ct[0].servicoId; }) ?.nome || '\u2014') : '\u2014';
            const valor = ct.length ? (parseFloat(ct[0].valor) || 0).toFixed(2) + '&euro;' : '\u2014';
            const est = ct.length ? ct[0].estado : 'Sem contrato';
            return '<tr><td class="td-bold">' + esc(c.nome) + '</td><td><span class="tag-op tag-' + c.operadora.toLowerCase() + '">' + c.operadora + '</span></td><td>' + esc(sNome) + '</td><td>' + valor + '</td><td><span class="badge badge-' + est.toLowerCase() + '">' + est + '</span></td></tr>';
        }).join('');
    }

    function esc(s) { return String(s).replace(/[&<>"']/g, function(m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } [m]; }); }

    /* ===== CLIENTES ===== */
    function renderClientes() {
        const clientes = getClientes();
        const f = (document.getElementById('filtroCli') ?.value || '').toLowerCase();
        const op = document.getElementById('filtroCliOp') ?.value || '';
        const est = document.getElementById('filtroCliEst') ?.value || '';
        const el = document.getElementById('tabelaClientes');
        const ct = document.getElementById('totalClientesCount');

        let lista = clientes.filter(function(c) {
            if (f && !c.nome.toLowerCase().includes(f) && !(c.email || '').toLowerCase().includes(f) && !(c.nif || '').includes(f)) return false;
            if (op && c.operadora !== op) return false;
            if (est && c.estado !== est) return false;
            return true;
        });

        if (!lista.length) {
            el.innerHTML = '<tr><td colspan="9" class="text-center" style="color:var(--slate-400);padding:2rem">Nenhum cliente encontrado</td></tr>';
            ct.textContent = '0 clientes';
            return;
        }
        el.innerHTML = lista.map(function(c) {
            var iban = c.iban ? esc(c.iban) : '\u2014';
            var cvp = c.cvp ? esc(c.cvp) : '\u2014';
            if (iban.length > 12) iban = '...' + iban.slice(-12);
            return '<tr><td class="td-bold">' + esc(c.nome) + '</td><td class="small">' + esc(c.email || '\u2014') + '</td><td class="small">' + esc(c.nif || '\u2014') + '</td><td class="small">' + esc(c.telefone || '\u2014') + '</td><td><span class="tag-op tag-' + c.operadora.toLowerCase() + '">' + c.operadora + '</span></td><td class="small" style="font-family:monospace;font-size:0.75rem">' + iban + '</td><td class="small" style="font-family:monospace;font-size:0.75rem">' + cvp + '</td><td><span class="badge badge-' + c.estado.toLowerCase() + '">' + c.estado + '</span></td><td><button class="btn btn-sm btn-secondary" onclick="editarCliente(' + c.id + ')">Editar</button> <button class="btn btn-sm btn-danger" onclick="eliminarCliente(' + c.id + ')">Eliminar</button></td></tr>';
        }).join('');
        ct.textContent = lista.length + ' cliente(s)';
    }
    window.renderClientes = renderClientes;

    window.abrirFormCliente = function(id) {
        const clientes = getClientes();
        document.getElementById('modalClienteTitulo').textContent = id ? 'Editar Cliente' : 'Novo Cliente';
        document.getElementById('cliId').value = id || '';
        if (id) {
            const c = clientes.find(function(x) { return x.id === id; });
            if (!c) return;
            document.getElementById('cliNome').value = c.nome || '';
            document.getElementById('cliEmail').value = c.email || '';
            document.getElementById('cliTel').value = c.telefone || '';
            document.getElementById('cliNif').value = c.nif || '';
            document.getElementById('cliOp').value = c.operadora || '';
            document.getElementById('cliIban').value = c.iban || '';
            document.getElementById('cliCvp').value = c.cvp || '';
            document.getElementById('cliMorada').value = c.morada || '';
            document.getElementById('cliCp').value = c.codPostal || '';
            document.getElementById('cliEst').value = c.estado || 'Ativo';
            document.getElementById('cliNotas').value = c.notas || '';
        } else {
            ['cliNome', 'cliEmail', 'cliTel', 'cliNif', 'cliIban', 'cliCvp', 'cliMorada', 'cliCp', 'cliNotas'].forEach(function(x) { document.getElementById(x).value = ''; });
            document.getElementById('cliOp').value = '';
            document.getElementById('cliEst').value = 'Ativo';
        }
        document.getElementById('modalCliente').classList.add('open');
    };

    window.editarCliente = function(id) { abrirFormCliente(id); };

    window.salvarCliente = function() {
        const id = document.getElementById('cliId').value;
        const d = {
            nome: document.getElementById('cliNome').value.trim(),
            email: document.getElementById('cliEmail').value.trim(),
            telefone: document.getElementById('cliTel').value.trim(),
            nif: document.getElementById('cliNif').value.trim(),
            iban: document.getElementById('cliIban').value.trim(),
            cvp: document.getElementById('cliCvp').value.trim(),
            operadora: document.getElementById('cliOp').value,
            morada: document.getElementById('cliMorada').value.trim(),
            codPostal: document.getElementById('cliCp').value.trim(),
            estado: document.getElementById('cliEst').value,
            notas: document.getElementById('cliNotas').value.trim(),
        };
        if (!d.nome || !d.operadora) { toast('Nome e operadora s\u00e3o obrigat\u00f3rios.', 'error'); return; }
        let clientes = getClientes();
        if (id) { const i = clientes.findIndex(function(c) { return c.id === parseInt(id); }); if (i >= 0) clientes[i] = { ...clientes[i], ...d }; } else {
            d.id = newId(clientes);
            clientes.push(d);
        }
        saveClientes(clientes);
        closeModal('modalCliente');
        renderClientes();
        renderDashboard();
        toast(id ? 'Cliente actualizado' : 'Cliente criado', 'success');
    };

    window.eliminarCliente = function(id) {
        if (!confirm('Eliminar este cliente?')) return;
        let clientes = getClientes();
        clientes = clientes.filter(function(c) { return c.id !== id; });
        saveClientes(clientes);
        renderClientes();
        renderDashboard();
        toast('Cliente eliminado', 'info');
    };

    /* ===== SERVI\u00c7OS ===== */
    function renderServicos() {
        const servicos = getServicos();
        const op = document.getElementById('filtroServOp') ?.value || '';
        const tp = document.getElementById('filtroServTp') ?.value || '';
        const el = document.getElementById('gradeServicos');
        let lista = servicos.filter(function(s) {
            if (op && s.operadora !== op) return false;
            if (tp && s.tipo !== tp) return false;
            return true;
        });
        if (!lista.length) { el.innerHTML = '<p style="color:var(--slate-400);text-align:center;padding:2rem;grid-column:1/-1">Nenhum servi\u00e7o encontrado</p>'; return; }
        el.innerHTML = lista.map(function(s) {
            return '<div class="servico-card"><div style="display:flex;justify-content:space-between;align-items:start"><div><span class="tag-op tag-' + s.operadora.toLowerCase() + '">' + s.operadora + '</span> <h4 style="display:inline;margin-left:0.25rem">' + esc(s.nome) + '</h4></div><div class="preco">' + parseFloat(s.preco).toFixed(2) + '&euro;</div></div><div class="detalhe"><i class="bi bi-tag-fill"></i> ' + (s.tipo || '\u2014') + '</div>' + (s.velocidade ? '<div class="detalhe"><i class="bi bi-speedometer2"></i> ' + esc(s.velocidade) + '</div>' : '') + (s.canais ? '<div class="detalhe"><i class="bi bi-tv"></i> ' + esc(s.canais) + ' canais</div>' : '') + (s.moveis ? '<div class="detalhe"><i class="bi bi-phone"></i> ' + esc(s.moveis) + '</div>' : '') + (s.descricao ? '<div class="detalhe" style="margin-top:0.25rem">' + esc(s.descricao) + '</div>' : '') + '<div class="acoes"><button class="btn btn-sm btn-secondary" onclick="editarServico(' + s.id + ')">Editar</button> <button class="btn btn-sm btn-danger" onclick="eliminarServico(' + s.id + ')">Eliminar</button></div></div>';
        }).join('');
    }
    window.renderServicos = renderServicos;

    window.abrirFormServico = function(id) {
        const servicos = getServicos();
        document.getElementById('modalServicoTitulo').textContent = id ? 'Editar Servi\u00e7o' : 'Novo Servi\u00e7o';
        document.getElementById('servId').value = id || '';
        if (id) {
            const s = servicos.find(function(x) { return x.id === id; });
            if (!s) return;
            document.getElementById('servNome').value = s.nome || '';
            document.getElementById('servOp').value = s.operadora || '';
            document.getElementById('servTipo').value = s.tipo || '';
            document.getElementById('servVel').value = s.velocidade || '';
            document.getElementById('servPreco').value = s.preco || '';
            document.getElementById('servCanais').value = s.canais || '';
            document.getElementById('servMoveis').value = s.moveis || '';
            document.getElementById('servDesc').value = s.descricao || '';
        } else {
            ['servNome', 'servVel', 'servPreco', 'servCanais', 'servMoveis', 'servDesc'].forEach(function(x) { document.getElementById(x).value = ''; });
            document.getElementById('servOp').value = '';
            document.getElementById('servTipo').value = '';
        }
        document.getElementById('modalServico').classList.add('open');
    };

    window.editarServico = function(id) { abrirFormServico(id); };

    window.salvarServico = function() {
        const id = document.getElementById('servId').value;
        const d = {
            nome: document.getElementById('servNome').value.trim(),
            operadora: document.getElementById('servOp').value,
            tipo: document.getElementById('servTipo').value,
            velocidade: document.getElementById('servVel').value.trim(),
            preco: parseFloat(document.getElementById('servPreco').value) || 0,
            canais: document.getElementById('servCanais').value.trim(),
            moveis: document.getElementById('servMoveis').value.trim(),
            descricao: document.getElementById('servDesc').value.trim(),
        };
        if (!d.nome || !d.operadora || !d.tipo) { toast('Nome, operadora e tipo s\u00e3o obrigat\u00f3rios.', 'error'); return; }
        let servicos = getServicos();
        if (id) { const i = servicos.findIndex(function(s) { return s.id === parseInt(id); }); if (i >= 0) servicos[i] = { ...servicos[i], ...d }; } else {
            d.id = newId(servicos);
            servicos.push(d);
        }
        saveServicos(servicos);
        closeModal('modalServico');
        renderServicos();
        renderDashboard();
        toast(id ? 'Servi\u00e7o actualizado' : 'Servi\u00e7o criado', 'success');
    };

    window.eliminarServico = function(id) {
        if (!confirm('Eliminar este servi\u00e7o?')) return;
        let servicos = getServicos();
        servicos = servicos.filter(function(s) { return s.id !== id; });
        saveServicos(servicos);
        renderServicos();
        renderDashboard();
        toast('Servi\u00e7o eliminado', 'info');
    };

    /* ===== CONTRATOS + EMAIL APPROVAL ===== */
    function renderContratos() {
        const clientes = getClientes();
        const servicos = getServicos();
        const contratos = getContratos();
        const aprovacoes = getAprovacoes();
        const f = (document.getElementById('filtroContr') ?.value || '').toLowerCase();
        const est = document.getElementById('filtroContrEst') ?.value || '';
        const el = document.getElementById('tabelaContratos');
        let lista = contratos.filter(function(c) {
            if (est && c.estado !== est) return false;
            if (f) { const cl = clientes.find(function(x) { return x.id === c.clienteId; }); if (!cl || !cl.nome.toLowerCase().includes(f)) return false; }
            return true;
        });
        if (!lista.length) { el.innerHTML = '<tr><td colspan="8" class="text-center" style="color:var(--slate-400);padding:2rem">Nenhum contrato encontrado</td></tr>'; return; }
        el.innerHTML = lista.map(function(c) {
            const cl = clientes.find(function(x) { return x.id === c.clienteId; });
            const s = servicos.find(function(x) { return x.id === c.servicoId; });
            const nm = cl ? esc(cl.nome) : '\u2014';
            const sn = s ? esc(s.nome) : '\u2014';
            const op = s ? s.operadora : '\u2014';
            const aprov = aprovacoes.find(function(a) { return a.contratoId === c.id; });
            let acoes = '<button class="btn btn-sm btn-secondary" onclick="editarContrato(' + c.id + ')">Editar</button> <button class="btn btn-sm btn-danger" onclick="eliminarContrato(' + c.id + ')">Eliminar</button>';
            if (c.estado === 'Pendente' && !aprov) {
                acoes += ' <button class="btn btn-sm btn-primary" onclick="enviarAprovacao(' + c.id + ')"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Enviar</button>';
            }
            if (aprov) {
                const stAprov = aprov.status === 'aprovado' ? 'badge-aprovado' : (aprov.status === 'rejeitado' ? 'badge-rejeitado' : 'badge-pendente');
                const stLabel = aprov.status === 'aprovado' ? 'Aprovado' : (aprov.status === 'rejeitado' ? 'Rejeitado' : 'A Aguardar');
                acoes += ' <span class="badge ' + stAprov + '">' + stLabel + '</span>';
            }
            return '<tr><td class="td-bold">' + nm + '</td><td>' + sn + '</td><td><span class="tag-op tag-' + op.toLowerCase() + '">' + op + '</span></td><td class="td-bold">' + (parseFloat(c.valor) || 0).toFixed(2) + '&euro;</td><td class="small">' + fmtData(c.dataInicio) + '</td><td class="small">' + fmtData(c.dataFim) + '</td><td><span class="badge badge-' + c.estado.toLowerCase() + '">' + c.estado + '</span></td><td style="white-space:nowrap">' + acoes + '</td></tr>';
        }).join('');
    }
    window.renderContratos = renderContratos;

    window.enviarAprovacao = async function(contratoId) {
        const contratos = getContratos();
        const clientes = getClientes();
        const servicos = getServicos();
        const c = contratos.find(function(x) { return x.id === contratoId; });
        if (!c) return;
        const cl = clientes.find(function(x) { return x.id === c.clienteId; });
        const s = servicos.find(function(x) { return x.id === c.servicoId; });
        if (!cl || !s) { toast('Cliente ou servi\u00e7o n\u00e3o encontrado', 'error'); return; }

        const token = 'aprov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        const link = window.location.origin + '/gestao/aprovacao.html?token=' + token;

        var aprovacoes = getAprovacoes();
        aprovacoes.push({ token: token, contratoId: c.id, status: 'pendente', dataEnvio: today(), clienteNome: cl.nome, servicoNome: s.nome, operadora: s.operadora, valor: c.valor });
        saveAprovacoes(aprovacoes);

        try {
            await emailjs.send(
                'service_mail_gcc',
                'template_yodp801',
                {
                    clienteNome: cl.nome,
                    servicoNome: s.nome,
                    operadora: s.operadora,
                    valor: c.valor,
                    link: link,
                    to_email: cl.email
                }
            );
            toast('Email enviado para ' + cl.nome, 'success');
        } catch (error) {
            console.error('Erro email:', error);
            toast('Erro ao enviar email: ' + (error.text || error.message || 'desconhecido'), 'error');
            var preview = document.getElementById('emailPreview');
            document.getElementById('emailPreviewCliente').textContent = cl.nome;
            document.getElementById('emailPreviewEmail').textContent = cl.email || '\u2014';
            document.getElementById('emailPreviewLink').textContent = link;
            document.getElementById('emailPreviewLink').href = link;
            preview.classList.remove('hidden');
            preview.style.display = 'flex';
        }

        renderContratos();
    };

    window.fecharPreviewEmail = function() {
        document.getElementById('emailPreview').classList.add('hidden');
    };

    function popularSelectContrato() {
        const clientes = getClientes();
        const servicos = getServicos();
        const selCli = document.getElementById('contrCli');
        const selServ = document.getElementById('contrServ');
        selCli.innerHTML = '<option value="">Selecionar cliente</option>' + clientes.map(function(c) { return '<option value="' + c.id + '">' + esc(c.nome) + ' (' + c.operadora + ')</option>'; }).join('');
        selServ.innerHTML = '<option value="">Selecionar servi\u00e7o</option>' + servicos.map(function(s) { return '<option value="' + s.id + '">' + esc(s.nome) + ' \u2014 ' + s.operadora + ' (' + parseFloat(s.preco).toFixed(2) + '&euro;)</option>'; }).join('');
    }

    window.abrirFormContrato = function(id) {
        const contratos = getContratos();
        popularSelectContrato();
        document.getElementById('modalContratoTitulo').textContent = id ? 'Editar Contrato' : 'Novo Contrato';
        document.getElementById('contrId').value = id || '';
        if (id) {
            const c = contratos.find(function(x) { return x.id === id; });
            if (!c) return;
            document.getElementById('contrCli').value = c.clienteId || '';
            document.getElementById('contrServ').value = c.servicoId || '';
            document.getElementById('contrInicio').value = c.dataInicio || '';
            document.getElementById('contrFim').value = c.dataFim || '';
            document.getElementById('contrValor').value = c.valor || '';
            document.getElementById('contrEst').value = c.estado || 'Ativo';
        } else {
            document.getElementById('contrCli').value = '';
            document.getElementById('contrServ').value = '';
            document.getElementById('contrInicio').value = today();
            document.getElementById('contrFim').value = '';
            document.getElementById('contrValor').value = '';
            document.getElementById('contrEst').value = 'Pendente';
        }
        document.getElementById('modalContrato').classList.add('open');
    };

    window.editarContrato = function(id) { abrirFormContrato(id); };

    window.salvarContrato = function() {
        const id = document.getElementById('contrId').value;
        const d = {
            clienteId: parseInt(document.getElementById('contrCli').value) || 0,
            servicoId: parseInt(document.getElementById('contrServ').value) || 0,
            dataInicio: document.getElementById('contrInicio').value,
            dataFim: document.getElementById('contrFim').value,
            valor: parseFloat(document.getElementById('contrValor').value) || 0,
            estado: document.getElementById('contrEst').value,
        };
        if (!d.clienteId || !d.servicoId) { toast('Seleciona um cliente e um servi\u00e7o.', 'error'); return; }
        let contratos = getContratos();
        if (id) { const i = contratos.findIndex(function(c) { return c.id === parseInt(id); }); if (i >= 0) contratos[i] = { ...contratos[i], ...d }; } else {
            d.id = newId(contratos);
            contratos.push(d);
        }
        saveContratos(contratos);
        closeModal('modalContrato');
        renderContratos();
        renderDashboard();
        toast(id ? 'Contrato actualizado' : 'Contrato criado', 'success');
    };

    window.eliminarContrato = function(id) {
        if (!confirm('Eliminar este contrato?')) return;
        let contratos = getContratos();
        contratos = contratos.filter(function(c) { return c.id !== id; });
        saveContratos(contratos);
        let aprovacoes = getAprovacoes();
        aprovacoes = aprovacoes.filter(function(a) { return a.contratoId !== id; });
        saveAprovacoes(aprovacoes);
        renderContratos();
        renderDashboard();
        toast('Contrato eliminado', 'info');
    };

    /* ===== RELAT\u00d3RIOS ===== */
    function renderRelatorios() {
        const clientes = getClientes();
        const servicos = getServicos();
        const contratos = getContratos();
        const topEl = document.getElementById('topClientes');
        const recEl = document.getElementById('receitaOperadora');

        const gastos = {};
        contratos.filter(function(c) { return c.estado === 'Ativo'; }).forEach(function(c) {
            const cl = clientes.find(function(x) { return x.id === c.clienteId; });
            if (cl) {
                gastos[cl.id] = gastos[cl.id] || { nome: cl.nome, total: 0, contratos: 0 };
                gastos[cl.id].total += parseFloat(c.valor) || 0;
                gastos[cl.id].contratos++;
            }
        });
        const rank = Object.values(gastos).sort(function(a, b) { return b.total - a.total; }).slice(0, 5);
        topEl.innerHTML = rank.length ? rank.map(function(r, i) { return '<div class="ranking-item"><div class="ranking-pos">' + (i + 1) + '</div><div class="ranking-info"><div class="ranking-nome">' + esc(r.nome) + '</div><div class="ranking-sub">' + r.contratos + ' contrato(s)</div></div><div class="ranking-valor">' + r.total.toFixed(2) + '&euro;</div></div>'; }).join('') : '<p class="small" style="color:var(--slate-400)">Nenhum contrato ativo</p>';

        const recOp = {};
        contratos.filter(function(c) { return c.estado === 'Ativo'; }).forEach(function(c) {
            const s = servicos.find(function(x) { return x.id === c.servicoId; });
            const op = s ? s.operadora : 'Outro';
            recOp[op] = (recOp[op] || 0) + (parseFloat(c.valor) || 0);
        });
        const totalRec = Object.values(recOp).reduce(function(a, b) { return a + b; }, 0);
        recEl.innerHTML = Object.keys(recOp).length ? Object.entries(recOp).map(function(e) {
            const op = e[0],
                val = e[1];
            const pct = totalRec ? (val / totalRec * 100).toFixed(0) : 0;
            return '<div class="bar-item"><span class="bar-label">' + op + '</span><div class="bar-track"><div class="bar-fill ' + op.toLowerCase() + '" style="width:' + pct + '%">' + val.toFixed(2) + '&euro; (' + pct + '%)</div></div></div>';
        }).join('') : '<p class="small" style="color:var(--slate-400)">Nenhuma receita</p>';
    }
    window.renderRelatorios = renderRelatorios;

    /* ===== EXPORT CSV ===== */
    window.exportarCSV = function(tipo) {
        let data, headers, filename;
        if (tipo === 'clientes') {
            data = getClientes();
            headers = ['ID', 'Nome', 'Email', 'Telefone', 'NIF', 'Operadora', 'Morada', 'CodPostal', 'Estado', 'Notas'];
            filename = 'clientes_gcc.csv';
        } else if (tipo === 'servicos') {
            data = getServicos();
            headers = ['ID', 'Nome', 'Operadora', 'Tipo', 'Velocidade', 'Preco', 'Canais', 'Moveis', 'Descricao'];
            filename = 'servicos_gcc.csv';
        } else {
            const clientes = getClientes();
            const servicos = getServicos();
            data = getContratos().map(function(c) {
                const cl = clientes.find(function(x) { return x.id === c.clienteId; });
                const s = servicos.find(function(x) { return x.id === c.servicoId; });
                return { id: c.id, cliente: cl ? cl.nome : '\u2014', servico: s ? s.nome : '\u2014', dataInicio: c.dataInicio, dataFim: c.dataFim, valor: c.valor, estado: c.estado };
            });
            headers = ['ID', 'Cliente', 'Servico', 'DataInicio', 'DataFim', 'Valor', 'Estado'];
            filename = 'contratos_gcc.csv';
        }
        const csv = [headers.join(';'), ...data.map(function(r) { return headers.map(function(h) { const v = r[h.toLowerCase()] !== undefined ? r[h.toLowerCase()] : (r[h] !== undefined ? r[h] : ''); return '"' + String(v).replace(/"/g, '""') + '"'; }).join(';'); })].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        toast('Ficheiro exportado: ' + filename, 'success');
    };

    /* ===== LEADS ===== */
    window.renderLeads = function() {
        var f = (document.getElementById('filtroLeads') ?.value || '').toLowerCase();
        var op = document.getElementById('filtroLeadsOp') ?.value || '';
        var filtroLido = document.getElementById('filtroLeadsLido') ?.value || '';
        var leads = getLeads();
        var el = document.getElementById('tabelaLeads');
        var ct = document.getElementById('totalLeadsCount');

        var lista = leads.filter(function(l) {
            if (f && !l.nome.toLowerCase().includes(f) && !l.email.toLowerCase().includes(f)) return false;
            if (op && l.operadora !== op) return false;
            if (filtroLido === 'nao' && l.lido) return false;
            if (filtroLido === 'sim' && !l.lido) return false;
            return true;
        });

        if (!lista.length) {
            el.innerHTML = '<tr><td colspan="8" class="text-center" style="color:var(--slate-400);padding:2rem">Nenhum lead encontrado</td></tr>';
            ct.textContent = '0 leads';
            return;
        }

        el.innerHTML = lista.map(function(l) {
            var rowClass = !l.lido ? ' class="lead-nao-lido"' : '';
            var dataStr = l.data ? new Date(l.data.includes('T') ? l.data : l.data + 'T12:00:00').toLocaleString('pt-PT') : '\u2014';
            var opTag = l.operadora && l.operadora !== 'N\u00e3o especificada' && l.operadora !== '\u2014' ?
                '<span class="tag-op tag-' + l.operadora.toLowerCase() + '">' + esc(l.operadora) + '</span>' :
                '<span style="color:var(--slate-400)">\u2014</span>';
            var lidoHtml = l.lido ?
                '<span style="color:var(--slate-400);font-size:0.75rem">Lido</span>' :
                '<button class="btn btn-sm btn-primary lead-btn-lido" onclick="marcarLeadLido(' + l.id + ')">Marcar lido</button>';
            return '<tr' + rowClass + '><td class="small">' + dataStr + '</td><td class="td-bold">' + esc(l.nome) + '</td><td class="small">' + esc(l.email) + '</td><td class="small">' + esc(l.telefone) + '</td><td>' + opTag + '</td><td class="small" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(l.mensagem || '\u2014') + '</td><td>' + lidoHtml + '</td><td><button class="btn btn-sm btn-secondary" onclick="adicionarLeadCliente(' + l.id + ')" title="Adicionar como cliente"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> Cliente</button></td></tr>';
        }).join('');
        ct.textContent = lista.length + ' lead(s)';

        updateLeadsBadge();
    };

    window.marcarLeadLido = function(id) {
        var leads = getLeads();
        var idx = leads.findIndex(function(l) { return l.id === id; });
        if (idx === -1) return;
        leads[idx].lido = true;
        saveLeads(leads);
        renderLeads();
        renderDashboard();
    };

    window.adicionarLeadCliente = function(id) {
        console.log('adicionarLeadCliente called with id:', id, 'type:', typeof id);
        var leads = getLeads();
        console.log('leads:', leads.map(function(l) { return { id: l.id, nome: l.nome, _appwriteId: l._appwriteId }; }));
        var lead = leads.find(function(l) { return l.id === id; });
        console.log('lead found:', lead ? lead.nome : 'NOT FOUND');
        if (!lead) return;
        let clientes = getClientes();
        var dados = {
            id: newId(clientes),
            nome: lead.nome,
            email: lead.email || '',
            telefone: lead.telefone || '',
            nif: '',
            operadora: (lead.operadora && lead.operadora !== 'N\u00e3o especificada') ? lead.operadora : '',
            morada: '',
            codPostal: '',
            estado: 'Ativo',
            notas: 'Lead do site. Msg: ' + (lead.mensagem || '\u2014'),
        };
        if (!dados.operadora) dados.operadora = 'NOS';
        clientes.push(dados);
        saveClientes(clientes);
        marcarLeadLido(id);
        toast('Lead adicionado como cliente: ' + dados.nome, 'success');
        renderClientes();
    };

    window.exportarLeadsCSV = function() {
        var leads = getLeads();
        var headers = ['ID', 'Data', 'Nome', 'Email', 'Telefone', 'Operadora', 'Mensagem', 'Lido'];
        var csv = [headers.join(';')];
        leads.forEach(function(l) {
            csv.push(headers.map(function(h) {
                var key = h.toLowerCase();
                var val = l[key] !== undefined ? l[key] : '';
                return '"' + String(val).replace(/"/g, '""') + '"';
            }).join(';'));
        });
        var blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'leads_gcc.csv';
        link.click();
        URL.revokeObjectURL(link.href);
        toast('Leads exportados', 'success');
    };

    /* ===== MODAL ===== */
    window.closeModal = function(id) { document.getElementById(id).classList.remove('open'); };
    window.fecharModal = function(e) { if (e.target === e.currentTarget) e.target.classList.remove('open'); };

    document.querySelectorAll('.modal-overlay').forEach(function(el) {
        el.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('open'); });
    });

    /* ===== ALTERAR SENHA ===== */
    window.abrirModalAlterarSenha = function() {
        document.getElementById('pwdAtual').value = '';
        document.getElementById('pwdNova').value = '';
        document.getElementById('pwdConfirmar').value = '';
        document.getElementById('modalAlterarSenha').classList.add('open');
    };

    window.salvarAlterarSenha = async function() {
        const atual = document.getElementById('pwdAtual').value;
        const nova = document.getElementById('pwdNova').value;
        const confirmar = document.getElementById('pwdConfirmar').value;
        if (!atual || !nova || !confirmar) { toast('Preenche todos os campos.', 'error'); return; }
        if (nova.length < 5) { toast('A nova senha deve ter pelo menos 5 caracteres.', 'error'); return; }
        if (nova !== confirmar) { toast('As senhas n\u00e3o coincidem.', 'error'); return; }
        const result = await Auth.changePassword(user.email, atual, nova);
        if (!result.success) { toast(result.error, 'error'); return; }
        closeModal('modalAlterarSenha');
        toast('Senha alterada com sucesso!', 'success');
    };

    /* ===== SEED DATA ===== */
    function seedData() {
        let servicos = getServicos();
        if (!servicos.length) {
            servicos.push({ id: 1, nome: '3P 200Mbps', operadora: 'NOS', tipo: '3P', velocidade: '200Mbps', preco: 29.99, canais: '140', moveis: '\u2014', descricao: 'TV + Internet + Voz fixa' }, { id: 2, nome: '4P 1Gbps', operadora: 'NOS', tipo: '4P', velocidade: '1Gbps', preco: 56.99, canais: '180', moveis: '2xIlimitados', descricao: 'TV + Internet + Voz + 2 Telem\u00f3veis ilimitados' }, { id: 3, nome: '4P 500Mbps', operadora: 'MEO', tipo: '4P', velocidade: '500Mbps', preco: 49.99, canais: '160', moveis: '2x20GB', descricao: 'TV + Internet + Voz + 2 Telem\u00f3veis' }, { id: 4, nome: 'Fibra 1Gbps', operadora: 'Vodafone', tipo: '4P', velocidade: '1Gbps', preco: 52.99, canais: '170', moveis: '2x30GB', descricao: 'TV + Internet + Voz Fibra + 2 Telem\u00f3veis' }, { id: 5, nome: '3P 100Mbps', operadora: 'MEO', tipo: '3P', velocidade: '100Mbps', preco: 24.99, canais: '120', moveis: '\u2014', descricao: 'TV + Internet + Voz fixa' }, { id: 6, nome: '4P 200Mbps', operadora: 'Vodafone', tipo: '4P', velocidade: '200Mbps', preco: 38.99, canais: '150', moveis: '2x15GB', descricao: 'TV + Internet + Voz + 2 Telem\u00f3veis' }, );
            saveServicos(servicos);
        }
        let clientes = getClientes();
        if (!clientes.length) {
            clientes.push({ id: 1, nome: 'Ana Silva', email: 'ana.silva@email.com', telefone: '912345678', nif: '123456789', operadora: 'NOS', morada: 'Rua das Flores, 12', codPostal: '1000-001', estado: 'Ativo', notas: 'Cliente satisfeita' }, { id: 2, nome: 'Carlos Pereira', email: 'carlos.pereira@email.com', telefone: '923456789', nif: '234567890', operadora: 'MEO', morada: 'Av. da Liberdade, 45', codPostal: '1050-001', estado: 'Ativo', notas: 'Interessado em upgrade' }, { id: 3, nome: 'Mariana Costa', email: 'mariana.costa@email.com', telefone: '934567890', nif: '345678901', operadora: 'Vodafone', morada: 'Rua do Ouro, 78', codPostal: '1100-001', estado: 'Ativo', notas: 'Nova cliente' }, { id: 4, nome: 'Jo\u00e3o Rodrigues', email: 'joao.rodrigues@email.com', telefone: '945678901', nif: '456789012', operadora: 'MEO', morada: 'Rua da Escola, 23', codPostal: '1200-001', estado: 'Suspenso', notas: 'Pagamento pendente' }, { id: 5, nome: 'Sofia Martins', email: 'sofia.martins@email.com', telefone: '956789012', nif: '567890123', operadora: 'NOS', morada: 'Travessa do Sol, 5', codPostal: '1300-001', estado: 'Ativo', notas: 'Cliente TV Cines' }, { id: 6, nome: 'Rui Santos', email: 'rui.santos@email.com', telefone: '967890123', nif: '678901234', operadora: 'Vodafone', morada: 'Rua Nova, 10', codPostal: '1400-001', estado: 'Ativo', notas: '' }, );
            saveClientes(clientes);
        }
        let contratos = getContratos();
        if (!contratos.length) {
            contratos.push({ id: 1, clienteId: 1, servicoId: 2, dataInicio: '2025-01-15', dataFim: '2027-01-15', valor: 56.99, estado: 'Ativo' }, { id: 2, clienteId: 2, servicoId: 3, dataInicio: '2024-06-01', dataFim: '2026-06-01', valor: 49.99, estado: 'Ativo' }, { id: 3, clienteId: 3, servicoId: 4, dataInicio: '2026-03-10', dataFim: '2028-03-10', valor: 52.99, estado: 'Ativo' }, { id: 4, clienteId: 4, servicoId: 5, dataInicio: '2024-09-20', dataFim: '2026-09-20', valor: 24.99, estado: 'Suspenso' }, { id: 5, clienteId: 5, servicoId: 1, dataInicio: '2025-11-01', dataFim: '2027-11-01', valor: 29.99, estado: 'Ativo' }, { id: 6, clienteId: 6, servicoId: 6, dataInicio: '2026-04-01', dataFim: '2028-04-01', valor: 38.99, estado: 'Pendente' }, );
            saveContratos(contratos);
        }
    }

    /* ===== AUTO-PROCESS APPROVALS ===== */
    function processarAprovacoes() {
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
    }

    /* ===== INIT ===== */
    await carregarTudoAppwrite();
    processarAprovacoes();
    seedData();
    if (loadingEl) loadingEl.classList.add('hidden');
    initSidebar();
    renderDashboard();
    renderLeads();
    updateLeadsBadge();

})();
