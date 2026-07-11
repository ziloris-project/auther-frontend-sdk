import { STYLES } from '../styles';

export class UIDom {
    private overlayId = 'auther-overlay';
    public overlay: HTMLElement | null = null;
    public container: HTMLElement | null = null;
    public contentWrapper: HTMLElement | null = null;

    public injectStyles(): void {
        if (document.getElementById('auther-styles')) return;
        console.log("Auther: Injecting premium styles...");
        const styleSheet = document.createElement('style');
        styleSheet.id = 'auther-styles';
        styleSheet.type = 'text/css';
        styleSheet.innerText = STYLES + `
            /* Safety Overrides */
            #auther-overlay { display: flex !important; visibility: visible !important; }
            .auther-modal { 
                display: block !important; 
                transition: height 0.3s cubic-bezier(0.19, 1, 0.22, 1); /* Smooth Height Resize */
            }
            #auther-content-wrapper {
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    public createOverlay(onClose: () => void): void {
        const existing = document.getElementById(this.overlayId);
        if (existing) {
            console.log("Auther: Reusing existing overlay");
            this.overlay = existing;
            this.container = existing.querySelector('.auther-modal');
            this.contentWrapper = existing.querySelector('#auther-content-wrapper');
            return;
        }

        console.log("Auther: Creating new overlay");
        this.overlay = document.createElement('div');
        this.overlay.id = this.overlayId;

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) onClose();
        });

        this.container = document.createElement('div');
        this.container.className = 'auther-modal';
        this.container.style.height = 'auto';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'auther-close-btn';
        closeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        closeBtn.onclick = onClose;
        this.container.appendChild(closeBtn);

        this.contentWrapper = document.createElement('div');
        this.contentWrapper.id = 'auther-content-wrapper';
        this.container.appendChild(this.contentWrapper);

        this.overlay.appendChild(this.container);
        document.body.appendChild(this.overlay);
    }

    public open(): void {
        if (this.overlay && !document.body.contains(this.overlay)) {
            document.body.appendChild(this.overlay);
        }
        requestAnimationFrame(() => {
            if (this.overlay) {
                this.overlay.classList.add('open');
            }
        });
    }

    public close(): void {
        if (this.overlay) {
            this.overlay.classList.remove('open');
        }
    }
}
