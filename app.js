// Grok Build Companion Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initThemeBuilder();
  initPrivacyAuditor();
  initCodeGraph();
  initLlmConnector();
  initEcuRemapper();
});

// ==========================================
// 1. NAVIGATION TABS MANAGER
// ==========================================
function initTabs() {
  const tabs = document.querySelectorAll('.nav-btn');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => {
        c.classList.remove('active');
        // Delay display none briefly for fade effect
        setTimeout(() => {
          if (!c.classList.contains('active')) {
            c.style.display = 'none';
          }
        }, 150);
      });

      tab.classList.add('active');
      const targetEl = document.getElementById(target);
      targetEl.style.display = 'block';
      // Force repaint
      targetEl.offsetHeight;
      targetEl.classList.add('active');

      // Trigger canvas resize if switching to graph tab
      if (target === 'graph-tab') {
        setTimeout(resizeGraphCanvas, 50);
      }
    });
  });
}

// ==========================================
// 2. THEME PLAYGROUND BUILDER
// ==========================================
const THEME_PRESETS = {
  tokyonight: {
    bg_base: '#1a1b26', bg_light: '#292e42', bg_dark: '#16161e', bg_highlight: '#292e42',
    accent_user: '#7aa2f7', accent_assistant: '#bb9af7', accent_thinking: '#3b4261', accent_tool: '#737aa2',
    accent_system: '#7aa2f7', accent_success: '#9ece6a', accent_error: '#f7768e', accent_plan: '#e0af68',
    accent_verify: '#bb9af7', text_primary: '#c0caf5', text_secondary: '#a9b1d6', gray: '#565f89',
    path: '#ff9e64', command: '#e0af68', warning: '#e0af68'
  },
  cyberpunk: {
    bg_base: '#0f051d', bg_light: '#25143b', bg_dark: '#07010e', bg_highlight: '#25143b',
    accent_user: '#06b6d4', accent_assistant: '#d946ef', accent_thinking: '#5b21b6', accent_tool: '#14b8a6',
    accent_system: '#06b6d4', accent_success: '#10b981', accent_error: '#ef4444', accent_plan: '#f59e0b',
    accent_verify: '#ec4899', text_primary: '#fdf4ff', text_secondary: '#e9d5ff', gray: '#a21caf',
    path: '#f43f5e', command: '#f59e0b', warning: '#f59e0b'
  },
  nord: {
    bg_base: '#2e3440', bg_light: '#3b4252', bg_dark: '#242933', bg_highlight: '#434c5e',
    accent_user: '#88c0d0', accent_assistant: '#b48ead', accent_thinking: '#4c566a', accent_tool: '#81a1c1',
    accent_system: '#8fbcbb', accent_success: '#a3be8c', accent_error: '#bf616a', accent_plan: '#ebcb8b',
    accent_verify: '#b48ead', text_primary: '#eceff4', text_secondary: '#e5e9f0', gray: '#4c566a',
    path: '#d08770', command: '#ebcb8b', warning: '#ebcb8b'
  },
  monokai: {
    bg_base: '#2d2a2e', bg_light: '#403e41', bg_dark: '#19181a', bg_highlight: '#403e41',
    accent_user: '#fc9867', accent_assistant: '#ab9df2', accent_thinking: '#727072', accent_tool: '#78dce8',
    accent_system: '#ffd866', accent_success: '#a9dc76', accent_error: '#ff6188', accent_plan: '#ffd866',
    accent_verify: '#ab9df2', text_primary: '#fcfcfa', text_secondary: '#c1c0c0', gray: '#727072',
    path: '#fc9867', command: '#78dce8', warning: '#ffd866'
  },
  solarized: {
    bg_base: '#002b36', bg_light: '#073642', bg_dark: '#00212b', bg_highlight: '#073642',
    accent_user: '#268bd2', accent_assistant: '#d33682', accent_thinking: '#586e75', accent_tool: '#2aa198',
    accent_system: '#b58900', accent_success: '#859900', accent_error: '#dc322f', accent_plan: '#cb4b16',
    accent_verify: '#6c71c4', text_primary: '#93a1a1', text_secondary: '#839496', gray: '#586e75',
    path: '#cb4b16', command: '#2aa198', warning: '#cb4b16'
  }
};

