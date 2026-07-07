(function() {
    'use strict';

    window.initSidebar = function() {
        document.getElementById('userName').textContent = window.currentUser.nome;
        document.getElementById('userEmail').textContent = window.currentUser.email;
        document.querySelectorAll('.sidebar-link').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.sidebar-link').forEach(function(l) { l.classList.remove('active'); });
                this.classList.add('active');
                var page = this.dataset.page;
                document.querySelectorAll('.page-content').forEach(function(p) { p.style.display = 'none'; });
                var el = document.getElementById('page-' + page);
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
    };

    window.toast = function(msg, tipo) {
        var container = document.getElementById('toastContainer');
        var el = document.createElement('div');
        el.className = 'toast ' + (tipo || 'info');
        el.innerHTML = '<span>' + msg + '</span><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>';
        container.appendChild(el);
        setTimeout(function() { if (el.parentElement) el.remove(); }, 4000);
    };

    window.closeModal = function(id) { document.getElementById(id).classList.remove('open'); };

    window.fecharModal = function(e) { if (e.target === e.currentTarget) e.target.classList.remove('open'); };

    document.querySelectorAll('.modal-overlay').forEach(function(el) {
        el.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('open'); });
    });

    window.abrirModalAlterarSenha = function() {
        document.getElementById('pwdAtual').value = '';
        document.getElementById('pwdNova').value = '';
        document.getElementById('pwdConfirmar').value = '';
        document.getElementById('modalAlterarSenha').classList.add('open');
    };

    window.salvarAlterarSenha = async function() {
        var atual = document.getElementById('pwdAtual').value;
        var nova = document.getElementById('pwdNova').value;
        var confirmar = document.getElementById('pwdConfirmar').value;
        if (!atual || !nova || !confirmar) { toast('Preenche todos os campos.', 'error'); return; }
        if (nova.length < 5) { toast('A nova senha deve ter pelo menos 5 caracteres.', 'error'); return; }
        if (nova !== confirmar) { toast('As senhas n\u00e3o coincidem.', 'error'); return; }
        var result = await Auth.changePassword(window.currentUser.email, atual, nova);
        if (!result.success) { toast(result.error, 'error'); return; }
        closeModal('modalAlterarSenha');
        toast('Senha alterada com sucesso!', 'success');
    };

    window.seedData = function() {
        var servicos = getServicos();
        if (!servicos.length) {
            servicos.push({ id: 1, nome: '3P 200Mbps', operadora: 'NOS', tipo: '3P', velocidade: '200Mbps', preco: 29.99, canais: '140', moveis: '\u2014', descricao: 'TV + Internet + Voz fixa' }, { id: 2, nome: '4P 1Gbps', operadora: 'NOS', tipo: '4P', velocidade: '1Gbps', preco: 56.99, canais: '180', moveis: '2xIlimitados', descricao: 'TV + Internet + Voz + 2 Telem\u00f3veis ilimitados' }, { id: 3, nome: '4P 500Mbps', operadora: 'MEO', tipo: '4P', velocidade: '500Mbps', preco: 49.99, canais: '160', moveis: '2x20GB', descricao: 'TV + Internet + Voz + 2 Telem\u00f3veis' }, { id: 4, nome: 'Fibra 1Gbps', operadora: 'Vodafone', tipo: '4P', velocidade: '1Gbps', preco: 52.99, canais: '170', moveis: '2x30GB', descricao: 'TV + Internet + Voz Fibra + 2 Telem\u00f3veis' }, { id: 5, nome: '3P 100Mbps', operadora: 'MEO', tipo: '3P', velocidade: '100Mbps', preco: 24.99, canais: '120', moveis: '\u2014', descricao: 'TV + Internet + Voz fixa' }, { id: 6, nome: '4P 200Mbps', operadora: 'Vodafone', tipo: '4P', velocidade: '200Mbps', preco: 38.99, canais: '150', moveis: '2x15GB', descricao: 'TV + Internet + Voz + 2 Telem\u00f3veis' });
            saveServicos(servicos);
        }
        var clientes = getClientes();
        if (!clientes.length) {
            clientes.push({ id: 1, nome: 'Ana Silva', email: 'ana.silva@email.com', telefone: '912345678', nif: '123456789', operadora: 'NOS', morada: 'Rua das Flores, 12', codPostal: '1000-001', estado: 'Ativo', notas: 'Cliente satisfeita' }, { id: 2, nome: 'Carlos Pereira', email: 'carlos.pereira@email.com', telefone: '923456789', nif: '234567890', operadora: 'MEO', morada: 'Av. da Liberdade, 45', codPostal: '1050-001', estado: 'Ativo', notas: 'Interessado em upgrade' }, { id: 3, nome: 'Mariana Costa', email: 'mariana.costa@email.com', telefone: '934567890', nif: '345678901', operadora: 'Vodafone', morada: 'Rua do Ouro, 78', codPostal: '1100-001', estado: 'Ativo', notas: 'Nova cliente' }, { id: 4, nome: 'Jo\u00e3o Rodrigues', email: 'joao.rodrigues@email.com', telefone: '945678901', nif: '456789012', operadora: 'MEO', morada: 'Rua da Escola, 23', codPostal: '1200-001', estado: 'Suspenso', notas: 'Pagamento pendente' }, { id: 5, nome: 'Sofia Martins', email: 'sofia.martins@email.com', telefone: '956789012', nif: '567890123', operadora: 'NOS', morada: 'Travessa do Sol, 5', codPostal: '1300-001', estado: 'Ativo', notas: 'Cliente TV Cines' }, { id: 6, nome: 'Rui Santos', email: 'rui.santos@email.com', telefone: '967890123', nif: '678901234', operadora: 'Vodafone', morada: 'Rua Nova, 10', codPostal: '1400-001', estado: 'Ativo', notas: '' });
            saveClientes(clientes);
        }
        var contratos = getContratos();
        if (!contratos.length) {
            contratos.push({ id: 1, clienteId: 1, servicoId: 2, dataInicio: '2025-01-15', dataFim: '2027-01-15', valor: 56.99, estado: 'Ativo' }, { id: 2, clienteId: 2, servicoId: 3, dataInicio: '2024-06-01', dataFim: '2026-06-01', valor: 49.99, estado: 'Ativo' }, { id: 3, clienteId: 3, servicoId: 4, dataInicio: '2026-03-10', dataFim: '2028-03-10', valor: 52.99, estado: 'Ativo' }, { id: 4, clienteId: 4, servicoId: 5, dataInicio: '2024-09-20', dataFim: '2026-09-20', valor: 24.99, estado: 'Suspenso' }, { id: 5, clienteId: 5, servicoId: 1, dataInicio: '2025-11-01', dataFim: '2027-11-01', valor: 29.99, estado: 'Ativo' }, { id: 6, clienteId: 6, servicoId: 6, dataInicio: '2026-04-01', dataFim: '2028-04-01', valor: 38.99, estado: 'Pendente' });
            saveContratos(contratos);
        }
    };

    window.updateLeadsBadge = function() {
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
    };

})();
