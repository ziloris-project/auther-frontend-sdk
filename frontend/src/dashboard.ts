/**
 * Dashboard utilities entry point.
 *
 * Import from 'auther-sdk/dashboard' in the Auther dashboard frontend.
 * This module is NOT part of the customer-facing browser bundle.
 */

export { apiFetch }                       from './dashboard/apiFetch';
export { setExpiresAt, clearSession, callRefresh, getExpiresAt } from './dashboard/session';