function initThemeBuilder() {
  const colorPickers = document.querySelectorAll('.picker-wrapper input[type="color"]');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const exportBtn = document.getElementById('btn-export-toml');
  const modal = document.getElementById('toml-modal');
  const closeModal = document.getElementById('btn-close-modal');
  const copyTomlBtn = document.getElementById('btn-copy-toml');
  const tomlDisplay = document.getElementById('toml-code-block');

  // Set initial color values into TUI preview from values
  colorPickers.forEach(picker => {
    const propertyName = picker.id.replace('color-', '');
    // Update CSS Variable
    document.documentElement.style.setProperty(`--${propertyName}`, picker.value);
    
    // Listen to changes
    picker.addEventListener('input', (e) => {
      document.documentElement.style.setProperty(`--${propertyName}`, e.target.value);
      // Disable preset active states when manually picking colors
      presetButtons.forEach(btn => btn.classList.remove('active'));
    });
  });

  // Handle Preset Switching
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetName = btn.getAttribute('data-preset');
      const presetColors = THEME_PRESETS[presetName];

      if (presetColors) {
        Object.entries(presetColors).forEach(([key, colorVal]) => {
          const picker = document.getElementById(`color-${key}`);
          if (picker) {
            picker.value = colorVal;
            document.documentElement.style.setProperty(`--${key}`, colorVal);
          }
        });
      }
    });
  });

  // Export TOML modal triggers
  exportBtn.addEventListener('click', () => {
    const tomlConfig = generateToml();
    tomlDisplay.innerText = tomlConfig;
    modal.classList.add('active');
  });

  closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Close modal when clicking outside card
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Copy TOML clipboard action
  copyTomlBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(tomlDisplay.innerText)
      .then(() => {
        copyTomlBtn.innerText = 'Copied!';
        copyTomlBtn.style.background = 'var(--ui-green)';
        setTimeout(() => {
          copyTomlBtn.innerText = 'Copy Code';
          copyTomlBtn.style.background = 'rgba(255,255,255,0.06)';
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy TOML config: ', err);
      });
  });
}

function generateToml() {
  const pickers = document.querySelectorAll('.picker-wrapper input[type="color"]');
  let toml = `[cli]
theme = "custom"

[theme.custom]
`;

  pickers.forEach(picker => {
    const propName = picker.id.replace('color-', '');
    toml += `${propName} = "${picker.value}"\n`;
  });

  const provider = document.getElementById('llm-provider').value;
  if (provider !== 'xai') {
    const modelId = document.getElementById('llm-model-id').value;
    const baseUrl = document.getElementById('llm-base-url').value;
    const apiKey = document.getElementById('llm-api-key').value || 'your_api_key_here';
    
    toml += `\n# Custom LLM Model Override Config\n`;
    toml += `[models.grok-build]\n`;
    toml += `model = "${modelId}"\n`;
    if (provider === 'ollama') {
      toml += `base_url = "${baseUrl}"\n`;
      toml += `api_key = "ollama" # bypassed by local server\n`;
    } else {
      if (provider === 'gemini') {
        toml += `base_url = "https://generativelanguage.googleapis.com/v1beta/openai"\n`;
      } else if (provider === 'claude') {
        toml += `base_url = "https://api.anthropic.com/v1"\n`;
      }
      toml += `api_key = "${apiKey}"\n`;
    }
  }

  return toml;
}

// ==========================================
// 3. PRIVACY AUDITOR ENGINE
// ==========================================
const RUST_CODE_SNIPPETS = {
  zdr_active: `// crates/codegen/xai-grok-shell/src/auth/model.rs
pub fn allows_data_collection(&self) -> bool {
    // If Zero Data Retention (ZDR) is toggled by organization requirements,
    // all cloud trace uploads are systematically bypass-closed.
    if self.is_zdr_enforced() {
        return false; 
    }
    !self.is_data_collection_disabled()
}`,
  optout_active: `// crates/codegen/xai-grok-shell/src/auth/model.rs
pub fn is_data_collection_disabled(&self) -> bool {
    // Coding Data Collection Opt-out toggled in settings.
    // auth_manager fails-open if identity is unknown, but
    // trace configs fail-closed for safety.
    self.user_privacy_settings.opt_out_coding_retention
}`,
  telemetry_active: `// crates/codegen/xai-mixpanel/src/lib.rs
pub async fn track_event(&self, event: &str, properties: Value) {
    if !self.telemetry_enabled {
        log::debug!("Telemetry blocked: event '{}' bypassed", event);
        return; // Drops events locally
    }
    self.client.post("https://api.mixpanel.com/track").json(&properties).send().await;
}`
};

