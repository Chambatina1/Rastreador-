<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CHAMBATINA — Rastreo & Compras</title>
  <link rel="manifest" href="manifest.json">
  <link rel="icon" type="image/png" href="./public/Chambatinaapp.png">
  <link rel="apple-touch-icon" href="./public/Chambatinaapp.png">
  <meta name="theme-color" content="#ff8a00">

  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            heading: ['Geist', 'sans-serif'],
            body: ['Inter', 'sans-serif'],
          },
          colors: {
            brand: { DEFAULT: '#ff8a00', light: '#ffa033', dark: '#e07700', glow: 'rgba(255,138,0,0.15)' },
            silver: { DEFAULT: '#c0c0c0', dark: '#888888', light: '#e0e0e0' },
            surface: { 0: '#0a0a0a', 1: '#111111', 2: '#1a1a1a', 3: '#222222', 4: '#2a2a2a', 5: '#333333' }
          }
        }
      }
    }
  </script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #fff; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0a0a0a; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #ff8a00; }

    .font-heading { font-family: 'Geist', sans-serif; }

    .glow-line {
      height: 1px;
      background: linear-gradient(90deg, transparent, #ff8a00, transparent);
      opacity: 0.4;
    }

    .card-dark {
      background: linear-gradient(135deg, #111111 0%, #1a1a1a 100%);
      border: 1px solid #222;
      border-radius: 16px;
      transition: all 0.4s cubic-bezier(0.25,1,0.5,1);
    }
    .card-dark:hover {
      border-color: rgba(255,138,0,0.3);
      box-shadow: 0 0 40px rgba(255,138,0,0.05);
    }

    .btn-primary {
      background: #ff8a00;
      color: #000;
      font-weight: 700;
      padding: 14px 32px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
    }
    .btn-primary:hover {
      background: #ffa033;
      box-shadow: 0 0 30px rgba(255,138,0,0.3);
      transform: translateY(-1px);
    }

    .btn-ghost {
      background: transparent;
      color: #c0c0c0;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 12px;
      border: 1px solid #333;
      cursor: pointer;
      font-size: 14px;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
    }
    .btn-ghost:hover {
      border-color: #ff8a00;
      color: #ff8a00;
    }

    .input-dark {
      width: 100%;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid #2a2a2a;
      background: #0f0f0f;
      color: #fff;
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
      outline: none;
    }
    .input-dark:focus {
      border-color: #ff8a00;
      box-shadow: 0 0 0 3px rgba(255,138,0,0.1);
    }
    .input-dark::placeholder { color: #555; }

    .nav-link {
      color: #888;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      cursor: pointer;
      transition: color 0.3s ease;
      position: relative;
      padding: 4px 0;
      white-space: nowrap;
    }
    .nav-link:hover, .nav-link.active { color: #ff8a00; }
    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #ff8a00;
      border-radius: 1px;
    }

    .section { display: none; animation: fadeUp 0.5s ease-out; }
    .section.active { display: block; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(255,138,0,0.1); }
      50% { box-shadow: 0 0 40px rgba(255,138,0,0.2); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    .hero-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,138,0,0.08) 0%, transparent 70%);
      top: -200px;
      right: -200px;
      pointer-events: none;
    }

    .stat-num {
      font-family: 'Geist', sans-serif;
      font-weight: 700;
      font-size: 36px;
      color: #ff8a00;
      line-height: 1;
    }

    .chat-container {
      height: 500px;
      overflow-y: auto;
      padding: 20px;
      scroll-behavior: smooth;
    }

    .chat-bubble {
      max-width: 85%;
      padding: 14px 18px;
      border-radius: 16px;
      margin-bottom: 12px;
      font-size: 14px;
      line-height: 1.6;
      animation: fadeUp 0.3s ease-out;
    }
    .chat-bubble.bot {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .chat-bubble.user {
      background: #ff8a00;
      color: #000;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
      font-weight: 500;
    }

    .typing-dots span {
      display: inline-block;
      width: 6px; height: 6px;
      background: #555;
      border-radius: 50%;
      margin: 0 2px;
      animation: typing 1.4s infinite;
    }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    .tag {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .file-upload-zone {
      border: 2px dashed #333;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .file-upload-zone:hover {
      border-color: #ff8a00;
      background: rgba(255,138,0,0.03);
    }

    .toast {
      position: fixed;
      bottom: 30px;
      right: 30px;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      z-index: 9999;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.25,1,0.5,1);
    }
    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
    .toast.success { background: #1a2e1a; border: 1px solid #2d5a2d; color: #7CFC8A; }
    .toast.error { background: #2e1a1a; border: 1px solid #5a2d2d; color: #ff6b6b; }
    .toast.info { background: #1a1a2e; border: 1px solid #2d2d5a; color: #6b9fff; }

    .mobile-menu {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.95);
      backdrop-filter: blur(20px);
      z-index: 100;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
    }
    .mobile-menu.open { display: flex; }

    /* ===== PRODUCT CARD ===== */
    .product-card {
      background: #111;
      border: 1px solid #1e1e1e;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.25,1,0.5,1);
      position: relative;
    }
    .product-card:hover {
      border-color: rgba(255,138,0,0.25);
      transform: translateY(-4px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
    .product-card .img-wrap {
      position: relative;
      aspect-ratio: 1/1;
      overflow: hidden;
      background: #0f0f0f;
    }
    .product-card .img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.25,1,0.5,1);
      filter: saturate(0.8);
    }
    .product-card:hover .img-wrap img {
      transform: scale(1.08);
      filter: saturate(1);
    }
    .product-card .soon-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    .product-card .soon-badge {
      background: rgba(255,138,0,0.15);
      border: 1px solid rgba(255,138,0,0.4);
      backdrop-filter: blur(10px);
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #ff8a00;
    }
    .product-card .fire-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 3;
      background: rgba(255,50,50,0.9);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .product-card .sold-count {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 3;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #ccc;
    }

    .shimmer-text {
      background: linear-gradient(90deg, #ff8a00 0%, #ffd166 40%, #ff8a00 80%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }

    .countdown-box {
      background: #0a0a0a;
      border: 1px solid #222;
      border-radius: 12px;
      padding: 16px 20px;
      text-align: center;
      min-width: 80px;
    }
    .countdown-box .num {
      font-family: 'Geist', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #ff8a00;
      line-height: 1;
    }
    .countdown-box .label {
      font-size: 10px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }

    .notify-input-wrap {
      display: flex;
      gap: 10px;
      max-width: 500px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .desktop-nav { display: none !important; }
      .mobile-toggle { display: flex !important; }
      .hero-grid { grid-template-columns: 1fr !important; }
      .stats-grid { grid-template-columns: 1fr 1fr !important; }
      .pricing-grid { grid-template-columns: 1fr !important; }
      .form-2col { grid-template-columns: 1fr !important; }
      .stat-num { font-size: 28px; }
      .products-grid { grid-template-columns: 1fr 1fr !important; }
      .notify-input-wrap { flex-direction: column; }
    }

    @media (max-width: 480px) {
      .products-grid { grid-template-columns: 1fr !important; }
    }

    .noise-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 9998;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
  </style>
</head>

<body>
  <div class="noise-overlay"></div>

  <!-- TOAST -->
  <div id="toast" class="toast"></div>

  <!-- MOBILE MENU -->
  <div id="mobileMenu" class="mobile-menu">
    <button onclick="closeMobile()" style="position:absolute;top:24px;right:24px;background:none;border:none;color:#fff;cursor:pointer;">
      <i data-lucide="x" style="width:28px;height:28px;"></i>
    </button>
    <div class="nav-link text-lg" onclick="switchSection('hero');closeMobile()">Inicio</div>
    <div class="nav-link text-lg" onclick="switchSection('rastreo');closeMobile()">Rastreo</div>
    <div class="nav-link text-lg" onclick="switchSection('tienda');closeMobile()">Tienda</div>
    <div class="nav-link text-lg" onclick="switchSection('showsoon');closeMobile()">Show Soon</div>
    <div class="nav-link text-lg" onclick="switchSection('ia');closeMobile()">Asistente IA</div>
    <div class="nav-link text-lg" onclick="switchSection('servicios');closeMobile()">Servicios</div>
  </div>

  <!-- NAV -->
  <nav style="position:fixed;top:0;left:0;width:100%;z-index:90;background:rgba(10,10,10,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.05);">
    <div style="max-width:1200px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;">
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
        <div style="display:flex;align-items:center;gap:12px;cursor:pointer;" onclick="switchSection('hero')">
          <div style="width:36px;height:36px;background:#ff8a00;border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <span style="font-family:'Geist';font-weight:700;color:#000;font-size:16px;">C</span>
          </div>
          <span class="font-heading" style="font-weight:700;font-size:18px;letter-spacing:-0.5px;">CHAMBATINA</span>
        </div>

        <div class="desktop-nav" style="display:flex;align-items:center;gap:28px;">
          <div class="nav-link active" data-nav="hero" onclick="switchSection('hero')">Inicio</div>
          <div class="nav-link" data-nav="rastreo" onclick="switchSection('rastreo')">Rastreo</div>
          <div class="nav-link" data-nav="tienda" onclick="switchSection('tienda')">Tienda</div>
          <div class="nav-link" data-nav="showsoon" onclick="switchSection('showsoon')" style="color:#ff8a00;">Show Soon</div>
          <div class="nav-link" data-nav="ia" onclick="switchSection('ia')">Asistente IA</div>
          <div class="nav-link" data-nav="servicios" onclick="switchSection('servicios')">Servicios</div>
        </div>

        <button class="mobile-toggle" onclick="openMobile()" style="display:none;background:none;border:none;color:#fff;cursor:pointer;align-items:center;justify-content:center;">
          <i data-lucide="menu" style="width:24px;height:24px;"></i>
        </button>
      </div>
    </div>
  </nav>

  <!-- ===================== HERO ===================== -->
  <div id="sec-hero" class="section active" style="padding-top:64px;">
    <div style="position:relative;min-height:100vh;display:flex;align-items:center;">
      <div class="hero-glow"></div>
      <div style="max-width:1200px;margin:0 auto;padding:80px 24px;width:100%;">
        <div class="hero-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;">
          <div>
            <div class="tag" style="background:rgba(255,138,0,0.1);color:#ff8a00;border:1px solid rgba(255,138,0,0.2);margin-bottom:24px;">
              Envíos desde EE.UU. → Cuba
            </div>
            <h1 class="font-heading" style="font-size:clamp(40px,6vw,72px);font-weight:700;line-height:1;letter-spacing:-3px;margin-bottom:24px;">
              TU PAQUETE<br>
              <span style="color:#ff8a00;">EN MOVIMIENTO</span>
            </h1>
            <p style="color:#888;font-size:16px;line-height:1.7;max-width:460px;margin-bottom:40px;">
              Rastrea tus envíos en tiempo real, realiza compras personalizadas desde TikTok y recibe asesoría instantánea con nuestra IA. Todo en un solo ecosistema.
            </p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <button class="btn-primary" onclick="switchSection('rastreo')">
                <i data-lucide="search" style="width:16px;height:16px;"></i>
                Rastrear Paquete
              </button>
              <button class="btn-ghost" onclick="switchSection('showsoon')">
                <i data-lucide="flame" style="width:16px;height:16px;"></i>
                Show Soon
              </button>
            </div>
          </div>

          <div style="position:relative;">
            <div style="border-radius:20px;overflow:hidden;aspect-ratio:4/5;position:relative;">
              <img src="https://picsum.photos/seed/chambatina-hero/800/1000.jpg" alt="Hero" style="width:100%;height:100%;object-fit:cover;filter:grayscale(60%) contrast(1.2);">
              <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%);"></div>
              <div style="position:absolute;bottom:30px;left:24px;right:24px;">
                <div style="display:flex;gap:16px;">
                  <div style="flex:1;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Paquetes</div>
                    <div class="font-heading" style="font-size:24px;font-weight:700;color:#ff8a00;">2,400+</div>
                  </div>
                  <div style="flex:1;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Entregados</div>
                    <div class="font-heading" style="font-size:24px;font-weight:700;color:#7CFC8A;">98%</div>
                  </div>
                </div>
              </div>
            </div>
            <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border:1px solid rgba(255,138,0,0.2);border-radius:50%;animation:float 6s ease-in-out infinite;"></div>
          </div>
        </div>

        <div class="stats-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;margin-top:80px;background:#222;border-radius:16px;overflow:hidden;">
          <div style="background:#111;padding:32px;text-align:center;">
            <div class="stat-num">18-30</div>
            <div style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-top:8px;">Días hábiles</div>
          </div>
          <div style="background:#111;padding:32px;text-align:center;">
            <div class="stat-num">$1.80</div>
            <div style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-top:8px;">Desde / libra</div>
          </div>
          <div style="background:#111;padding:32px;text-align:center;">
            <div class="stat-num">$45</div>
            <div style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-top:8px;">Caja desde</div>
          </div>
          <div style="background:#111;padding:32px;text-align:center;">
            <div class="stat-num">24/7</div>
            <div style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-top:8px;">IA Asistente</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== RASTREO ===================== -->
  <div id="sec-rastreo" class="section" style="padding-top:100px;min-height:100vh;">
    <div style="max-width:800px;margin:0 auto;padding:0 24px 80px;">
      <div style="text-align:center;margin-bottom:48px;">
        <div class="tag" style="background:rgba(255,138,0,0.1);color:#ff8a00;border:1px solid rgba(255,138,0,0.2);margin-bottom:16px;">Rastreo en vivo</div>
        <h2 class="font-heading" style="font-size:40px;font-weight:700;letter-spacing:-2px;">RASTREA TU PAQUETE</h2>
        <p style="color:#888;margin-top:12px;">Introduce tu código CPK para ver el estado actualizado de tu envío.</p>
      </div>

      <div class="card-dark" style="padding:32px;animation:pulse-glow 4s ease-in-out infinite;">
        <div style="display:flex;gap:12px;">
          <div style="flex:1;position:relative;">
            <i data-lucide="package" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:#555;"></i>
            <input id="codigo" class="input-dark" placeholder="Ej: CPK-001234" style="padding-left:44px;">
          </div>
          <button class="btn-primary" onclick="buscar()" style="white-space:nowrap;">
            <i data-lucide="radar" style="width:16px;height:16px;"></i>
            Buscar
          </button>
        </div>
        <div id="resultado" style="margin-top:24px;padding:20px;background:#0f0f0f;border-radius:12px;border:1px solid #222;min-height:80px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#555;font-size:14px;">Introduce tu código para ver el estado</span>
        </div>
      </div>

      <div style="margin-top:40px;">
        <h3 class="font-heading" style="font-size:14px;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:24px;">¿Cómo funciona el rastreo?</h3>
        <div style="display:flex;flex-direction:column;gap:0;">
          <div style="display:flex;gap:16px;">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="width:12px;height:12px;border-radius:50%;background:#ff8a00;"></div>
              <div style="width:2px;height:50px;background:#333;"></div>
            </div>
            <div style="padding-bottom:24px;">
              <div style="font-weight:600;font-size:14px;">Compra confirmada</div>
              <div style="color:#888;font-size:13px;margin-top:4px;">Se genera tu código CPK único</div>
            </div>
          </div>
          <div style="display:flex;gap:16px;">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="width:12px;height:12px;border-radius:50%;background:#ff8a00;"></div>
              <div style="width:2px;height:50px;background:#333;"></div>
            </div>
            <div style="padding-bottom:24px;">
              <div style="font-weight:600;font-size:14px;">En tránsito a puerto</div>
              <div style="color:#888;font-size:13px;margin-top:4px;">Tu paquete viaja hacia Cuba</div>
            </div>
          </div>
          <div style="display:flex;gap:16px;">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="width:12px;height:12px;border-radius:50%;background:#555;border:2px solid #333;"></div>
              <div style="width:2px;height:50px;background:#333;"></div>
            </div>
            <div style="padding-bottom:24px;">
              <div style="font-weight:600;font-size:14px;color:#888;">En aduana</div>
              <div style="color:#555;font-size:13px;margin-top:4px;">Proceso de revisión y fee</div>
            </div>
          </div>
          <div style="display:flex;gap:16px;">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="width:12px;height:12px;border-radius:50%;background:#555;border:2px solid #333;"></div>
            </div>
            <div>
              <div style="font-weight:600;font-size:14px;color:#888;">Entregado</div>
              <div style="color:#555;font-size:13px;margin-top:4px;">Recibes tu paquete en puerta</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== TIENDA ===================== -->
  <div id="sec-tienda" class="section" style="padding-top:100px;min-height:100vh;">
    <div style="max-width:900px;margin:0 auto;padding:0 24px 80px;">
      <div style="text-align:center;margin-bottom:48px;">
        <div class="tag" style="background:rgba(255,138,0,0.1);color:#ff8a00;border:1px solid rgba(255,138,0,0.2);margin-bottom:16px;">Compras personalizadas</div>
        <h2 class="font-heading" style="font-size:40px;font-weight:700;letter-spacing:-2px;">PEDIR COMPRA</h2>
        <p style="color:#888;margin-top:12px;">Nosotros compramos por ti en TikTok. Envía el link o describe el producto.</p>
      </div>

      <form id="compraForm" onsubmit="enviarCompra(event)">
        <div class="card-dark" style="padding:32px;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
            <div style="width:32px;height:32px;background:rgba(255,138,0,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;">
              <i data-lucide="tag" style="width:16px;height:16px;color:#ff8a00;"></i>
            </div>
            <h3 class="font-heading" style="font-size:16px;font-weight:600;letter-spacing:-0.5px;">Datos del Producto</h3>
          </div>
          <div style="margin-bottom:16px;">
            <label style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Link de TikTok <span style="color:#ff8a00;">*</span></label>
            <input id="tiktokLink" class="input-dark" placeholder="https://www.tiktok.com/..." required>
          </div>
          <div style="margin-bottom:16px;">
            <label style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Descripción del producto</label>
            <textarea id="productoDesc" class="input-dark" rows="3" placeholder="Color, talla, modelo, características..." style="resize:vertical;"></textarea>
          </div>
          <div>
            <label style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Imagen del producto (opcional)</label>
            <div class="file-upload-zone" onclick="document.getElementById('productoImg').click()">
              <input type="file" id="productoImg" accept="image/*" style="display:none;" onchange="handleFileUpload(this)">
              <div id="uploadPreview">
                <i data-lucide="image-plus" style="width:32px;height:32px;color:#555;margin:0 auto 12px;display:block;"></i>
                <div style="color:#888;font-size:14px;">Haz clic para subir imagen</div>
                <div style="color:#555;font-size:12px;margin-top:4px;">PNG, JPG hasta 5MB</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-dark" style="padding:32px;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
            <div style="width:32px;height:32px;background:rgba(255,138,0,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;">
              <i data-lucide="user" style="width:16px;height:16px;color:#ff8a00;"></i>
            </div>
            <h3 class="font-heading" style="font-size:16px;font-weight:600;letter-spacing:-0.5px;">Tus Datos</h3>
          </div>
          <div class="form-2col" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div>
              <label style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Nombre completo <span style="color:#ff8a00;">*</span></label>
              <input id="clientNombre" class="input-dark" placeholder="Tu nombre" required>
            </div>
            <div>
              <label style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Correo electrónico <span style="color:#ff8a00;">*</span></label>
              <input id="clientEmail" class="input-dark" type="email" placeholder="tu@correo.com" required>
            </div>
            <div>
              <label style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Teléfono <span style="color:#ff8a00;">*</span></label>
              <input id="clientTel" class="input-dark" placeholder="+53 5XXXXXXX" required>
            </div>
            <div>
              <label style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Carnet de Identidad <span style="color:#ff8a00;">*</span></label>
              <input id="clientCI" class="input-dark" placeholder="Número de carnet" required>
            </div>
          </div>
        </div>

        <div class="card-dark" style="padding:32px;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;flex-wrap:wrap;">
            <div style="width:32px;height:32px;background:rgba(255,138,0,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;">
              <i data-lucide="map-pin" style="width:16px;height:16px;color:#ff8a00;"></i>
            </div>
            <h3 class="font-heading" style="font-size:16px;font-weight:600;letter-spacing:-0.5px;">Datos de Envío</h3>
            <label style="margin-left:auto;display:flex;align-items:center;gap:8px;cursor:pointer;">
              <input type="checkbox" id="mismoDest" onchange="toggleDestinatario()" checked style="accent-color:#ff8a00;width:16px;height:16px;">
              <span style="font-size:13px;color:#888;">Yo soy el destinatario</span>
            </label>
          </div>
          <div id="destFields" style="display:none;">
            <div class="form-2col" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Nombre del destinatario <span style="color:#ff8a00;">*</span></label>
                <input id="destNombre" class="input-dark" placeholder="Quien recibe">
              </div>
              <div>
                <label style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Teléfono destinatario</label>
                <input id="destTel" class="input-dark" placeholder="+53 5XXXXXXX">
              </div>
            </div>
          </div>
          <div style="margin-bottom:16px;">
            <label style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Dirección de entrega <span style="color:#ff8a00;">*</span></label>
            <textarea id="direccion" class="input-dark" rows="2" placeholder="Calle, número, municipio, provincia..." required style="resize:vertical;"></textarea>
          </div>
          <div>
            <label style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px;">Notas adicionales</label>
            <input id="notas" class="input-dark" placeholder="Punto de referencia, horario preferido...">
          </div>
        </div>

        <button type="submit" class="btn-primary" style="width:100%;justify-content:center;padding:18px;font-size:15px;">
          <i data-lucide="send" style="width:18px;height:18px;"></i>
          Enviar Solicitud de Compra
        </button>
      </form>
    </div>
  </div>

  <!-- ===================== SHOW SOON DIGITAL ===================== -->
  <div id="sec-showsoon" class="section" style="padding-top:100px;min-height:100vh;">
    <div style="max-width:1200px;margin:0 auto;padding:0 24px 80px;">

      <!-- HEADER -->
      <div style="text-align:center;margin-bottom:20px;">
        <div class="tag" style="background:rgba(255,60,60,0.1);color:#ff4444;border:1px solid rgba(255,60,60,0.2);margin-bottom:16px;display:inline-flex;align-items:center;gap:6px;">
          <span style="font-size:13px;">🔥</span> Trending TikTok
        </div>
        <h2 class="font-heading" style="font-size:clamp(36px,5vw,56px);font-weight:700;letter-spacing:-2px;">
          SHOW SOON <span class="shimmer-text">DIGITAL</span>
        </h2>
        <p style="color:#888;margin-top:12px;max-width:550px;margin-left:auto;margin-right:auto;line-height:1.7;">
          Los productos más vendidos en TikTok que pronto estarán disponibles para que los pidas a través de Chambatina.
        </p>
      </div>

      <!-- COUNTDOWN -->
      <div style="display:flex;justify-content:center;gap:12px;margin:32px 0 48px;flex-wrap:wrap;">
        <div class="countdown-box">
          <div class="num" id="cd-days">07</div>
          <div class="label">Días</div>
        </div>
        <div class="countdown-box">
          <div class="num" id="cd-hours">14</div>
          <div class="label">Horas</div>
        </div>
        <div class="countdown-box">
          <div class="num" id="cd-mins">32</div>
          <div class="label">Mins</div>
        </div>
        <div class="countdown-box">
          <div class="num" id="cd-secs">00</div>
          <div class="label">Segs</div>
        </div>
      </div>

      <!-- CATEGORY FILTER -->
      <div style="display:flex;justify-content:center;gap:8px;margin-bottom:40px;flex-wrap:wrap;">
        <button class="filter-btn active" data-cat="all" onclick="filterProducts('all',this)" style="padding:8px 18px;border-radius:20px;background:#ff8a00;color:#000;border:none;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.3s;letter-spacing:0.5px;">Todos</button>
        <button class="filter-btn" data-cat="tech" onclick="filterProducts('tech',this)" style="padding:8px 18px;border-radius:20px;background:#1a1a1a;color:#888;border:1px solid #2a2a2a;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.3s;letter-spacing:0.5px;">Tecnología</button>
        <button class="filter-btn" data-cat="solar" onclick="filterProducts('solar',this)" style="padding:8px 18px;border-radius:20px;background:#1a1a1a;color:#888;border:1px solid #2a2a2a;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.3s;letter-spacing:0.5px;">Solar</button>
        <button class="filter-btn" data-cat="home" onclick="filterProducts('home',this)" style="padding:8px 18px;border-radius:20px;background:#1a1a1a;color:#888;border:1px solid #2a2a2a;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.3s;letter-spacing:0.5px;">Hogar</button>
        <button class="filter-btn" data-cat="fitness" onclick="filterProducts('fitness',this)" style="padding:8px 18px;border-radius:20px;background:#1a1a1a;color:#888;border:1px solid #2a2a2a;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.3s;letter-spacing:0.5px;">Fitness</button>
      </div>

      <!-- PRODUCTS GRID -->
      <div id="productsGrid" class="products-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:56px;">
      </div>

      <!-- NOTIFY SECTION -->
      <div class="card-dark" style="padding:48px;text-align:center;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(255,138,0,0.06) 0%,transparent 70%);pointer-events:none;"></div>
        <div style="position:relative;z-index:1;">
          <div style="width:56px;height:56px;background:rgba(255,138,0,0.1);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
            <i data-lucide="bell-ring" style="width:28px;height:28px;color:#ff8a00;"></i>
          </div>
          <h3 class="font-heading" style="font-size:24px;font-weight:700;letter-spacing:-1px;margin-bottom:8px;">AVÍSAME CUANDO LANCE</h3>
          <p style="color:#888;font-size:14px;margin-bottom:28px;max-width:400px;margin-left:auto;margin-right:auto;">Deja tu correo y sé el primero en saber cuándo la tienda digital esté disponible.</p>
          <div class="notify-input-wrap">
            <input id="notifyEmail" class="input-dark" type="email" placeholder="tu@correo.com">
            <button class="btn-primary" onclick="subscribeNotify()" style="white-space:nowrap;">
              <i data-lucide="bell" style="width:16px;height:16px;"></i>
              Notificarme
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== IA CHAT ===================== -->
  <div id="sec-ia" class="section" style="padding-top:100px;min-height:100vh;">
    <div style="max-width:700px;margin:0 auto;padding:0 24px 80px;height:calc(100vh - 100px);display:flex;flex-direction:column;">
      <div style="text-align:center;margin-bottom:24px;">
        <div class="tag" style="background:rgba(255,138,0,0.1);color:#ff8a00;border:1px solid rgba(255,138,0,0.2);margin-bottom:16px;">Inteligencia Artificial</div>
        <h2 class="font-heading" style="font-size:32px;font-weight:700;letter-spacing:-2px;">ASISTENTE CHAMBATINA</h2>
        <p style="color:#888;margin-top:8px;font-size:14px;">Pregúntame sobre precios, tiempos, servicios y más.</p>
      </div>
      <div class="card-dark" style="flex:1;display:flex;flex-direction:column;overflow:hidden;padding:0;">
        <div id="chatMessages" class="chat-container" style="flex:1;display:flex;flex-direction:column;">
          <div class="chat-bubble bot">
            ¡Hola! 👋 Soy el asistente de <strong>Chambatina</strong>. Puedo ayudarte con:<br><br>
            • Precios de envío y cajas<br>
            • Tiempos de entrega estimados<br>
            • Info sobre fee / arancel<br>
            • Cómo hacer un pedido de compra<br>
            • Productos que manejamos<br>
            • Show Soon Digital<br><br>
            ¿En qué te puedo ayudar?
          </div>
        </div>
        <div style="padding:16px;border-top:1px solid #222;display:flex;gap:10px;">
          <input id="chatInput" class="input-dark" placeholder="Escribe tu pregunta..." onkeydown="if(event.key==='Enter')sendChat()" style="flex:1;">
          <button onclick="sendChat()" style="width:48px;height:48px;border-radius:12px;background:#ff8a00;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.3s;">
            <i data-lucide="arrow-up" style="width:20px;height:20px;color:#000;"></i>
          </button>
        </div>
        <div style="padding:12px 16px;border-top:1px solid #1a1a1a;display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="quickChat('¿Cuánto cuesta por libra?')" style="padding:6px 14px;border-radius:20px;background:#1a1a1a;border:1px solid #2a2a2a;color:#888;font-size:12px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.borderColor='#ff8a00';this.style.color='#ff8a00'" onmouseout="this.style.borderColor='#2a2a2a';this.style.color='#888'">¿Precio por libra?</button>
          <button onclick="quickChat('¿Cuánto tarda un envío?')" style="padding:6px 14px;border-radius:20px;background:#1a1a1a;border:1px solid #2a2a2a;color:#888;font-size:12px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.borderColor='#ff8a00';this.style.color='#ff8a00'" onmouseout="this.style.borderColor='#2a2a2a';this.style.color='#888'">¿Tiempos de envío?</button>
          <button onclick="quickChat('¿Qué es Show Soon Digital?')" style="padding:6px 14px;border-radius:20px;background:#1a1a1a;border:1px solid #2a2a2a;color:#888;font-size:12px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.borderColor='#ff8a00';this.style.color='#ff8a00'" onmouseout="this.style.borderColor='#2a2a2a';this.style.color='#888'">Show Soon</button>
          <button onclick="quickChat('¿Cómo hago una compra por TikTok?')" style="padding:6px 14px;border-radius:20px;background:#1a1a1a;border:1px solid #2a2a2a;color:#888;font-size:12px;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.borderColor='#ff8a00';this.style.color='#ff8a00'" onmouseout="this.style.borderColor='#2a2a2a';this.style.color='#888'">Comprar por TikTok</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== SERVICIOS ===================== -->
  <div id="sec-servicios" class="section" style="padding-top:100px;min-height:100vh;">
    <div style="max-width:1100px;margin:0 auto;padding:0 24px 80px;">
      <div style="text-align:center;margin-bottom:60px;">
        <div class="tag" style="background:rgba(255,138,0,0.1);color:#ff8a00;border:1px solid rgba(255,138,0,0.2);margin-bottom:16px;">Transparencia total</div>
        <h2 class="font-heading" style="font-size:40px;font-weight:700;letter-spacing:-2px;">SERVICIOS Y PRECIOS</h2>
        <p style="color:#888;margin-top:12px;">Sin sorpresas. Conoces el costo antes de confirmar.</p>
      </div>

      <div class="pricing-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:48px;">
        <div class="card-dark" style="padding:32px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,#ff8a00,#ffa033);"></div>
          <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;">Precio estándar</div>
          <div class="font-heading" style="font-size:48px;font-weight:700;color:#fff;">$1.99</div>
          <div style="color:#888;font-size:14px;margin-top:4px;">por libra</div>
          <div class="glow-line" style="margin:24px 0;"></div>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;">
            <li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#ccc;"><i data-lucide="check" style="width:16px;height:16px;color:#7CFC8A;flex-shrink:0;"></i>Envío desde EE.UU.</li>
            <li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#ccc;"><i data-lucide="check" style="width:16px;height:16px;color:#7CFC8A;flex-shrink:0;"></i>Rastreo en tiempo real</li>
            <li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#ccc;"><i data-lucide="check" style="width:16px;height:16px;color:#7CFC8A;flex-shrink:0;"></i>Soporte por chat</li>
          </ul>
        </div>
        <div class="card-dark" style="padding:32px;position:relative;overflow:hidden;border-color:rgba(255,138,0,0.3);box-shadow:0 0 40px rgba(255,138,0,0.05);">
          <div style="position:absolute;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,#ff8a00,#ff6b00);"></div>
          <div style="position:absolute;top:16px;right:16px;" class="tag" style="background:#ff8a00;color:#000;font-weight:700;">POPULAR</div>
          <div style="font-size:12px;color:#ff8a00;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;">Compra por link</div>
          <div class="font-heading" style="font-size:48px;font-weight:700;color:#ff8a00;">$1.80</div>
          <div style="color:#888;font-size:14px;margin-top:4px;">por libra</div>
          <div class="glow-line" style="margin:24px 0;"></div>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;">
            <li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#ccc;"><i data-lucide="check" style="width:16px;height:16px;color:#7CFC8A;flex-shrink:0;"></i>Todo lo del plan estándar</li>
            <li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#ccc;"><i data-lucide="check" style="width:16px;height:16px;color:#7CFC8A;flex-shrink:0;"></i>Compramos por ti en TikTok</li>
            <li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#ccc;"><i data-lucide="check" style="width:16px;height:16px;color:#7CFC8A;flex-shrink:0;"></i>$0.19 de ahorro/libra</li>
            <li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#ccc;"><i data-lucide="check" style="width:16px;height:16px;color:#7CFC8A;flex-shrink:0;"></i>Verificación de producto</li>
          </ul>
        </div>
        <div class="card-dark" style="padding:32px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,#c0c0c0,#888);"></div>
          <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px;">Recogida en puerta</div>
          <div class="font-heading" style="font-size:48px;font-weight:700;color:#fff;">$2.30</div>
          <div style="color:#888;font-size:14px;margin-top:4px;">por libra</div>
          <div class="glow-line" style="margin:24px 0;"></div>
          <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;">
            <li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#ccc;"><i data-lucide="check" style="width:16px;height:16px;color:#7CFC8A;flex-shrink:0;"></i>Todo lo del plan estándar</li>
            <li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#ccc;"><i data-lucide="check" style="width:16px;height:16px;color:#7CFC8A;flex-shrink:0;"></i>Entrega en tu puerta</li>
            <li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#ccc;"><i data-lucide="check" style="width:16px;height:16px;color:#7CFC8A;flex-shrink:0;"></i>Máxima conveniencia</li>
          </ul>
        </div>
      </div>

      <div class="card-dark" style="padding:40px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
          <div style="width:32px;height:32px;background:rgba(255,138,0,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <i data-lucide="box" style="width:16px;height:16px;color:#ff8a00;"></i>
          </div>
          <h3 class="font-heading" style="font-size:20px;font-weight:600;letter-spacing:-0.5px;">Precios de Cajas</h3>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;" class="form-2col">
          <div style="background:#0f0f0f;border-radius:12px;padding:24px;border:1px solid #222;text-align:center;">
            <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Pequeña</div>
            <div style="font-size:13px;color:#ccc;margin-top:8px;">12×12×12</div>
            <div style="font-size:13px;color:#888;">Hasta 60 lb</div>
            <div class="font-heading" style="font-size:32px;font-weight:700;color:#ff8a00;margin-top:16px;">$45</div>
          </div>
          <div style="background:#0f0f0f;border-radius:12px;padding:24px;border:1px solid #222;text-align:center;">
            <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Mediana</div>
            <div style="font-size:13px;color:#ccc;margin-top:8px;">15×15×15</div>
            <div style="font-size:13px;color:#888;">Hasta 100 lb</div>
            <div class="font-heading" style="font-size:32px;font-weight:700;color:#ff8a00;margin-top:16px;">$65</div>
          </div>
          <div style="background:#0f0f0f;border-radius:12px;padding:24px;border:1px solid #222;text-align:center;">
            <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Grande</div>
            <div style="font-size:13px;color:#ccc;margin-top:8px;">16×16×16</div>
            <div style="font-size:13px;color:#888;">Hasta 100 lb</div>
            <div class="font-heading" style="font-size:32px;font-weight:700;color:#ff8a00;margin-top:16px;">$85</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;" class="form-2col">
        <div class="card-dark" style="padding:32px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
            <div style="width:32px;height:32px;background:rgba(255,138,0,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;">
              <i data-lucide="alert-triangle" style="width:16px;height:16px;color:#ffd166;"></i>
            </div>
            <h3 class="font-heading" style="font-size:16px;font-weight:600;">Fee / Arancel</h3>
          </div>
          <div style="color:#ccc;font-size:14px;line-height:1.8;">
            <div>• Equipos eléctricos: <strong style="color:#ffd166;">$15 - $35</strong> adicional</div>
            <div>• Paquetes +200 lb: <strong style="color:#ffd166;">$45</strong> adicional</div>
            <div>• Varía según tipo de equipo</div>
          </div>
        </div>
        <div class="card-dark" style="padding:32px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
            <div style="width:32px;height:32px;background:rgba(255,138,0,0.1);border-radius:8px;display:flex;align-items:center;justify-content:center;">
              <i data-lucide="zap" style="width:16px;height:16px;color:#7CFC8A;"></i>
            </div>
            <h3 class="font-heading" style="font-size:16px;font-weight:600;">Productos que manejamos</h3>
          </div>
          <div style="color:#ccc;font-size:14px;line-height:1.8;">
            <div>• Baterías e inversores</div>
            <div>• Sistemas solares</div>
            <div>• Equipos eléctricos</div>
            <div>• Y mucho más...</div>
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-top:48px;">
        <button class="btn-primary" onclick="switchSection('tienda')" style="padding:18px 48px;font-size:15px;">
          <i data-lucide="shopping-bag" style="width:18px;height:18px;"></i>
          Solicitar Compra Ahora
        </button>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer style="border-top:1px solid #1a1a1a;padding:40px 24px;">
    <div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:28px;height:28px;background:#ff8a00;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="font-family:'Geist';font-weight:700;color:#000;font-size:13px;">C</span>
        </div>
        <span class="font-heading" style="font-weight:600;font-size:14px;color:#888;">CHAMBATINA</span>
      </div>
      <div style="color:#555;font-size:12px;">© 2025 Chambatina. Todos los derechos reservados.</div>
      <div style="display:flex;gap:16px;">
        <a href="#" style="color:#555;transition:color 0.3s;" onmouseover="this.style.color='#ff8a00'" onmouseout="this.style.color='#555'"><i data-lucide="instagram" style="width:18px;height:18px;"></i></a>
        <a href="#" style="color:#555;transition:color 0.3s;" onmouseover="this.style.color='#ff8a00'" onmouseout="this.style.color='#555'"><i data-lucide="message-circle" style="width:18px;height:18px;"></i></a>
        <a href="#" style="color:#555;transition:color 0.3s;" onmouseover="this.style.color='#ff8a00'" onmouseout="this.style.color='#555'"><i data-lucide="send" style="width:18px;height:18px;"></i></a>
      </div>
    </div>
  </footer>


  <script>
    // ======== INIT ========
    lucide.createIcons();

    // ======== PRODUCTS DATA ========
    const products = [
      { id:1, name:"Mini Inversor 1000W", cat:"solar", price:"$89.99", sold:"12.4K", img:"inversor1000", hot:true },
      { id:2, name:"Batería LiFePO4 12V 50Ah", cat:"solar", price:"$129.99", sold:"8.7K", img:"bateria-lipo", hot:true },
      { id:3, name:"Panel Solar Portátil 60W", cat:"solar", price:"$54.99", sold:"6.2K", img:"panel-solar-60", hot:false },
      { id:4, name:"Cargador Inalámbrico 3en1", cat:"tech", price:"$19.99", sold:"24.1K", img:"cargador-wireless", hot:true },
      { id:5, name:"AirPods Pro Max Replica", cat:"tech", price:"$34.99", sold:"18.9K", img:"airpods-max", hot:true },
      { id:6, name:"Lámpara LED Inteligente WiFi", cat:"home", price:"$14.99", sold:"31.5K", img:"lampara-led-wifi", hot:false },
      { id:7, name:"Mini Proyector 4K WiFi", cat:"tech", price:"$64.99", sold:"9.3K", img:"mini-proyector", hot:true },
      { id:8, name:"Banda de Resistencia Set 5pcs", cat:"fitness", price:"$11.99", sold:"15.8K", img:"bandas-resistencia", hot:false },
      { id:9, name:"Controlador de Carga Solar 30A", cat:"solar", price:"$24.99", sold:"5.1K", img:"controlador-solar", hot:false },
      { id:10, name:"Smart Watch Sport Pro", cat:"tech", price:"$29.99", sold:"42.3K", img:"smartwatch-sport", hot:true },
      { id:11, name:"Organizador de Cables Magnético", cat:"home", price:"$8.99", sold:"27.6K", img:"organizador-cables", hot:false },
      { id:12, name:"Mancuernas Ajustables 24kg", cat:"fitness", price:"$79.99", sold:"7.4K", img:"mancuernas-ajustables", hot:true },
    ];

    function renderProducts(filter = 'all') {
      const grid = document.getElementById('productsGrid');
      const filtered = filter === 'all' ? products : products.filter(p => p.cat === filter);

      grid.innerHTML = filtered.map((p, i) => `
        <div class="product-card" style="animation:fadeUp 0.4s ease-out ${i * 0.06}s both;">
          <div class="img-wrap">
            <img src="https://picsum.photos/seed/${p.img}/500/500.jpg" alt="${p.name}" loading="lazy">
            <div class="soon-overlay">
              <div class="soon-badge">Soon</div>
            </div>
            ${p.hot ? `<div class="fire-badge">🔥 Hot</div>` : ''}
            <div class="sold-count">${p.sold} vendidos</div>
          </div>
          <div style="padding:16px;">
            <div style="font-size:13px;color:#ccc;font-weight:500;line-height:1.4;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.name}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div class="font-heading" style="font-size:20px;font-weight:700;color:#ff8a00;">${p.price}</div>
              <div style="width:32px;height:32px;border-radius:8px;background:#1a1a1a;border:1px solid #2a2a2a;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s;" onmouseover="this.style.borderColor='#ff8a00';this.style.background='rgba(255,138,0,0.1)'" onmouseout="this.style.borderColor='#2a2a2a';this.style.background='#1a1a1a'" onclick="showToast('Pronto podrás pedir este producto','info')">
                <i data-lucide="heart" style="width:14px;height:14px;color:#888;"></i>
              </div>
            </div>
            <div style="margin-top:10px;padding-top:10px;border-top:1px solid #1a1a1a;display:flex;align-items:center;gap:6px;">
              <div style="display:flex;gap:1px;">
                ${'★'.repeat(5).split('').map((_, si) => `<span style="font-size:10px;color:${si < 4 ? '#ff8a00' : '#333'};">★</span>`).join('')}
              </div>
              <span style="font-size:11px;color:#666;">${(4 + Math.random() * 0.8).toFixed(1)}</span>
            </div>
          </div>
        </div>
      `).join('');

      lucide.createIcons();
    }

    function filterProducts(cat, btn) {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.style.background = '#1a1a1a';
        b.style.color = '#888';
        b.style.border = '1px solid #2a2a2a';
      });
      btn.style.background = '#ff8a00';
      btn.style.color = '#000';
      btn.style.border = '1px solid #ff8a00';
      renderProducts(cat);
    }

    // ======== COUNTDOWN ========
    function startCountdown() {
      const target = new Date();
      target.setDate(target.getDate() + 7);
      target.setHours(target.getHours() + 14);
      target.setMinutes(target.getMinutes() + 32);

      function update() {
        const now = new Date();
        let diff = target - now;
        if (diff < 0) diff = 0;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
        document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
        document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
        document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
      }

      update();
      setInterval(update, 1000);
    }
    startCountdown();
    renderProducts();

    // ======== NAVIGATION ========
    function switchSection(id) {
      document.querySelectorAll('.section').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
      const target = document.getElementById('sec-' + id);
      if (target) { target.classList.add('active'); target.style.display = 'block'; }
      document.querySelectorAll('.nav-link[data-nav]').forEach(n => {
        n.classList.remove('active');
        if (n.dataset.nav === 'showsoon') n.style.color = '#888';
      });
      const navEl = document.querySelector(`.nav-link[data-nav="${id}"]`);
      if (navEl) {
        navEl.classList.add('active');
        if (id === 'showsoon') navEl.style.color = '#ff8a00';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      lucide.createIcons();
    }

    // ======== MOBILE MENU ========
    function openMobile() { document.getElementById('mobileMenu').classList.add('open'); }
    function closeMobile() { document.getElementById('mobileMenu').classList.remove('open'); }

    // ======== TOAST ========
    function showToast(msg, type = 'info') {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = 'toast ' + type + ' show';
      setTimeout(() => t.classList.remove('show'), 3500);
    }

    // ======== NOTIFY ========
    function subscribeNotify() {
      const email = document.getElementById('notifyEmail').value.trim();
      if (!email || !email.includes('@')) {
        showToast('Introduce un correo válido', 'error');
        return;
      }
      showToast('¡Te notificaremos cuando lance! 🔔', 'success');
      document.getElementById('notifyEmail').value = '';
    }

    // ======== RASTREO ========
    async function buscar() {
      const codigo = document.getElementById('codigo').value.trim();
      const resultado = document.getElementById('resultado');
      if (!codigo) {
        resultado.innerHTML = '<span style="color:#ff6b6b;font-size:14px;">Debes escribir un código</span>';
        return;
      }
      const cpk = codigo.replace(/\D/g, "");
      resultado.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><div class="typing-dots"><span></span><span></span><span></span></div><span style="color:#888;font-size:14px;">Buscando...</span></div>`;
      try {
        const res = await fetch("https://rastreador-tj5b.onrender.com/api/rastreo/" + cpk);
        const data = await res.json();
        if (data.ok) {
          resultado.innerHTML = `<div style="width:100%;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div style="width:8px;height:8px;border-radius:50%;background:#7CFC8A;"></div><span style="color:#7CFC8A;font-weight:600;font-size:14px;">${data.saludo || ("Estado: " + data.estado)}</span></div><div class="glow-line" style="margin-bottom:12px;"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;"><div><span style="color:#888;">Código:</span> <span style="color:#fff;">${codigo}</span></div><div><span style="color:#888;">Fecha:</span> <span style="color:#fff;">${data.fecha || "No disponible"}</span></div></div>${data.descripcion ? `<div style="margin-top:12px;padding:12px;background:#111;border-radius:8px;font-size:13px;color:#ccc;border:1px solid #222;">${data.descripcion}</div>` : ''}</div>`;
        } else {
          resultado.innerHTML = `<div style="width:100%;text-align:center;"><div style="font-size:32px;margin-bottom:8px;">📦</div><span style="color:#ffd166;font-size:14px;">${data.mensaje || "No encontrado"}</span><div style="color:#555;font-size:12px;margin-top:4px;">Verifica que el código sea correcto</div></div>`;
        }
      } catch (e) {
        resultado.innerHTML = `<div style="width:100%;text-align:center;"><div style="font-size:32px;margin-bottom:8px;">⚠️</div><span style="color:#ff6b6b;font-size:14px;">No hay conexión con el servidor</span><div style="color:#555;font-size:12px;margin-top:4px;">Intenta de nuevo en unos minutos</div></div>`;
      }
    }

    document.getElementById('codigo')?.addEventListener('keydown', function(e) { if (e.key === 'Enter') buscar(); });

    // ======== FILE UPLOAD ========
    function handleFileUpload(input) {
      const file = input.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { showToast('La imagen no puede superar 5MB', 'error'); input.value = ''; return; }
      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('uploadPreview').innerHTML = `<div style="position:relative;display:inline-block;"><img src="${e.target.result}" style="max-height:120px;border-radius:8px;"><button type="button" onclick="event.stopPropagation();removeUpload()" style="position:absolute;top:-8px;right:-8px;width:24px;height:24px;border-radius:50%;background:#ff6b6b;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-size:14px;font-weight:bold;line-height:1;">×</span></button></div><div style="color:#7CFC8A;font-size:12px;margin-top:8px;">${file.name}</div>`;
      };
      reader.readAsDataURL(file);
    }

    function removeUpload() {
      document.getElementById('productoImg').value = '';
      document.getElementById('uploadPreview').innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;"><i data-lucide="image-plus" style="width:32px;height:32px;color:#555;margin-bottom:12px;"></i><div style="color:#888;font-size:14px;">Haz clic para subir imagen</div><div style="color:#555;font-size:12px;margin-top:4px;">PNG, JPG hasta 5MB</div></div>`;
      lucide.createIcons();
    }

    // ======== DESTINATARIO TOGGLE ========
    function toggleDestinatario() {
      document.getElementById('destFields').style.display = document.getElementById('mismoDest').checked ? 'none' : 'block';
    }

    // ======== ENVIAR COMPRA ========
    function enviarCompra(e) {
      e.preventDefault();
      const link = document.getElementById('tiktokLink').value.trim();
      const nombre = document.getElementById('clientNombre').value.trim();
      const email = document.getElementById('clientEmail').value.trim();
      const tel = document.getElementById('clientTel').value.trim();
      const ci = document.getElementById('clientCI').value.trim();
      const dir = document.getElementById('direccion').value.trim();
      if (!link || !nombre || !email || !tel || !ci || !dir) { showToast('Completa todos los campos obligatorios', 'error'); return; }
      if (!link.includes('tiktok')) { showToast('El link debe ser de TikTok', 'error'); return; }
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span> Enviando...';
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send" style="width:18px;height:18px;"></i> Enviar Solicitud de Compra';
        lucide.createIcons();
        showToast('¡Solicitud enviada con éxito! Te contactaremos pronto.', 'success');
        e.target.reset();
        removeUpload();
        document.getElementById('destFields').style.display = 'none';
        document.getElementById('mismoDest').checked = true;
      }, 2000);
    }

    // ======== IA CHAT ========
    const knowledgeBase = [
      { keywords: ['precio', 'libra', 'cuánto cuesta', 'costo', 'tarifa', 'vale'], response: `💰 <strong>Precios por libra:</strong><br><br>• <strong>Estándar:</strong> $1.99/libra<br>• <strong>Compra por nuestros links:</strong> $1.80/libra<br>• <strong>Recogida en puerta:</strong> $2.30/libra<br><br>El precio más económico es cuando nos das el link de TikTok y nosotros compramos por ti.` },
      { keywords: ['tiempo', 'tarda', 'días', 'cuánto demora', 'llega', 'esperar'], response: `⏱️ <strong>Tiempo estimado de entrega:</strong><br><br>Entre <strong>18 y 30 días hábiles</strong> una vez que el paquete toca puerto en Cuba.<br><br>El tiempo puede variar según el volumen de envíos y procesos aduanales.` },
      { keywords: ['caja', 'cajas', 'embalaje', 'box'], response: `📦 <strong>Precios de cajas:</strong><br><br>• <strong>12×12×12</strong> (hasta 60 lb) → $45<br>• <strong>15×15×15</strong> (hasta 100 lb) → $65<br>• <strong>16×16×16</strong> (hasta 100 lb) → $85` },
      { keywords: ['fee', 'arancel', 'impuesto', 'adicional', 'extra', 'equipo', 'pesado'], response: `⚠️ <strong>Fee / Arancel adicional:</strong><br><br>• Equipos eléctricos: <strong>$15 - $35</strong> según el tipo<br>• Paquetes de más de 200 lb: <strong>$45</strong> adicional` },
      { keywords: ['producto', 'productos', 'comprar', 'qué', 'pueden', 'manejan', 'tipo'], response: `🛒 <strong>Productos que manejamos:</strong><br><br>• Baterías e inversores<br>• Sistemas solares<br>• Equipos eléctricos<br>• Ropa y calzado<br>• Electrónica<br>• Y mucho más...` },
      { keywords: ['tiktok', 'compra', 'pedir', 'solicitar', 'link', 'cómo'], response: `🛍️ <strong>¿Cómo hacer una compra por TikTok?</strong><br><br>1. Ve a la sección <strong>"Tienda"</strong><br>2. Pega el <strong>link del producto de TikTok</strong><br>3. Agrega descripción (color, talla, modelo)<br>4. Completa tus datos<br>5. Indica dirección de entrega<br>6. ¡Envía la solicitud!` },
      { keywords: ['rastrear', 'rastreo', 'código', 'cpk', 'seguir', 'estado', 'dónde está'], response: `🔍 <strong>¿Cómo rastrear tu paquete?</strong><br><br>1. Ve a la sección <strong>"Rastreo"</strong><br>2. Introduce tu <strong>código CPK</strong><br>3. Haz clic en <strong>"Buscar"</strong><br>4. Verás el estado actualizado` },
      { keywords: ['show soon', 'showsoon', 'tienda digital', 'próximamente', 'soon', 'vendido'], response: `🔥 <strong>¿Qué es Show Soon Digital?</strong><br><br>Es nuestra próxima tienda digital donde podrás ver los <strong>productos más vendidos de TikTok</strong> con sus precios y pedirlos directamente a través de Chambatina.<br><br>Está en fase de lanzamiento. Puedes ir a la sección <strong>"Show Soon"</strong> para ver los productos quetendremos y dejarnos tu correo para notificarte cuando esté lista.` },
      { keywords: ['hola', 'hey', 'buenas', 'buenos', 'saludos'], response: `¡Hola! 👋 Soy el asistente de <strong>Chambatina</strong>. ¿En qué puedo ayudarte hoy?` },
      { keywords: ['gracias', 'genial', 'perfecto', 'ok', 'entiendo'], response: `¡De nada! 😊 Si tienes alguna otra duda, no dudes en preguntar. <strong>¡Confía en Chambatina!</strong>` }
    ];

    function getAIResponse(msg) {
      const lower = msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      let bestMatch = null, bestScore = 0;
      for (const entry of knowledgeBase) {
        let score = 0;
        for (const kw of entry.keywords) {
          if (lower.includes(kw.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) score++;
        }
        if (score > bestScore) { bestScore = score; bestMatch = entry; }
      }
      if (bestMatch && bestScore > 0) return bestMatch.response;
      return `🤔 No tengo una respuesta exacta para eso, pero puedo ayudarte con:<br><br>• <strong>Precios</strong> por libra y cajas<br>• <strong>Tiempos</strong> de entrega<br>• <strong>Fee/arancel</strong> para equipos<br>• <strong>Compras</strong> por TikTok<br>• <strong>Show Soon Digital</strong><br>• <strong>Rastreo</strong> de paquetes<br><br>Intenta preguntar sobre alguno de estos temas.`;
    }

    function sendChat() {
      const input = document.getElementById('chatInput');
      const msg = input.value.trim();
      if (!msg) return;
      const container = document.getElementById('chatMessages');
      container.innerHTML += `<div class="chat-bubble user">${escapeHtml(msg)}</div>`;
      input.value = '';
      container.scrollTop = container.scrollHeight;
      const typingId = 'typing-' + Date.now();
      container.innerHTML += `<div id="${typingId}" class="chat-bubble bot"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
      container.scrollTop = container.scrollHeight;
      setTimeout(() => {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        container.innerHTML += `<div class="chat-bubble bot">${getAIResponse(msg)}</div>`;
        container.scrollTop = container.scrollHeight;
      }, 800 + Math.random() * 800);
    }

    function quickChat(msg) { document.getElementById('chatInput').value = msg; sendChat(); }
    function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

    // ======== SERVICE WORKER ========
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js").catch(console.error);
    }
  </script>
</body>
</html>
