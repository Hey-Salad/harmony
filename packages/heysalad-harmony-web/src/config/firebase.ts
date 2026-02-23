// Stub Firebase - no real initialization to avoid network errors in demo mode
// Firebase is NOT used in the public landing page

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

console.warn('⚠️ Firebase disabled - running in demo mode');

export { auth, db, storage, analytics };
export default app;