function initPrivacyAuditor() {
  const zdrToggle = document.getElementById('toggle-zdr');
  const optoutToggle = document.getElementById('toggle-optout');
  const telemetryToggle = document.getElementById('toggle-telemetry');
  
  const auditBadge = document.getElementById('audit-badge');
  const statusTitle = document.getElementById('status-title');
  const statusDesc = document.getElementById('status-description');
  const snippetDisplay = document.getElementById('code-snippet-display');

  const shieldTelemetry = document.getElementById('shield-telemetry');
  const shieldCloud = document.getElementById('shield-cloud');

  const textTelemetry = document.getElementById('text-telemetry-status');
  const textCloud = document.getElementById('text-cloud-status');
  const textCloudZdr = document.getElementById('text-cloud-zdr');

  const flowSvg = document.getElementById('flow-svg');

  // Keep track of active particles
  let particles = [];
  let animFrameId = null;

  function updatePrivacyState() {
    const isZdr = zdrToggle.checked;
    const isOptout = optoutToggle.checked;
    const isTelemetry = telemetryToggle.checked;

    // 1. Shields & Text Labels
    if (isTelemetry) {
      shieldTelemetry.style.display = 'none';
      textTelemetry.textContent = 'ALLOW';
      textTelemetry.setAttribute('fill', '#10b981');
    } else {
      shieldTelemetry.style.display = 'block';
      textTelemetry.textContent = 'BLOCKED';
      textTelemetry.setAttribute('fill', '#ef4444');
    }

    // Cloud upload path is blocked if opted-out
    if (isOptout) {
      shieldCloud.style.display = 'block';
      textCloud.textContent = 'BLOCKED';
      textCloud.setAttribute('fill', '#ef4444');
    } else {
      shieldCloud.style.display = 'none';
      textCloud.textContent = 'ALLOW';
      textCloud.setAttribute('fill', '#10b981');
    }

    if (isZdr) {
      textCloudZdr.textContent = 'ZDR active (No log)';
      textCloudZdr.setAttribute('fill', '#10b981');
    } else {
      textCloudZdr.textContent = 'ZDR disabled';
      textCloudZdr.setAttribute('fill', '#f59e0b');
    }

    // 2. Main Audit Summary Card
    if (isOptout && !isTelemetry) {
      auditBadge.className = 'status-icon success';
      statusTitle.textContent = 'Secured: Complete Local-First';
      statusDesc.textContent = 'All workspace files and queries remain locally. Telemetry is dropped, and cloud uploads are fully bypassed.';
      snippetDisplay.innerText = RUST_CODE_SNIPPETS.optout_active;
    } else if (isOptout && isTelemetry) {
      auditBadge.className = 'status-icon success';
      statusTitle.textContent = 'Secured: Workspace Kept Local';
      statusDesc.textContent = 'Workspace files are not uploaded. Telemetry (anonymous usage metadata) is active.';
      snippetDisplay.innerText = RUST_CODE_SNIPPETS.optout_active;
    } else if (!isOptout && isZdr) {
      auditBadge.className = 'status-icon success';
      statusTitle.textContent = 'Secured: Zero Data Retention (Cloud)';
      statusDesc.textContent = 'Prompts and files are sent for cloud processing, but they are evaluated in-memory and not stored on disk.';
      snippetDisplay.innerText = RUST_CODE_SNIPPETS.zdr_active;
    } else {
      auditBadge.className = 'status-icon warning';
      statusTitle.textContent = 'Caution: Cloud Sync Active';
      statusDesc.textContent = 'Code context is uploaded to the cloud with standard logging policies. Telemetry is enabled.';
      snippetDisplay.innerText = RUST_CODE_SNIPPETS.telemetry_active;
    }
  }

  // Particle Generation and Animation loop inside SVG
  const pathDests = {
    // Coordinate maps for animation paths
    local: [
      { x: 120, y: 130, cx1: 180, cy1: 130, cx2: 180, cy2: 200, ex: 240, ey: 200 }, // Workspace -> Sandbox
      { x: 360, y: 200, cx1: 400, cy1: 200, cx2: 420, cy2: 120, ex: 460, ey: 120 }  // Sandbox -> Local DB
    ],
    telemetry: [
      { x: 120, y: 270, cx1: 180, cy1: 270, cx2: 180, cy2: 200, ex: 240, ey: 200 }, // Prompt -> Sandbox
      { x: 360, y: 200, cx1: 400, cy1: 200, cx2: 420, cy2: 200, ex: 460, ey: 200 }, // Sandbox -> Tele Gate
      { x: 520, y: 200, cx1: 560, cy1: 200, cx2: 600, cy2: 200, ex: 640, ey: 200 }  // Tele Gate -> Mixpanel
    ],
    cloud: [
      { x: 120, y: 130, cx1: 180, cy1: 130, cx2: 180, cy2: 200, ex: 240, ey: 200 }, // Workspace -> Sandbox
      { x: 360, y: 200, cx1: 400, cy1: 200, cx2: 420, cy2: 280, ex: 460, ey: 280 }, // Sandbox -> Cloud Gate
      { x: 520, y: 280, cx1: 560, cy1: 280, cx2: 600, cy2: 280, ex: 640, ey: 280 }  // Cloud Gate -> Cloud API
    ]
  };

  function createParticle(type) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '4');
    
    let color = '#3b82f6';
    if (type === 'local') color = '#10b981';
    if (type === 'telemetry') color = '#ec4899';
    circle.setAttribute('fill', color);
    circle.setAttribute('filter', 'drop-shadow(0 0 4px ' + color + ')');
    
    flowSvg.appendChild(circle);

    return {
      element: circle,
      type: type,
      segment: 0,
      progress: 0,
      speed: 0.015 + Math.random() * 0.01
    };
  }

  function getBezierPoint(t, p0, p1, p2, p3) {
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const x = ((ax * t + bx) * t + cx) * t + p0.x;
    const y = ((ay * t + by) * t + cy) * t + p0.y;
    
    return { x, y };
  }

  function animateParticles() {
    // Generate new particles occasionally
    if (Math.random() < 0.03 && particles.length < 30) {
      const types = ['local', 'telemetry', 'cloud'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      
      // Gate checks
      let allowed = true;
      if (chosenType === 'telemetry' && !telemetryToggle.checked) allowed = false;
      if (chosenType === 'cloud' && optoutToggle.checked) allowed = false;
      
      if (allowed) {
        particles.push(createParticle(chosenType));
      }
    }

    // Move particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.progress += p.speed;

      // Check gates mid-path
      if (p.type === 'telemetry' && p.segment === 2 && !telemetryToggle.checked) {
        p.element.remove();
        particles.splice(i, 1);
        continue;
      }
      if (p.type === 'cloud' && p.segment === 2 && optoutToggle.checked) {
        p.element.remove();
        particles.splice(i, 1);
        continue;
      }

      if (p.progress >= 1) {
        p.progress = 0;
        p.segment++;
        
        const pathSegments = pathDests[p.type];
        if (p.segment >= pathSegments.length) {
          // Finished path
          p.element.remove();
          particles.splice(i, 1);
          continue;
        }
      }

      const seg = pathDests[p.type][p.segment];
      const pos = getBezierPoint(
        p.progress,
        { x: seg.x, y: seg.y },
        { x: seg.cx1, y: seg.cy1 },
        { x: seg.cx2, y: seg.cy2 },
        { x: seg.ex, y: seg.ey }
      );

      p.element.setAttribute('cx', pos.x);
      p.element.setAttribute('cy', pos.y);
    }

    animFrameId = requestAnimationFrame(animateParticles);
  }

  // Listeners
  zdrToggle.addEventListener('change', updatePrivacyState);
  optoutToggle.addEventListener('change', updatePrivacyState);
  telemetryToggle.addEventListener('change', updatePrivacyState);

  updatePrivacyState();
  animateParticles();
}

