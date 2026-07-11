
export const STYLES = `
:root {
  /* Ultra-Premium Palette */
  --auther-bg: #ffffff;
  --auther-text-main: #111827; /* Cool black */
  --auther-text-sub: #6b7280;   /* Cool gray */
  --auther-accent: #0f172a;     /* Deep navy/black */
  --auther-accent-hover: #000000;
  
  --auther-border: rgba(0, 0, 0, 0.08);
  --auther-glass-border: rgba(255, 255, 255, 0.8);
  --auther-input-bg: #f9fafb;
  --auther-surface: #ffffff;
  
  --auther-shadow-1: 0 0 0 1px rgba(0,0,0,0.03);
  --auther-shadow-2: 0 4px 12px rgba(0,0,0,0.04);
  --auther-shadow-3: 0 16px 40px -8px rgba(0,0,0,0.12);
  
  --auther-radius-outer: 24px;
  --auther-radius-inner: 12px;
  
  /* Physics */
  --auther-ease: cubic-bezier(0.19, 1, 0.22, 1); /* "Expo" curve for luxury feel */
}

/* --- Container Reset --- */
.auther-modal *, .auther-modal *::before, .auther-modal *::after {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#auther-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: -1; /* Default to behind everything */
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
  
  /* Cinematic Backdrop */
  background: radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s var(--auther-ease), z-index 0s linear 0.5s; /* Delay z-index hide */
}

#auther-overlay.open {
  opacity: 1;
  pointer-events: all;
  z-index: 999999; /* Bring to front */
  transition: opacity 0.5s var(--auther-ease), z-index 0s linear 0s; /* Instant z-index show */
}

/* --- The 10k Card --- */
.auther-modal {
  width: 100%;
  max-width: 420px;
  background: var(--auther-bg);
  border-radius: var(--auther-radius-outer);
  
  /* Material Construction */
  box-shadow: 
    var(--auther-shadow-1), 
    var(--auther-shadow-2), 
    var(--auther-shadow-3),
    inset 0 1px 1px rgba(255,255,255,1); /* Rim Light */
    
  padding: 40px;
  position: relative;
  overflow: hidden;
  
  /* Entrance Animation State */
  transform: scale(0.94) translateY(12px);
  opacity: 0;
  transition: 
    transform 0.6s var(--auther-ease), 
    opacity 0.4s ease,
    height 0.4s var(--auther-ease); /* Smooth resize */
}

#auther-overlay.open .auther-modal {
  transform: scale(1) translateY(0);
  opacity: 1;
}

/* --- Decoration: Top Prism Bar --- */
/* A subtle gradien bar that hints at "premium" status */
.auther-modal::after {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
  opacity: 0.5;
}

/* --- Typography --- */
.auther-header {
  text-align: center;
  margin-bottom: 32px;
}

.auther-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--auther-text-main);
  letter-spacing: -0.03em;
  margin: 0 0 10px 0;
}

.auther-subtitle {
  font-size: 0.95rem;
  color: var(--auther-text-sub);
  font-weight: 450;
  line-height: 1.5;
  margin: 0;
}

/* --- Inputs: The "Chiseled" Look --- */
.auther-input-group {
  margin-bottom: 14px;
  position: relative;
}

.auther-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  background: var(--auther-input-bg);
  border: 1px solid transparent;
  border-radius: var(--auther-radius-inner);
  font-size: 0.95rem;
  color: var(--auther-text-main);
  transition: all 0.2s ease;
  
  /* Inner shadow for depth */
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
}

.auther-input:focus {
  outline: none;
  background: #fff;
  border-color: rgba(0,0,0,0.1);
  box-shadow: 
    0 4px 12px rgba(0,0,0,0.03), 
    0 0 0 2px rgba(0,0,0,0.05); /* Focus Ring */
    transform: translateY(-1px);
}
.auther-input::placeholder { color: #9ca3af; }

/* --- Action Buttons --- */
.auther-btn-primary {
  width: 100%;
  height: 50px;
  background: var(--auther-accent);
  color: white;
  border: none;
  border-radius: var(--auther-radius-inner);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  
  /* Subtle lighting on button */
  box-shadow: 
    0 1px 2px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.1);
}

.auther-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  background: var(--auther-accent-hover);
}
.auther-btn-primary:active {
  transform: scale(0.98);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Social Buttons */
.auther-social-stack {
  display: flex !important;
  flex-direction: column;
  gap: 12px;
  margin-top: 0px;
  margin-bottom: 24px;
}

.auther-btn-social {
  width: 100%;
  height: 46px;
  background: #fff;
  border: 1px solid var(--auther-border);
  border-radius: 12px;
  color: var(--auther-text-main);
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.auther-btn-social:hover {
  background: #fdfdfd;
  border-color: #d1d5db;
  transform: translateY(-0.5px);
}
.auther-btn-social:active { transform: scale(0.99); }

/* --- Divider --- */
.auther-divider {
  display: flex; 
  align-items: center; 
  margin: 32px 0;
  font-size: 12px; 
  color: #a3a3a3; 
  font-weight: 600; 
  letter-spacing: 0.05em; 
  text-transform: uppercase;
}
.auther-divider::before, .auther-divider::after {
  content: ""; flex: 1; height: 1px; background: #e5e7eb;
}
.auther-divider span { padding: 0 16px; }

/* --- Close Button --- */
.auther-close-btn {
  position: absolute;
  top: 24px; right: 24px;
  width: 32px; height: 32px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #9ca3af;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.auther-close-btn:hover {
  background: rgba(0,0,0,0.03);
  color: var(--auther-text-main);
}

/* --- Footer --- */
.auther-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 0.9rem;
  color: var(--auther-text-sub);
}
.auther-link {
  color: var(--auther-text-main);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  margin-left: 4px;
}
.auther-link:hover { text-decoration: underline; }

/* --- Transition Essentials --- */
#auther-content-wrapper {
  /* This ensures the content morphs smoothly */
  transition: opacity 0.3s ease;
}

.auther-fade-out {
  opacity: 0;
  transform: scale(0.98);
  pointer-events: none;
}
.auther-fade-in {
  opacity: 1;
  transform: scale(1);
}
`;
