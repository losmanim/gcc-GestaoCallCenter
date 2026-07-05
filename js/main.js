(function() {
  'use strict';

  /* ===== DARK MODE ===== */
  const storedTheme = localStorage.getItem('gcc_theme');
  if (storedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  function setDarkIcon() {
    const btn = document.getElementById('darkToggle');
    if (!btn) return;
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = isDark ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
  }
  setDarkIcon();

  window.toggleDark = function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('gcc_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    setDarkIcon();
  };

  /* ===== KPI ===== */
  let kpiData = JSON.parse(localStorage.getItem('gcc_kpi') || '[]');

  function renderKpi() {
    const tbody = document.getElementById('kpiBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let totalCalls = 0, totalContacts = 0, totalProposals = 0, totalSales = 0;
    kpiData.forEach(function(r) {
      const conv = r.calls > 0 ? (r.sales / r.calls * 100).toFixed(1) : '—';
      const cRate = r.calls > 0 ? (r.contacts / r.calls * 100).toFixed(1) : '—';
      const pRate = r.contacts > 0 ? (r.proposals / r.contacts * 100).toFixed(1) : '—';
      const fRate = r.proposals > 0 ? (r.sales / r.proposals * 100).toFixed(1) : '—';
      totalCalls += r.calls;
      totalContacts += r.contacts;
      totalProposals += r.proposals;
      totalSales += r.sales;
      tbody.innerHTML += '<tr><td>' + r.day + '</td><td>' + r.calls + '</td><td>' + r.contacts + '</td><td>' + r.proposals + '</td><td>' + r.sales + '</td><td>' + conv + '%</td><td>' + cRate + '%</td><td>' + pRate + '%</td><td>' + fRate + '%</td><td class="small">' + (r.obj || '—') + '</td><td class="small">' + (r.improve || '—') + '</td></tr>';
    });
    document.getElementById('hCalls').textContent = totalCalls;
    document.getElementById('hSales').textContent = totalSales;
    document.getElementById('hRate').textContent = totalCalls > 0 ? (totalSales / totalCalls * 100).toFixed(1) + '%' : '0%';
    updateFunnel(totalCalls, totalContacts, totalProposals, totalSales);
  }

  function updateFunnel(calls, contacts, proposals, sales) {
    const el = document.getElementById('funnelSummary');
    if (!el) return;
    const cRate = calls > 0 ? (contacts / calls * 100).toFixed(1) : '—';
    const pRate = contacts > 0 ? (proposals / contacts * 100).toFixed(1) : '—';
    const fRate = proposals > 0 ? (sales / proposals * 100).toFixed(1) : '—';
    const or = calls > 0 ? (sales / calls * 100).toFixed(1) : '0';
    el.innerHTML = '<div class="funnel-box">'
      + '<span class="funnel-step"><span class="num">' + calls + '</span> chamadas</span>'
      + '<span class="funnel-arr"><i class="bi bi-arrow-right"></i></span>'
      + '<span class="funnel-step"><span class="num">' + contacts + '</span> contactos <span class="pct">' + cRate + '%</span></span>'
      + '<span class="funnel-arr"><i class="bi bi-arrow-right"></i></span>'
      + '<span class="funnel-step"><span class="num">' + proposals + '</span> propostas <span class="pct">' + pRate + '%</span></span>'
      + '<span class="funnel-arr"><i class="bi bi-arrow-right"></i></span>'
      + '<span class="funnel-step"><span class="num">' + sales + '</span> vendas <span class="pct">' + fRate + '%</span></span>'
      + '<span class="funnel-global">Global: <strong>' + or + '%</strong></span>'
      + '</div>';
  }

  window.addKpi = function() {
    const calls = parseInt(document.getElementById('kpiCalls').value) || 0;
    const contacts = parseInt(document.getElementById('kpiContacts').value) || 0;
    const proposals = parseInt(document.getElementById('kpiProposals').value) || 0;
    const sales = parseInt(document.getElementById('kpiSales').value) || 0;
    const obj = document.getElementById('kpiObj').value.trim();
    const improve = document.getElementById('kpiImprove').value.trim();
    if (!calls && !contacts && !proposals && !sales) { alert('Preenche pelo menos um valor.'); return; }
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const d = new Date();
    const dayLabel = days[d.getDay()] + ' ' + d.toLocaleDateString('pt-PT').slice(0,5);
    kpiData.push({ day: dayLabel, calls: calls, contacts: contacts, proposals: proposals, sales: sales, obj: obj, improve: improve });
    localStorage.setItem('gcc_kpi', JSON.stringify(kpiData));
    renderKpi();
    ['kpiCalls','kpiContacts','kpiProposals','kpiSales','kpiObj','kpiImprove'].forEach(function(id) {
      document.getElementById(id).value = '';
    });
    document.getElementById('kpiCalls').focus();
  };

  window.clearKpi = function() {
    if (!confirm('Limpar todos os registos?')) return;
    kpiData = [];
    localStorage.removeItem('gcc_kpi');
    renderKpi();
  };

  document.querySelector('.kpi-form').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKpi();
    }
  });

  renderKpi();

  /* ===== COPY SCRIPT ===== */
  window.copyScript = function() {
    const el = document.getElementById('scriptContent');
    const text = el.innerText || el.textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        const btn = document.querySelector('.copy-btn');
        btn.innerHTML = '<i class="bi bi-check"></i> Copiado!';
        setTimeout(function() { btn.innerHTML = '<i class="bi bi-clipboard"></i> Copiar'; }, 2000);
      }).catch(function() {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      const btn = document.querySelector('.copy-btn');
      btn.innerHTML = '<i class="bi bi-check"></i> Copiado!';
      setTimeout(function() { btn.innerHTML = '<i class="bi bi-clipboard"></i> Copiar'; }, 2000);
    } catch (e) {
      alert('Seleciona o texto manualmente e copia (Ctrl+C).');
    }
    document.body.removeChild(ta);
  }

  /* ===== CHECKLISTS ===== */
  window.resetPreChecklist = function() {
    if (!confirm('Resetar checklist pré-chamada?')) return;
    document.querySelectorAll('#checklistPre input[type="checkbox"]').forEach(function(cb) {
      cb.checked = false;
      cb.parentElement.classList.remove('checked');
      const key = 'fc_cl_' + cb.parentElement.textContent.trim().slice(0, 20).replace(/\s+/g, '_');
      localStorage.removeItem(key);
    });
  };


  window.saveCheck = function(el) {
    const key = 'fc_cl_' + el.parentElement.textContent.trim().slice(0, 20).replace(/\s+/g, '_');
    if (el.checked) {
      localStorage.setItem(key, 'true');
      el.parentElement.classList.add('checked');
    } else {
      localStorage.removeItem(key);
      el.parentElement.classList.remove('checked');
    }
  };

  function loadChecks() {
    document.querySelectorAll('#checklistPre input[type="checkbox"], #checklistPos input[type="checkbox"]').forEach(function(cb) {
      const key = 'fc_cl_' + cb.parentElement.textContent.trim().slice(0, 20).replace(/\s+/g, '_');
      if (localStorage.getItem(key) === 'true') {
        cb.checked = true;
        cb.parentElement.classList.add('checked');
      }
    });
  }

  window.resetPosChecklist = function() {
    if (!confirm('Resetar checklist pós-chamada?')) return;
    document.querySelectorAll('#checklistPos input[type="checkbox"]').forEach(function(cb) {
      cb.checked = false;
      cb.parentElement.classList.remove('checked');
      const key = 'fc_cl_' + cb.parentElement.textContent.trim().slice(0, 20).replace(/\s+/g, '_');
      localStorage.removeItem(key);
    });
    updatePosResult();
  };

  window.updatePosResult = function() {
    const checkboxes = document.querySelectorAll('#checklistPos input[type="checkbox"]');
    let checked = 0;
    checkboxes.forEach(function(c) { if (c.checked) checked++; });
    const el = document.getElementById('posResult');
    if (checked === 0) { el.textContent = ''; return; }
    if (checked >= 4) {
      el.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Chamada forte! ' + checked + '/5</span>';
    } else {
      el.innerHTML = '<span class="text-warning"><i class="bi bi-exclamation-circle-fill"></i> Chamada fraca — ' + checked + '/5. O que vais fazer diferente?</span>';
    }
  };

  loadChecks();
  window.updatePosResult();

  /* ===== TAB PERSISTENCE ===== */
  const savedTab = localStorage.getItem('gcc_tab');
  if (savedTab) {
    const target = document.querySelector('[data-bs-target="' + savedTab + '"]');
    if (target) {
      const tab = new bootstrap.Tab(target);
      tab.show();
    }
  }

  document.querySelectorAll('[data-bs-toggle="tab"]').forEach(function(el) {
    el.addEventListener('shown.bs.tab', function(e) {
      localStorage.setItem('gcc_tab', e.target.getAttribute('data-bs-target'));
    });
  });

  /* ===== MOBILE CLOSE ===== */
  window.closeMobile = function() {
    const offcanvas = document.getElementById('menuMobile');
    const off = bootstrap.Offcanvas.getInstance(offcanvas);
    if (off) off.hide();
  };

  /* ===== KEYBOARD SHORTCUTS ===== */
  document.addEventListener('keydown', function(e) {
    if (e.altKey) {
      const map = { '1': '#prancha', '2': '#script', '3': '#processo', '4': '#objetos', '5': '#ferramentas' };
      const target = map[e.key];
      if (target) {
        e.preventDefault();
        const btn = document.querySelector('[data-bs-target="' + target + '"]');
        if (btn) { const tab = new bootstrap.Tab(btn); tab.show(); }
      }
    }
  });

})();