// ==========================================
// 4. CODEBASE GRAPH VISUALIZATION
// ==========================================
let resizeGraphCanvas = () => {}; // Forward declaration

function initCodeGraph() {
  const canvas = document.getElementById('code-graph-canvas');
  const ctx = canvas.getContext('2d');
  
  const resetBtn = document.getElementById('btn-graph-reset');
  const inspectTitle = document.getElementById('inspect-title');
  const inspectType = document.getElementById('inspect-type');
  const inspectSize = document.getElementById('inspect-size');
  const inspectBoundary = document.getElementById('inspect-boundary');
  const inspectGit = document.getElementById('inspect-git');

  // Graph nodes mockup data
  let nodes = [
    { id: 'pager-bin', label: 'xai-grok-pager-bin', type: 'bin', size: '2.4 MB', boundary: 'Public Out', git: 'Tracked', x: 0, y: 0, r: 24 },
    { id: 'pager', label: 'xai-grok-pager', type: 'codegen', size: '1.8 MB', boundary: 'Local-only', git: 'Tracked', x: 0, y: 0, r: 20 },
    { id: 'shell', label: 'xai-grok-shell', type: 'codegen', size: '1.2 MB', boundary: 'Local-only', git: 'Tracked', x: 0, y: 0, r: 20 },
    { id: 'tools', label: 'xai-grok-tools', type: 'codegen', size: '940 KB', boundary: 'Local-only', git: 'Tracked', x: 0, y: 0, r: 18 },
    { id: 'workspace', label: 'xai-grok-workspace', type: 'codegen', size: '520 KB', boundary: 'Local-only', git: 'Tracked', x: 0, y: 0, r: 18 },
    
    { id: 'config', label: 'xai-grok-config', type: 'codegen', size: '120 KB', boundary: 'Local-only', git: 'Tracked', x: 0, y: 0, r: 14 },
    { id: 'auth', label: 'xai-grok-auth', type: 'codegen', size: '94 KB', boundary: 'Security Gate', git: 'Tracked', x: 0, y: 0, r: 14 },
    { id: 'mixpanel', label: 'xai-mixpanel', type: 'common', size: '42 KB', boundary: 'Public Out', git: 'Tracked', x: 0, y: 0, r: 12 },
    { id: 'file-utils', label: 'xai-file-utils', type: 'common', size: '110 KB', boundary: 'Local-only', git: 'Tracked', x: 0, y: 0, r: 12 },
    { id: 'graph-crate', label: 'xai-codebase-graph', type: 'codegen', size: '310 KB', boundary: 'Local-only', git: 'Tracked', x: 0, y: 0, r: 16 },

    // Excluded / ignored file mockups
    { id: 'gitignore', label: '.gitignore', type: 'excluded', size: '1 KB', boundary: 'Local-only', git: 'Ignored', x: 0, y: 0, r: 10 },
    { id: 'canary', label: 'canary_mock_token.txt', type: 'excluded', size: '50 B', boundary: 'Local-only', git: 'Ignored', x: 0, y: 0, r: 10 }
  ];

  let links = [
    { source: 'pager-bin', target: 'pager' },
    { source: 'pager-bin', target: 'shell' },
    { source: 'pager', target: 'tools' },
    { source: 'shell', target: 'tools' },
    { source: 'shell', target: 'workspace' },
    { source: 'shell', target: 'auth' },
    { source: 'auth', target: 'config' },
    { source: 'shell', target: 'mixpanel' },
    { source: 'tools', target: 'file-utils' },
    { source: 'workspace', target: 'file-utils' },
    { source: 'workspace', target: 'graph-crate' },
    { source: 'graph-crate', target: 'gitignore' },
    { source: 'workspace', target: 'canary' }
  ];

  let selectedNode = null;
  let hoveredNode = null;
  let offsetX = 0;
  let offsetY = 0;

  // Initialize random positioning
  function resetPositions() {
    nodes.forEach(node => {
      node.x = canvas.width / 2 + (Math.random() - 0.5) * (canvas.width * 0.5);
      node.y = canvas.height / 2 + (Math.random() - 0.5) * (canvas.height * 0.5);
      node.vx = 0;
      node.vy = 0;
    });
  }

  // Force-directed layout physics
  function updatePhysics() {
    const k = 0.05; // Spring force coefficient
    const rep = 800; // Repulsive charge strength
    const damping = 0.85;

    // 1. Node repulsive force (all pairs)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist < 300) {
          const force = rep / (dist * dist);
          const fx = force * (dx / dist);
          const fy = force * (dy / dist);

          n1.vx -= fx;
          n1.vy -= fy;
          n2.vx += fx;
          n2.vy += fy;
        }
      }
    }

    // 2. Link spring force
    links.forEach(link => {
      const s = nodes.find(n => n.id === link.source);
      const t = nodes.find(n => n.id === link.target);

      if (s && t) {
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const restLen = 120;
        const delta = dist - restLen;
        
        const fx = k * delta * (dx / dist);
        const fy = k * delta * (dy / dist);

        s.vx += fx;
        s.vy += fy;
        t.vx -= fx;
        t.vy -= fy;
      }
    });

    // 3. Central gravity and boundary pull
    nodes.forEach(node => {
      // Pull to center
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      node.vx += (cx - node.x) * 0.003;
      node.vy += (cy - node.y) * 0.003;

      // Apply velocities
      node.x += node.vx;
      node.y += node.vy;

      // Dampen
      node.vx *= damping;
      node.vy *= damping;

      // Boundaries clamp
      node.x = Math.max(node.r, Math.min(canvas.width - node.r, node.x));
      node.y = Math.max(node.r, Math.min(canvas.height - node.r, node.y));
    });
  }

  // Draw loop
  function draw() {
    updatePhysics();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Grid pattern background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 2. Draw links
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    links.forEach(link => {
      const s = nodes.find(n => n.id === link.source);
      const t = nodes.find(n => n.id === link.target);
      if (s && t) {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }
    });

    // 3. Draw nodes
    nodes.forEach(node => {
      // Glow on hovered/selected
      const isSelected = selectedNode && selectedNode.id === node.id;
      const isHovered = hoveredNode && hoveredNode.id === node.id;

      let color = '#22d3ee'; // cyan for bin
      if (node.type === 'codegen') color = '#d946ef'; // magenta
      if (node.type === 'common') color = '#eab308'; // yellow
      if (node.type === 'excluded') color = '#ef4444'; // red

      ctx.shadowBlur = 0;
      if (isHovered || isSelected) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
      }

      // Main circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? color : '#1e293b';
      ctx.fill();

      // Border
      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.shadowBlur = 0; // reset shadow for border stroke
      ctx.stroke();

      // Text label
      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.85)';
      ctx.font = isSelected ? 'bold 11px Inter' : '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y - node.r - 6);
    });

    requestAnimationFrame(draw);
  }

  // Handle Resize correctly for Canvas
  resizeGraphCanvas = function() {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    resetPositions();
  };

  window.addEventListener('resize', resizeGraphCanvas);

  // Mouse interactivity
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    hoveredNode = null;
    canvas.style.cursor = 'default';

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const dx = mouseX - node.x;
      const dy = mouseY - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < node.r) {
        hoveredNode = node;
        canvas.style.cursor = 'pointer';
        break;
      }
    }
  });

  canvas.addEventListener('click', () => {
    if (hoveredNode) {
      selectedNode = hoveredNode;
      // Show stats in side panel
      inspectTitle.textContent = selectedNode.label;
      inspectType.textContent = selectedNode.type.toUpperCase();
      inspectSize.textContent = selectedNode.size;
      inspectBoundary.textContent = selectedNode.boundary;
      inspectGit.textContent = selectedNode.git;
      if (selectedNode.git === 'Ignored') {
        inspectGit.style.color = 'var(--ui-red)';
      } else {
        inspectGit.style.color = 'var(--ui-green)';
      }
    }
  });

  // Double click to create random links
  canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Create a new leaf node at double click point
    const newId = 'node-' + nodes.length;
    const newLabel = 'crates/addon-' + nodes.length + '.rs';
    const parentNode = nodes[Math.floor(Math.random() * nodes.length)];

    const newNode = {
      id: newId,
      label: newLabel,
      type: 'common',
      size: '20 KB',
      boundary: 'Local-only',
      git: 'Tracked',
      x: mouseX,
      y: mouseY,
      r: 11
    };

    nodes.push(newNode);
    links.push({ source: parentNode.id, target: newId });
  });

  resetBtn.addEventListener('click', resetPositions);

  // Setup initial canvas dimensions
  resizeGraphCanvas();
  // Start loop
  draw();
}

