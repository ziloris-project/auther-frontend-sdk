import { AuthCallback, AuthUser, ProjectConfig, ViewState } from './core/types';
import { ApiClient } from './api/client';
import { UIDom } from './ui/dom';
import { renderForm } from './ui/templates';

export class Auther {
    private dom: UIDom;
    private api: ApiClient;

    private state: ViewState = 'login';
    private isAnimating = false;
    private config: ProjectConfig | null = null;

    // Callbacks
    private authCallbacks: AuthCallback[] = [];
    private onAuthCallback: AuthCallback | null = null;
    private refreshTimer: ReturnType<typeof setTimeout> | null = null;
    private refreshing: Promise<AuthUser | null> | null = null;
    private visibilityHandler = () => {
        if (document.visibilityState === 'visible') {
            this.refreshIfNeeded();
        }
    };

    constructor() {
        this.dom = new UIDom();
        // Initialize an empty API client to be configured by init()
        this.api = new ApiClient('https://OAutherbackend.ziloris.com/api/v1', '');

        if (typeof window !== 'undefined') {
            this.dom.injectStyles();
            this.dom.createOverlay(() => this.close());
        }
    }

    public init({ clientId, endpoint, onAuth }: { clientId: string; endpoint?: string; onAuth?: AuthCallback }): void {
        const activeEndpoint = endpoint || 'https://OAutherbackend.ziloris.com/api/v1';
        this.api = new ApiClient(activeEndpoint, clientId);
        if (onAuth) this.onAuthCallback = onAuth;

        console.log(`Auther: Initialized with Client ID: ${clientId}`);

        this.checkForSyncPayload();
        this.armRefresh(this.api.getUser());
        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
            document.addEventListener('visibilitychange', this.visibilityHandler);
        }
        this.loadConfig();
    }

    private async loadConfig() {
        const config = await this.api.fetchConfig();
        if (config) {
            this.config = config;

            if (config.googleEnabled && config.googleClientId) {
                this.injectGoogleScript();
            }

            if (this.dom.overlay?.classList.contains('open')) {
                this.renderContent();
            }
        }
    }

    private injectGoogleScript() {
        if (typeof window === 'undefined') return;
        if (document.getElementById('gsi-client')) return;

        const script = document.createElement('script');
        script.id = 'gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }

    private checkForSyncPayload() {
        if (typeof window === 'undefined') return;

        const urlParams = new URLSearchParams(window.location.search);
        const syncPayload = urlParams.get('auther_sync');

        if (syncPayload) {
            try {
                const decoded = JSON.parse(atob(syncPayload));
                const authUser: AuthUser = {
                    id:               decoded.id,
                    email:            decoded.email,
                    accessToken:      decoded.accessToken,
                    expiresAt:        decoded.expiresAt,
                    refreshExpiresAt: decoded.refreshExpiresAt,
                };

                this.api.saveUser(authUser);
                this.armRefresh(authUser);
                this.notifyAuthChange(authUser);

                // Clean the URL
                const url = new URL(window.location.href);
                url.searchParams.delete('auther_sync');
                window.history.replaceState({}, document.title, url.pathname + url.search);
            } catch (err) {
                console.error('Auther: Failed to parse sync payload', err);
            }
        }
    }

    private handleOAuthMessage = (event: MessageEvent) => {
        // Only trust messages from the Auther backend origin. Without this,
        // any window (e.g. a malicious iframe or opener) could postMessage a
        // forged auth payload and hijack the session.
        if (event.origin !== this.api.getEndpointOrigin()) return;

        if (event.data && event.data.type === 'auther_oauth_sync') {
            const syncPayload = event.data.payload;
            try {
                const decoded = JSON.parse(atob(syncPayload));
                const authUser: AuthUser = {
                    id:               decoded.id,
                    email:            decoded.email,
                    accessToken:      decoded.accessToken,
                    expiresAt:        decoded.expiresAt,
                    refreshExpiresAt: decoded.refreshExpiresAt
                };

                this.api.saveUser(authUser);
                this.armRefresh(authUser);
                this.notifyAuthChange(authUser);
                this.close(); // Close the modal overlay cleanly.
            } catch (err) {
                console.error('Auther: Failed to parse OAuth popup sync payload', err);
            }
        }
    };

    // ─── Public API ───

    public getUser(): AuthUser | null {
        return this.api.getUser();
    }

    public getToken(): string | null {
        return this.api.getToken();
    }

    public async getFreshToken(): Promise<string | null> {
        if (this.api.needsRefresh()) {
            const refreshed = await this.refresh();
            return refreshed?.accessToken ?? null;
        }
        return this.api.getToken();
    }

    public async refresh(): Promise<AuthUser | null> {
        if (this.refreshing) return this.refreshing;

        this.refreshing = (async () => {
            const user = await this.api.refresh();
            this.armRefresh(user);
            this.notifyAuthChange(user);
            return user;
        })();

        try {
            return await this.refreshing;
        } finally {
            this.refreshing = null;
        }
    }

    public isAuthenticated(): boolean {
        return this.getUser() !== null;
    }

    public onAuthStateChange(callback: AuthCallback): () => void {
        this.authCallbacks.push(callback);
        callback(this.getUser());
        return () => {
            this.authCallbacks = this.authCallbacks.filter(cb => cb !== callback);
        };
    }

    public logout(): void {
        // Revoke the refresh cookie on the server (best-effort, non-blocking)
        // so the session is dead server-side, not just cleared locally.
        void this.api.serverLogout();
        this.api.clearUser();
        this.armRefresh(null);
        this.notifyAuthChange(null);
    }

    private armRefresh(user: AuthUser | null): void {
        if (this.refreshTimer) clearTimeout(this.refreshTimer);
        this.refreshTimer = null;

        if (!user || Date.now() > user.refreshExpiresAt) return;

        const delay = user.expiresAt - Date.now() - 60_000;
        if (delay <= 0) {
            this.refreshIfNeeded();
            return;
        }
        this.refreshTimer = setTimeout(() => this.refreshIfNeeded(), delay);
    }

    private refreshIfNeeded(): void {
        if (!this.api.needsRefresh()) return;
        void this.refresh();
    }

    private notifyAuthChange(user: AuthUser | null): void {
        if (this.onAuthCallback) this.onAuthCallback(user);
        this.authCallbacks.forEach(cb => cb(user));
    }

    // ─── UI Rendering ───

    private renderContent(): void {
        if (!this.dom.contentWrapper) return;
        this.dom.contentWrapper.innerHTML = renderForm(this.state, this.config);

        // Bind State Switcher
        const switchBtn = this.dom.contentWrapper.querySelector('.auther-link');
        switchBtn?.addEventListener('click', () => {
            const target = switchBtn.getAttribute('data-switch') as ViewState;
            this.switchState(target);
        });

        // Bind Social OAuth Buttons
        const socialBtns = this.dom.contentWrapper.querySelectorAll('.auther-btn-social');
        socialBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.getAttribute('data-provider');
                if (provider === 'google' && this.config?.googleClientId) {
                    if (typeof (window as any).google === 'undefined') {
                        return alert('Google authentication is still loading. Please try again.');
                    }

                    const originalText = btn.innerHTML;
                    btn.innerHTML = 'Authorizing...';
                    (btn as HTMLButtonElement).disabled = true;

                    const client = (window as any).google.accounts.oauth2.initCodeClient({
                        client_id: this.config.googleClientId,
                        scope: 'email profile',
                        ux_mode: 'popup',
                        callback: async (response: any) => {
                            if (response.error) {
                                btn.innerHTML = originalText;
                                (btn as HTMLButtonElement).disabled = false;
                                return;
                            }

                            try {
                                const user = await this.api.verifyOAuth('google', response.code);
                                console.log('Auther: OAuth Success', user);
                                this.api.saveUser(user);
                                this.armRefresh(user);
                                this.notifyAuthChange(user);
                                this.close();
                            } catch (err: any) {
                                console.error('Auther OAuth Error:', err);
                                alert(err.message || 'Authentication Failed');
                            } finally {
                                btn.innerHTML = originalText;
                                (btn as HTMLButtonElement).disabled = false;
                            }
                        }
                    });

                    client.requestCode();
                } else if (provider === 'github' && this.config?.githubClientId) {
                    // For GitHub, we can still use the backend redirect flow, or implement standard generic popup
                    // Wait, let's keep it clean: 
                    alert('GitHub OAuth is not fully configured for implicit frontend flow yet.');
                }
            });
        });

        // Listen for OAuth Popup Messages (Optional if keeping legacy flows)
        window.removeEventListener('message', this.handleOAuthMessage);
        window.addEventListener('message', this.handleOAuthMessage);

        // Bind Real Form
        const form = this.dom.contentWrapper.querySelector('form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
            const passInput = form.querySelector('input[type="password"]') as HTMLInputElement;
            if (!emailInput || !passInput) return;

            const data = {
                email: emailInput.value,
                password: passInput.value
            };

            const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            const originalText = btn.innerText;
            btn.innerText = 'Verifying...';
            btn.disabled = true;

            try {
                const user = await this.api.authenticate(this.state, data);
                console.log('Auther: Success', user);
                this.api.saveUser(user);
                this.armRefresh(user);
                this.notifyAuthChange(user);
                this.close();
            } catch (err: any) {
                console.error('Auther Error:', err);
                alert(err.message);
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    // ─── Direct Mounting & Actions ───

    public mount(elementOrSelector: string | HTMLElement): void {
        const el = typeof elementOrSelector === 'string'
            ? document.querySelector(elementOrSelector) as HTMLElement
            : elementOrSelector;

        if (el) {
            el.addEventListener('click', () => {
                this.state = 'login';
                this.renderContent();
                this.open();
            });
        }
    }

    public login(): void {
        this.toggleModal('login');
    }

    public signup(): void {
        this.toggleModal('signup');
    }

    private toggleModal(targetState: ViewState): void {
        if (!this.dom.overlay || !this.dom.overlay.classList.contains('open')) {
            this.state = targetState;
            this.renderContent();
            this.open();
            return;
        }
        this.switchState(targetState);
    }

    public open(): void {
        if (!this.dom.overlay) this.dom.createOverlay(() => this.close());
        this.dom.open();
    }

    public close(): void {
        this.dom.close();
    }

    private switchState(newState: ViewState): void {
        if (this.state === newState || this.isAnimating) return;
        if (!this.dom.contentWrapper || !this.dom.container) return;

        this.isAnimating = true;

        const currentHeight = this.dom.container.offsetHeight;
        this.dom.container.style.height = `${currentHeight}px`;

        this.dom.contentWrapper.style.opacity = '0';
        this.dom.contentWrapper.style.transform = 'scale(0.98)';

        setTimeout(() => {
            this.state = newState;
            this.renderContent();

            this.dom.container!.style.height = 'auto';

            this.dom.contentWrapper!.style.opacity = '1';
            this.dom.contentWrapper!.style.transform = 'scale(1)';

            this.isAnimating = false;
        }, 200);
    }
}

declare global {
    interface Window { Auther: Auther; }
}

export type { AuthUser } from './core/types';

const auther = new Auther();
if (typeof window !== 'undefined') window.Auther = auther;
export default auther;
