# Piaaz Platform – Backend

## تشغيل سريع
1) أنشئ جداول Supabase بتشغيل `sql_schema_supabase.sql`.
2) ضع متغيرات البيئة (انظر `.env` أعلاه) في Render.
3) شغل الخدمة (script: `start`).
4) أنشئ أول أدمن:
   POST {PUBLIC_BASE}/bootstrap/create-admin
   { "email":"admin@piaaz.ai", "password":"StrongPass123" }

## أهم الروابط
- GET  /api/public/plans
- GET  /api/public/support-links?message=...
- POST /api/auth/login
- ADMIN:
  - POST   /api/admin/clients
  - GET    /api/admin/clients
  - PATCH  /api/admin/clients/:id
  - DELETE /api/admin/clients/:id
  - POST   /api/admin/clients/:id/waweb/qr-session
  - POST   /api/admin/clients/:id/instagram/link
  - GET    /api/admin/plans
  - POST   /api/admin/plans
  - PATCH  /api/admin/plans/:id
  - DELETE /api/admin/plans/:id
  - GET    /api/admin/analytics/summary
- CLIENT:
  - GET  /api/client/me
  - PATCH /api/client/me
- DEBUG:
  - POST /api/debug/ai-reply { client_id, text }

## ملاحظات
- ملفات جلسات واتساب تحفظ في مجلد `wa-sessions/` (قد تُمسح عند إعادة التشغيل في Render Free).
- عند ضياع الجلسة يعاد توليد QR من لوحة الأدمن.