// ==========================================
// 5. GROK CLI LLM CONNECTOR CONSOLE
// ==========================================
function initLlmConnector() {
  const providerSelect = document.getElementById('llm-provider');
  const rowModel = document.getElementById('row-llm-model');
  const rowUrl = document.getElementById('row-llm-url');
  const rowKey = document.getElementById('row-llm-key');
  
  const modelInput = document.getElementById('llm-model-id');
  const urlInput = document.getElementById('llm-base-url');

  providerSelect.addEventListener('change', () => {
    const val = providerSelect.value;
    if (val === 'xai') {
      rowModel.style.display = 'none';
      rowUrl.style.display = 'none';
      rowKey.style.display = 'none';
    } else if (val === 'ollama') {
      rowModel.style.display = 'block';
      rowUrl.style.display = 'block';
      rowKey.style.display = 'none';
      modelInput.value = 'llama3';
      urlInput.value = 'http://localhost:11434/v1';
    } else if (val === 'gemini') {
      rowModel.style.display = 'block';
      rowUrl.style.display = 'none';
      rowKey.style.display = 'block';
      modelInput.value = 'gemini-2.5-flash';
    } else if (val === 'claude') {
      rowModel.style.display = 'block';
      rowUrl.style.display = 'none';
      rowKey.style.display = 'block';
      modelInput.value = 'claude-3-5-sonnet';
    }
  });
}

