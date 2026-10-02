(() => {
  'use strict';
  const data = window.LAB_DATA;
  const main = document.querySelector('#main');
  if (!data) { main.innerHTML = '<p class="noscript">Project data is missing. Run npm run build to restore the portfolio.</p>'; return; }
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const icons = {
    terminal: '<path d="m5 7 5 5-5 5m8 0h6"/>',
    network: '<rect x="7" y="3" width="10" height="6" rx="1"/><path d="M12 9v5M4 14h16M4 14v3m16-3v3"/><rect x="1" y="17" width="6" height="4" rx="1"/><rect x="17" y="17" width="6" height="4" rx="1"/>',
    directory: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="10" cy="9" r="2"/><path d="M7 16c0-4 6-4 6 0m3-8h1m-1 4h1m-1 4h1"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6m-3-3v6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    file: '<path d="M14 2H5v20h14V7Zm0 0v5h5M8 12h8m-8 4h6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    moon: '<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>'
  };
  const icon = (name, extra = '') => `<svg class="icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.file}</svg>`;
  let filter = 'All projects';
  let query = '';
  let currentProject;
  let currentFile;
  let currentOutput = 0;
  let currentTab = 'code';
  let wrapped = false;
  let toastTimer;

  function notify(message) {
    const toast = document.querySelector('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
  }
  async function copy(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const field = document.createElement('textarea');
        field.value = text;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.append(field);
        field.select();
        if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
        field.remove();
      }
      notify('Copied to clipboard');
    } catch { notify('Copy unavailable. Select the code to copy it manually.'); }
  }
  function highlight(text, filename) {
    if (!/\.(js|json)$/.test(filename)) return escape(text);
    return text.split('\n').map(line => {
      const pattern = /(\/\/.*$|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b(?:const|let|function|return|if|else|try|catch|finally|throw|new|async|await|for|of|true|false|null|undefined|module|require)\b|\b\d+(?:\.\d+)?\b)/g;
      let html = '', end = 0;
      for (const match of line.matchAll(pattern)) {
        html += escape(line.slice(end, match.index));
        const token = match[0];
        const type = token.startsWith('//') ? 'comment' : /^["'`]/.test(token) ? 'string' : /^\d/.test(token) ? 'number' : 'keyword';
        html += `<span class="syntax-${type}">${escape(token)}</span>`;
        end = match.index + token.length;
      }
      return html + escape(line.slice(end));
    }).join('\n');
  }
  function art(project) {
    const graphics = {
      terminal: '<span class="art-prompt">&gt;_</span><span class="art-chip">hello, world.</span><span class="art-cursor"></span>',
      network: '<span class="art-node top">request</span><span class="art-connector"></span><span class="art-server">{ http }</span><span class="art-node bottom">200 OK</span>',
      directory: '<div class="art-record"><span class="art-avatar">A</span><span>Aman <small>BCA · #001</small></span><b>↗</b></div><div class="art-record"><span class="art-avatar">N</span><span>Nandani <small>BCA · #002</small></span><b>↗</b></div>',
      search: '<div class="art-query">'+ icon('search') +'<span>?course=BCA</span></div><div class="art-bars"><i></i><i></i><i></i><i></i><i></i></div><span class="art-small">filter → sort → results</span>',
      clock: '<div class="art-orbit">'+icon('clock')+'</div><span class="art-stage stage-one">placed</span><span class="art-stage stage-two">preparing</span><span class="art-stage stage-three">delivered ✓</span>',
      file: '<div class="art-note"><span class="art-note-heading">notes.txt <span>↗</span></span><i></i><i></i><i></i><span class="art-note-foot">one thought at a time.</span></div>'
    };
    return `<div class="project-art art-${project.icon} accent-${project.accent}" aria-hidden="true"><span class="art-lab">EXPERIMENT ${project.number}</span>${graphics[project.icon]}<span class="art-number">${project.number}</span></div>`;
  }
  function renderHome() {
    currentProject = undefined;
    document.title = 'Node.js Lab — A collection by Ayush';
    document.body.classList.remove('detail-page');
    main.innerHTML = `<section class="hero container">
      <div class="hero-copy"><div class="eyebrow"><span class="status-dot"></span>A BACKEND LEARNING JOURNAL</div><h1>Small projects.<br><span>Big possibilities.</span></h1><p>Six experiments in Node.js. From the first hello to<br class="desktop-break"> the things that happen behind the scenes.</p><a class="primary-button" href="#projects">Explore the projects ${icon('arrow')}</a><div class="hero-signature"><span class="avatar">at</span><span>A collection by <strong>Ayush Ram Tripathi</strong><small>BCA VII · DSVV · 2026</small></span></div></div>
      <div class="hero-visual"><div class="terminal-sticker">IT STARTS WITH A HELLO ↘</div><div class="hero-terminal"><div class="terminal-bar"><div class="window-dots"><i></i><i></i><i></i></div><span>the beginning / app.js</span><span class="terminal-js">JS</span></div><div class="hero-editor"><span class="editor-line"><b>01</b><span class="syntax-comment">// a few lines from Lab 01</span></span><span class="editor-line"><b>02</b><span><span class="syntax-keyword">const</span> studentName = <span class="syntax-string">'Ayush Ram Tripathi'</span>;</span></span><span class="editor-line"><b>03</b><span>console.log(<span class="syntax-string">'Welcome to Node.js'</span>);</span></span><span class="editor-line"><b>04</b><span>console.log(<span class="syntax-string">'Name:'</span>, studentName);</span></span></div><div class="hero-terminal-output"><span class="terminal-label">TERMINAL</span><p><span class="terminal-dollar">$</span> node app.js</p><p>Welcome to Node.js<br>Name: Ayush Ram Tripathi<span class="typing-cursor"></span></p></div><div class="terminal-bottom"><span><span class="status-dot"></span>JavaScript</span><span>UTF-8 <span>↗</span></span></div></div><div class="hero-caption"><span class="caption-line"></span>Read the code. See what happens.</div><span class="hero-spark" aria-hidden="true">✳</span></div>
    </section>
    <div class="collection-strip"><div class="container"><span><strong>06</strong> complete projects</span><span><strong>01 → 06</strong> a little more each time</span><span>${icon('terminal')} Pure Node.js. No frameworks.</span><span class="strip-end">OPEN SOURCE & OPEN TO EXPLORE ↗</span></div></div>
    <section class="projects-section container" id="projects"><div class="section-heading"><div><div class="eyebrow">THE COLLECTION</div><h2>One lab at a time<span>.</span></h2></div><label class="search-box">${icon('search')}<input id="project-search" type="search" placeholder="Find a project…" aria-label="Find a project" value="${escape(query)}"><kbd>/</kbd></label></div><div class="filter-row"><div class="filters" role="group" aria-label="Filter projects">${['All projects', 'Fundamentals', 'APIs', 'Async', 'Files'].map(name => `<button class="filter-button ${filter === name ? 'active' : ''}" data-filter="${name}" aria-pressed="${filter === name}">${name}${name === 'All projects' ? '<span>6</span>' : ''}</button>`).join('')}</div><span class="results-count" id="results-count"></span></div><div class="project-grid" id="project-grid"></div></section>
    <section class="closing-section container"><div class="closing-bracket" aria-hidden="true">{ }</div><div><div class="eyebrow">BUILT TO BE EXPLORED</div><h2>Behind every output,<br>there’s a little understanding.</h2><p>Open a project. Follow the source. Connect the dots.</p></div><a class="text-link" href="https://github.com/ram-ayush/nodejs-lab" target="_blank" rel="noreferrer">Explore the repository ↗</a></section>`;
    updateGrid();
    document.querySelector('#project-search').addEventListener('input', event => { query = event.target.value; updateGrid(); });
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', item === button); });
      updateGrid();
    }));
  }
  function updateGrid() {
    const matches = data.projects.filter(project => (filter === 'All projects' || project.category === filter) && `${project.title} ${project.description} ${project.tags.join(' ')} ${project.category}`.toLowerCase().includes(query.toLowerCase().trim()));
    document.querySelector('#results-count').textContent = `${matches.length} project${matches.length === 1 ? '' : 's'}`;
    document.querySelector('#project-grid').innerHTML = matches.length ? matches.map(project => `<a class="project-card" href="#project/${project.id}" aria-label="Open ${project.title}">${art(project)}<div class="card-content"><div class="card-topline"><span>LAB ${project.number}</span><span class="card-status"><i></i>Complete</span></div><h3>${project.title}</h3><p>${project.description}</p><div class="card-tags">${project.tags.map(tag => `<span>${tag}</span>`).join('')}</div><div class="card-bottom"><span>${project.files.filter(file => file.name.endsWith('.js')).length} source file${project.files.filter(file => file.name.endsWith('.js')).length === 1 ? '' : 's'}</span><span>Explore project ${icon('arrow')}</span></div></div></a>`).join('') : '<div class="empty-state">'+icon('search')+'<h3>No projects found.</h3><p>Try another name or clear the filters.</p><button id="clear-search" class="primary-button">Show all projects</button></div>';
    document.querySelector('#clear-search')?.addEventListener('click', () => { query = ''; filter = 'All projects'; renderHome(); document.querySelector('#projects').scrollIntoView(); });
  }
  function renderProject(project, reset = true) {
    currentProject = project;
    if (reset) { currentFile = project.entry; currentOutput = 0; currentTab = 'code'; }
    document.title = `${project.title} — Node.js Lab`;
    document.body.classList.add('detail-page');
    main.innerHTML = `<div class="container detail-container"><a class="back-link" href="#projects">← Back to the collection</a><section class="project-heading"><div><div class="eyebrow"><span class="lab-pill accent-${project.accent}">LAB ${project.number}</span>${project.category.toUpperCase()}<span class="detail-complete">${icon('check')} COMPLETE</span></div><h1>${project.title}</h1><p>${project.description}</p><div class="card-tags">${project.tags.map(tag => `<span>${tag}</span>`).join('')}</div></div><div class="detail-icon accent-${project.accent}">${icon(project.icon)}<span>${project.number}</span></div></section><div class="detail-tabs" role="tablist" aria-label="Project views">${[['code', 'Source code'], ['output', 'Output'], ['screenshots', 'Screenshots'], ['guide', 'Lab guide']].map(([id, title]) => `<button role="tab" id="tab-${id}" data-tab="${id}" aria-selected="${id === currentTab}" aria-controls="project-panel" tabindex="${id === currentTab ? 0 : -1}" class="${id === currentTab ? 'active' : ''}">${title}${id === 'code' ? `<span>${project.files.length}</span>` : ''}</button>`).join('')}</div><section id="project-panel" role="tabpanel" aria-labelledby="tab-${currentTab}"></section><div class="detail-bottom"><span>PART OF THE NODE.JS LAB COLLECTION</span>${data.projects.filter(item => Number(item.number) === Number(project.number) + 1).map(next => `<a href="#project/${next.id}">Up next: ${next.title} ${icon('arrow')}</a>`).join('') || '<a href="#projects">Back to all projects '+icon('arrow')+'</a>'}</div></div>`;
    document.querySelectorAll('[data-tab]').forEach(button => {
      button.addEventListener('click', () => selectTab(button.dataset.tab));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const buttons = [...document.querySelectorAll('[data-tab]')];
        const index = buttons.indexOf(button);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus(); selectTab(buttons[next].dataset.tab);
      });
    });
    renderPanel();
  }
  function selectTab(tab) {
    currentTab = tab;
    document.querySelectorAll('[data-tab]').forEach(button => {
      const active = button.dataset.tab === tab;
      button.classList.toggle('active', active); button.setAttribute('aria-selected', active); button.tabIndex = active ? 0 : -1;
    });
    const panel = document.querySelector('#project-panel');
    panel.setAttribute('aria-labelledby', `tab-${tab}`);
    renderPanel();
  }
  function renderPanel() {
    const project = currentProject;
    const panel = document.querySelector('#project-panel');
    if (currentTab === 'code') {
      const file = project.files.find(item => item.name === currentFile) || project.files[0];
      const lines = highlight(file.source, file.name).trimEnd().split('\n');
      panel.innerHTML = `<div class="source-layout"><aside class="file-sidebar"><div class="sidebar-heading">PROJECT FILES <span>${project.files.length}</span></div><div class="file-list" role="group" aria-label="Source files">${project.files.map(item => `<button data-file="${escape(item.name)}" class="${item.name === file.name ? 'selected' : ''}" aria-pressed="${item.name === file.name}"><span class="file-type ${item.name.endsWith('.js') ? 'js-type' : ''}">${item.name.endsWith('.js') ? 'JS' : item.name.endsWith('.json') ? '{}' : '≡'}</span><span>${escape(item.name)}</span></button>`).join('')}</div><div class="sidebar-note"><span class="status-dot"></span>Actual project source<br><small>Ready to read and run.</small></div></aside><div class="code-window"><div class="code-toolbar"><span>${icon('file')}<strong>${escape(file.name)}</strong></span><div><button id="wrap-code" aria-pressed="${wrapped}">Wrap</button><a href="projects/${project.folder}/${encodeURIComponent(file.name)}" download aria-label="Download ${escape(file.name)}">Download ↓</a><button id="copy-code">${icon('copy')} Copy</button></div></div><div class="code-scroller ${wrapped ? 'wrapped' : ''}" tabindex="0" aria-label="${escape(file.name)} source code"><pre class="code-lines"><code>${lines.map((line, i) => `<span class="code-row"><span class="line-number" aria-hidden="true">${i + 1}</span><span class="line-text">${line || ' '}</span></span>`).join('')}</code></pre></div><div class="code-status"><span>${file.name.endsWith('.js') ? 'JavaScript' : file.name.endsWith('.json') ? 'JSON' : 'Plain text'}<span class="status-separator">·</span>${lines.length} lines</span><span>UTF-8</span></div></div></div><div class="run-strip"><div>${icon('terminal')}<span>Run it yourself</span></div><code>cd projects/${project.folder}<br>${escape(project.command)}</code><button id="copy-command" aria-label="Copy run commands">${icon('copy')}</button></div>`;
      document.querySelectorAll('[data-file]').forEach(button => button.addEventListener('click', () => { currentFile = button.dataset.file; renderPanel(); document.querySelector(`[data-file="${CSS.escape(currentFile)}"]`).focus(); }));
      document.querySelector('#copy-code').addEventListener('click', () => copy(file.source));
      document.querySelector('#wrap-code').addEventListener('click', event => { wrapped = !wrapped; document.querySelector('.code-scroller').classList.toggle('wrapped', wrapped); event.currentTarget.setAttribute('aria-pressed', wrapped); });
      document.querySelector('#copy-command').addEventListener('click', () => copy(`cd projects/${project.folder}\n${project.command}`));
    } else if (currentTab === 'output') {
      const output = project.outputs[currentOutput];
      panel.innerHTML = `<div class="output-layout"><aside class="output-sidebar"><div class="sidebar-heading">EXECUTION RECORDS</div>${project.outputs.map((item, i) => `<button data-output="${i}" class="${i === currentOutput ? 'selected' : ''}" aria-pressed="${i === currentOutput}"><span class="output-index">${String(i + 1).padStart(2, '0')}</span>${escape(item.title)}</button>`).join('')}<div class="evidence-note">${icon('check')}<strong>Real runs. Real responses.</strong><p>Captured from these programs on ${new Date(data.capturedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} using Node ${escape(data.nodeVersion)}.</p></div></aside><div class="output-terminal"><div class="terminal-bar"><div class="window-dots"><i></i><i></i><i></i></div><span>${escape(output.title)}</span><button id="copy-output" aria-label="Copy recorded output">${icon('copy')}</button></div><div class="output-content"><div class="output-command"><span>$</span><pre>${escape(output.command)}</pre></div><pre class="actual-output">${escape(output.output)}</pre></div><div class="code-status"><span><span class="status-dot"></span>Recorded execution</span><span>Output ${currentOutput + 1} of ${project.outputs.length}</span></div></div></div>`;
      document.querySelectorAll('[data-output]').forEach(button => button.addEventListener('click', () => { currentOutput = Number(button.dataset.output); renderPanel(); document.querySelector(`[data-output="${currentOutput}"]`).focus(); }));
      document.querySelector('#copy-output').addEventListener('click', () => copy(output.output));
    } else if (currentTab === 'screenshots') {
      panel.innerHTML = `<div class="panel-intro"><h2>The evidence, in pictures.</h2><p>Source and execution captures. Open any image to inspect it or save a copy.</p></div><div class="screenshot-grid">${project.captures.map(name => {
        const title = name.replace('.png', '').replaceAll('-', ' ');
        return `<figure class="screenshot-card"><button data-screenshot="${escape(name)}" aria-label="Open ${title} screenshot"><img src="projects/${project.folder}/${name}" alt="${project.title}: ${title} screenshot" loading="lazy"><span class="image-expand">↗</span></button><figcaption><span>${title}</span><a href="projects/${project.folder}/${name}" download aria-label="Download ${title} screenshot">↓</a></figcaption></figure>`;
      }).join('')}</div>`;
      document.querySelectorAll('[data-screenshot]').forEach(button => button.addEventListener('click', () => {
        const name = button.dataset.screenshot;
        const url = `projects/${project.folder}/${name}`;
        document.querySelector('#dialog-image').src = url;
        document.querySelector('#dialog-image').alt = `${project.title}: ${name}`;
        document.querySelector('#dialog-caption').textContent = `${project.title} / ${name}`;
        document.querySelector('#dialog-download').href = url;
        document.querySelector('#image-dialog').showModal();
      }));
    } else {
      panel.innerHTML = `<div class="guide-layout"><div class="task-guide"><div class="panel-intro"><h2>From assignment to understanding.</h2><p>Every required task and bonus challenge, with its implementation.</p></div>${project.tasks.map(([number, title, description]) => `<article class="task-item"><span class="task-number">${number}</span><div><h3>${title}</h3><p>${description}</p></div><span class="task-check" aria-label="Completed">${icon('check')}</span></article>`).join('')}</div><aside class="guide-sidebar"><span class="eyebrow">TRY IT LOCALLY</span><h3>A terminal is all you need.</h3><p>From the repository folder:</p><pre>cd projects/${project.folder}\n${escape(project.command)}</pre><p>${['http-server', 'student-directory', 'advanced-search'].includes(project.id) ? 'Open localhost:3000. Stop this server before starting another lab, or set PORT to use a different port.' : 'Run each program directly with Node.js. Read README.md for the full command sequence.'}</p><a class="guide-link" href="projects/${project.folder}/README.md" download>Download project README ↓</a><a class="guide-link" href="tasks/${encodeURIComponent(project.pdf)}" target="_blank" rel="noreferrer">Open original assignment ↗</a><div class="guide-profile">AYUSH RAM TRIPATHI<br><span>Scholar #23145004 · BCA VII<br>CS403NOD · DSVV</span></div></aside></div>`;
    }
  }
  function route() {
    const hash = location.hash;
    const match = hash.match(/^#project\/([^/]+)$/);
    if (match) {
      const project = data.projects.find(item => item.id === match[1]);
      if (project) { renderProject(project); window.scrollTo(0, 0); return; }
      renderHome(); notify('That project could not be found.'); return;
    }
    if (!document.querySelector('#project-grid')) renderHome();
    if (hash === '#projects') document.querySelector('#projects').scrollIntoView({ behavior: 'instant' });
    else window.scrollTo(0, 0);
  }
  function updateTheme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const button = document.querySelector('#theme-toggle');
    button.innerHTML = icon(dark ? 'sun' : 'moon');
    button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  }
  let savedTheme;
  try { savedTheme = localStorage.getItem('node-lab-theme'); } catch { /* file origins may restrict storage */ }
  updateTheme(savedTheme === 'dark');
  document.querySelector('#theme-toggle').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    updateTheme(dark);
    try { localStorage.setItem('node-lab-theme', dark ? 'dark' : 'light'); } catch { /* theme still works */ }
  });
  document.querySelector('#close-dialog').addEventListener('click', () => document.querySelector('#image-dialog').close());
  document.querySelector('#image-dialog').addEventListener('click', event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && document.querySelector('#project-search')) { event.preventDefault(); document.querySelector('#project-search').focus(); }
  });
  window.addEventListener('hashchange', route);
  route();
})();
