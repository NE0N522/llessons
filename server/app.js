const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { openDatabase } = require('./db');
const { getConfig } = require('./config');
const { attachSession, requireJsonAndOrigin } = require('./auth');
const { HttpError } = require('./lib/errors');
const { createAuthRouter } = require('./routes/auth');
const { createTeacherRouter } = require('./routes/teacher');
const { createStudentRouter } = require('./routes/student');

const TOP_LEVEL_FILES = new Set([
  'index.html','lesson-view.html','lesson-01.html','reference.html','check.html','privacy.html',
  'login.html','change-password.html','style.css','site.css','offline-service-worker.js'
]);
const PUBLIC_DIRECTORIES = new Set(['assets','css','examples','teacher','student','docs']);
const BLOCKED_DIRECTORIES = new Set(['server','data','node_modules','.git','backups']);

function isPublicPath(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch { return false; }
  const segments = decoded.split('/').filter(Boolean);
  if (!segments.length) return true;
  if (segments.some((part) => part === '.' || part === '..' || part.startsWith('.'))) return false;
  if (segments.some((part) => BLOCKED_DIRECTORIES.has(part.toLowerCase()))) return false;
  if (segments.some((part) => /\.env|\.db(?:$|-)|\.sqlite(?:$|-)/i.test(part))) return false;
  if (segments.length === 1) return TOP_LEVEL_FILES.has(segments[0]);
  return PUBLIC_DIRECTORIES.has(segments[0]);
}

async function createApp(options = {}) {
  const config = getConfig(options);
  const db = options.db || await openDatabase(config);
  const cleanAuthHistory = async () => {
    await db.query("DELETE FROM login_attempts WHERE updated_at < now() - interval '30 days'");
    await db.query("DELETE FROM login_events WHERE occurred_at < now() - interval '90 days'");
  };
  await cleanAuthHistory();
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy ? 1 : false);
  app.locals.db = db;
  app.locals.config = config;
  app.locals.maintenanceTimer = setInterval(() => cleanAuthHistory().catch((error) => console.error('Не удалось очистить старую историю входов:', error.message)), 24 * 60 * 60 * 1000);
  app.locals.maintenanceTimer.unref();
  app.use(compression());
  app.get('/healthz', (req, res) => res.status(200).type('text').send('ok'));
  app.get('/readyz', async (req, res) => {
    try { await db.query('SELECT 1'); res.status(200).json({ ready: true }); }
    catch { res.status(503).json({ ready: false }); }
  });
  app.get('/api/public/privacy-contact', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ contact: config.privacyContact });
  });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameSrc: ["'self'"],
        frameAncestors: ["'self'"],
        formAction: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: (req) => req.user ? 300 : 1500,
    keyGenerator: (req) => req.user ? `user:${req.user.id}` : `ip:${ipKeyGenerator(req.ip || '127.0.0.1')}`,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Слишком много запросов. Подожди немного.' }
  });
  app.use('/api', attachSession(db,config.sessionSecret), apiLimiter, (req,res,next) => { res.setHeader('Cache-Control','no-store');next(); });
  app.use('/api', express.json({ limit: '450kb', type: 'application/json', strict: true }));
  app.use('/api', requireJsonAndOrigin);
  app.use('/api/auth', createAuthRouter(db,config));
  app.use('/api/teacher', createTeacherRouter(db));
  app.use('/api/student', createStudentRouter(db));
  app.use('/api', (req,res) => res.status(404).json({ error: 'Адрес API не найден.' }));

  app.get('/teacher', (req,res) => res.redirect(302,'/teacher/index.html'));
  app.get('/student', (req,res) => res.redirect(302,'/student/index.html'));
  app.get('/student/profile', (req,res) => res.redirect(302,'/student/profile.html'));
  app.get('/login', (req,res) => res.redirect(302,'/login.html'));
  app.get('/start', async (req, res, next) => {
    try {
      const count = Number((await db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='teacher'").get()).n);
      res.redirect(count ? 302 : 302, count ? '/login.html' : '/setup');
    } catch (error) { next(error); }
  });
  app.get('/setup', async (req, res, next) => {
    try {
      const count = Number((await db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='teacher'").get()).n);
      if (count || (config.production && !config.setupToken)) return res.status(404).type('text').send('Not found');
      if (!config.production && !require('./routes/auth').isLoopback(req.ip || '')) return res.status(404).type('text').send('Not found');
      res.setHeader('Cache-Control', 'no-store');
      res.sendFile(path.join(config.publicDir, 'setup.html'));
    } catch (error) { next(error); }
  });
  app.get('/ui-kit.html', (req, res) => {
    if (config.production) return res.status(404).type('text').send('Not found');
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(config.publicDir, 'ui-kit.html'));
  });
  app.get('/', (req,res) => res.sendFile(path.join(config.publicDir,'index.html')));

  const staticFiles = express.static(config.publicDir, {
    dotfiles: 'deny',
    index: false,
    fallthrough: true,
    redirect: false,
    maxAge: config.production ? '1h' : 0,
    setHeaders(res, filePath) {
      if (/[/\\](?:teacher|student)[/\\]|login\.html$|change-password\.html$/i.test(filePath)) res.setHeader('Cache-Control','no-store');
      if (filePath.endsWith('.html')) res.setHeader('Content-Type','text/html; charset=utf-8');
    }
  });
  app.use((req,res,next) => {
    if (!['GET','HEAD'].includes(req.method) || !isPublicPath(req.path)) return res.status(404).type('text').send('Not found');
    staticFiles(req,res,(error) => {
      if (error) return next(error);
      res.status(404).type('text').send('Not found');
    });
  });

  app.use((error,req,res,next) => {
    if (res.headersSent) return next(error);
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
    if (error?.type === 'entity.too.large') return res.status(413).json({ error: 'Запрос слишком большой.' });
    if (error?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Не удалось прочитать JSON.' });
    if (error?.status === 404) return res.status(404).type('text').send('Not found');
    const requestId = crypto.randomBytes(6).toString('hex');
    console.error(`[${requestId}] request failed`, error?.message || 'unknown error');
    res.status(500).json({ error: 'Не удалось выполнить запрос. Повтори попытку.' });
  });
  return app;
}

module.exports = { createApp, isPublicPath };