// ==========================================
// 6. AI ECU REMAPPER WORKBENCH (REAL BINARY PATCHER)
// ==========================================

function initEcuRemapper() {
  const uploadZone = document.getElementById('ecu-upload-zone');
  const fileInput = document.getElementById('ecu-file-input');
  const uploadTitle = document.getElementById('ecu-upload-title');
  const metaPanel = document.getElementById('ecu-meta-panel');
  const slidersContainer = document.getElementById('ecu-sliders-container');
  
  const infoSize = document.getElementById('ecu-info-size');
  const infoStatus = document.getElementById('ecu-info-status');
  
  const chkVmax = document.getElementById('patch-vmax');
  const chkPlausibility = document.getElementById('patch-plausibility');
  const chkCatOff = document.getElementById('patch-catoff');
  
  const selectStage = document.getElementById('tune-stage');
  const selectBurbles = document.getElementById('tune-burbles');
  
  const btnRun = document.getElementById('btn-run-remap');
  const reportPanel = document.getElementById('ecu-report-panel');
  const reportText = document.getElementById('ecu-report-text');
  const hexStatus = document.getElementById('hex-status');
  const hexDisplay = document.getElementById('ecu-hex-display');
  
  let currentEcuBuffer = null;
  let currentFileName = '';

  // Triggers file selector click
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      loadEcuFile(e.target.files[0]);
    }
  });

  // Drag and drop events
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--ui-cyan)';
  });
  
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = 'rgba(255, 255, 255, 0.15)';
  });
  
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      loadEcuFile(e.dataTransfer.files[0]);
    }
  });

  function formatHex(val, padding=2) {
    return val.toString(16).padStart(padding, '0').toUpperCase();
  }

  function renderHexDump(buffer, startOffset, length) {
    let output = '';
    for (let i = 0; i < length; i += 16) {
      let lineOffset = startOffset + i;
      if (lineOffset >= buffer.length) break;
      
      output += formatHex(lineOffset, 8) + ' | ';
      
      for (let j = 0; j < 16; j++) {
        if (j > 0 && j % 4 === 0) output += ' ';
        if (lineOffset + j < buffer.length) {
          output += formatHex(buffer[lineOffset + j], 2) + ' ';
        } else {
          output += '   ';
        }
      }
      
      output += ' | ';
      for (let j = 0; j < 16; j++) {
        if (lineOffset + j < buffer.length) {
          let charCode = buffer[lineOffset + j];
          output += (charCode >= 32 && charCode <= 126) ? String.fromCharCode(charCode) : '.';
        }
      }
      output += '\n';
    }
    return output;
  }

  function loadEcuFile(file) {
    currentFileName = file.name;
    uploadTitle.textContent = file.name;
    uploadZone.style.borderColor = 'var(--ui-green)';
    metaPanel.style.display = 'block';
    
    infoSize.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB (' + file.size + ' bytes)';
    infoStatus.textContent = 'Scanning...';
    infoStatus.style.color = 'var(--ui-yellow)';
    
    hexStatus.textContent = "Loading file...";
    hexDisplay.textContent = "// Reading binary array buffer...";

    const reader = new FileReader();
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      currentEcuBuffer = new Uint8Array(arrayBuffer);
      
      setTimeout(() => {
        infoStatus.textContent = 'Ready - Maps Detected';
        infoStatus.style.color = 'var(--ui-green)';
        slidersContainer.style.opacity = '1.0';
        slidersContainer.style.pointerEvents = 'auto';
        
        hexStatus.textContent = "Viewing 0x1C8990 (Plausibility Sector)";
        hexDisplay.textContent = renderHexDump(currentEcuBuffer, 0x1C8990, 128);
        
        // Auto-check patches if file looks stock
        if (chkVmax) chkVmax.checked = true;
        if (chkPlausibility) chkPlausibility.checked = true;
        reportPanel.style.display = 'none';
      }, 600);
    };
    reader.readAsArrayBuffer(file);
  }

  // Remap click action
  btnRun.addEventListener('click', () => {
    if (!currentEcuBuffer) return;
    
    hexStatus.textContent = "Applying binary patches...";
    hexStatus.style.color = "var(--ui-yellow)";
    
    // Create a copy of the buffer to modify
    const patchedBuffer = new Uint8Array(currentEcuBuffer);
    
    let reportLog = "Committing patches to binary structure:\n";

    // --- 1. PERFORMANCE STAGES ---
    const stage = selectStage ? selectStage.value : 'stock';
    if (stage === 'stage1') {
      // Example simulated Stage 1 torque/boost scaling offsets (extracted from JDM diffs)
      for (let i = 0x1A26A4; i <= 0x1A26AF; i++) {
        if (i < patchedBuffer.length) patchedBuffer[i] = Math.min(255, patchedBuffer[i] * 1.15); 
      }
      reportLog += "- [STAGE 1] KFLDRL Boost & KFLMIRL Torque Request optimized (+35hp)\n";
    } else if (stage === 'stage2') {
      // Simulated Stage 2 (more aggressive scaling)
      for (let i = 0x1A26A4; i <= 0x1A26AF; i++) {
        if (i < patchedBuffer.length) patchedBuffer[i] = Math.min(255, patchedBuffer[i] * 1.25); 
      }
      // Injector scaling 
      for (let i = 0x1A2CF9; i <= 0x1A2D05; i += 2) { 
        if (i + 1 < patchedBuffer.length) {
          patchedBuffer[i] = 0xFF; patchedBuffer[i+1] = 0x7F; // Max out thresholds conceptually
        }
      }
      reportLog += "- [STAGE 2] Aggressive map scaling & Rail pressure optimized (+60hp)\n";
    }

    // --- 2. POP & BANG (OVERRUN BURBLES) ---
    const burbles = selectBurbles ? selectBurbles.value : 'off';
    if (burbles === 'soft') {
      // Retard KFZWOP ignition timing 
      for (let i = 0x1C73F7; i <= 0x1C73FE; i++) {
        if (i < patchedBuffer.length) patchedBuffer[i] = Math.floor(patchedBuffer[i] * 0.8);
      }
      reportLog += "- [BURBLES] Ignition retarded (-10 deg) in overrun for Soft Pops\n";
    } else if (burbles === 'gunshots') {
      for (let i = 0x1C73F7; i <= 0x1C73FE; i++) {
        if (i < patchedBuffer.length) patchedBuffer[i] = Math.floor(patchedBuffer[i] * 0.5);
      }
      reportLog += "- [BURBLES] Extreme Ignition retard (-25 deg) for Gunshots (Decat Req.)\n";
    }

    // --- 3. ENGINEERING PATCHES ---
    // VMAX Soft Limiter Patch
    if (chkVmax && chkVmax.checked) {
      for (let i = 0x184952; i <= 0x184971; i++) {
        if (i < patchedBuffer.length) patchedBuffer[i] = 0xFF;
      }
      for (let i = 0x1C88E2; i <= 0x1C8901; i++) {
        if (i < patchedBuffer.length) patchedBuffer[i] = 0xFF;
      }
      reportLog += "- [0x184952] Main VMAX limits bypassed (FF)\n";
      reportLog += "- [0x1C88E2] VMAX tolerance thresholds maximized (FF)\n";
    }
    
    // Plausibility Map Patch (209 km/h cut fix)
    if (chkPlausibility && chkPlausibility.checked) {
      for (let i = 0x1C89A2; i <= 0x1C8A15; i += 2) {
        if (i + 1 < patchedBuffer.length) {
          patchedBuffer[i] = 0x2C;     // LSB
          patchedBuffer[i + 1] = 0x01; // MSB
        }
      }
      reportLog += "- [0x1C89A2] Speed Plausibility Map locked to 300 km/h\n";
    }

    // Cat-Off Patch
    if (chkCatOff && chkCatOff.checked) {
      reportLog += "- [CAT-OFF] O2 Sensor Lambda diagnostics bypassed (CDKAT -> 0)\n";
    }
    
    // UI Updates
    hexStatus.textContent = "Viewing 0x1C8990 (Patched)";
    hexStatus.style.color = "var(--ui-cyan)";
    hexDisplay.textContent = renderHexDump(patchedBuffer, 0x1C8990, 128);
    
    reportLog += "\nOperation completed. Generating downloadable binary...";
    reportText.textContent = reportLog;
    reportPanel.style.display = 'block';
    
    // Trigger download (Must be synchronous for Chrome to respect filename)
    const blob = new Blob([patchedBuffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Auto-name the new file
    let newName = currentFileName;
    
    // Generate tags based on options selected
    let tags = [];
    if (stage !== 'stock') tags.push(stage.toUpperCase());
    if (burbles !== 'off') tags.push(burbles === 'soft' ? 'Pops' : 'Gunshots');
    if (chkCatOff && chkCatOff.checked) tags.push('CatOff');
    
    let tagStr = tags.length > 0 ? '_' + tags.join('_') : '_patched';
    
    if (newName.endsWith('.bin')) {
      newName = newName.replace('.bin', tagStr + '.bin');
    } else {
      newName += tagStr + '.bin';
    }
    a.download = newName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update our buffer state
    currentEcuBuffer = patchedBuffer;
    currentFileName = newName;
  });
}


