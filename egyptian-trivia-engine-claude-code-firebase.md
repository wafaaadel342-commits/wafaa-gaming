# Egyptian Trivia Engine — Implementation Specification
## وثيقة التنفيذ الكاملة لـ Claude Code

**الإصدار:** 2.0 — Firebase + Background AI Generation  
**اللغة:** العربية المصرية في الشرح والأسئلة  
**الهدف:** تطوير بنك أسئلة ذكي داخل موقع الألعاب الحالي باستخدام Firebase Cloud Firestore، مع الإبقاء على OpenRouter لتوليد أسئلة جديدة في الخلفية. يجب أن يبدأ اللعب فورًا بالأسئلة المعتمدة المخزنة، بينما يستمر توليد أسئلة جديدة والتحقق منها وحفظها دون تعطيل تجربة اللاعب.

---

# 0. تعليمات التنفيذ إلى Claude Code

أنت مهندس برمجيات Senior Full-Stack ومهمتك تنفيذ هذا النظام داخل المشروع الحالي، وليس إنشاء مشروع تجريبي منفصل.

**نفّذ مباشرة داخل الكود الحالي، بدون الاكتفاء بخطة أو تقرير.** افحص المشروع أولًا، افهم بنيته وتقنياته الحالية، ثم نفّذ التغييرات المتوافقة معه. لا تستبدل التقنية الحالية ولا تعِد بناء التطبيق من الصفر.

قواعد إلزامية:

1. حافظ على جميع الوظائف الحالية، المصادقة، المستخدمين، الألعاب، النقاط، الجلسات، لوحة الإدارة، والتكاملات الموجودة.
2. لا تحذف أو تكسر أي مسار أو ميزة قائمة. نفّذ ترحيلًا تدريجيًا إلى Firestore باستخدام scripts قابلة لإعادة التشغيل، واحتفظ بنسخة احتياطية وخطة رجوع. لا تستخدم SQL migrations لأن قاعدة البيانات المستهدفة Firestore.
3. لا تفترض أسماء جداول أو أعمدة أو أدوار أو ملفات قبل فحص المشروع وقاعدة البيانات الحالية.
4. افحص إعدادات Firebase الحالية (firebase.json وFirestore Rules وIndexes وCloud Functions وAuthentication وHosting إن وجدت)، وافحص قاعدة البيانات الحالية وطرق استدعاء OpenRouter قبل التعديل.
5. أعد استخدام نظام تسجيل الدخول والأدوار الحالي. لا تنشئ نظام Admin موازٍ.
6. لا تضع Firebase Admin credentials أو OpenRouter API key في Frontend أو Git أو ملفات عامة. استخدم Firebase Admin SDK داخل الخادم وSecret Manager للأسرار.
7. حافظ على ميزة توليد الأسئلة الحالية عبر OpenRouter ولا توقفها أو تستبدلها بمحتوى ثابت. لا تجعل واجهة اللعب تنتظر استجابة OpenRouter: اعرض أولًا أسئلة approved المخزنة في Firestore فورًا، وشغّل توليد الأسئلة الجديدة في الخلفية بالتوازي أثناء اللعب. لا يستدعي المتصفح OpenRouter مباشرة.
8. لا تستورد Dataset أو سؤالًا إلى الإنتاج قبل التحقق من الترخيص وحقوق المحتوى وإمكانية الاستخدام التجاري.
9. لا تخترع مصادر أو URLs أو تراخيص أو مراجع. إذا لم يمكن التحقق، علّم المصدر `unverified` وامنع استيراده للإنتاج.
10. لا تعتمد سؤالًا لمجرد أن AI أعطاه درجة عالية. اجتياز كل اختبارات الجودة الإلزامية شرط مستقل.
11. أضف اختبارات فعلية، وشغّل lint/typecheck/tests/build المتاحة، وأصلح الأخطاء الناتجة.
12. لا تكتفِ بتوليد ملفات فارغة أو TODOs. نفّذ كل ما يمكن تنفيذه فعليًا.
13. إذا احتجت قيمة سرية أو صلاحية غير متاحة، أنشئ توثيقًا واضحًا وخطوة إعداد آمنة، واستمر في باقي العمل.
14. لا تنفّذ عمليات مدمرة على قاعدة الإنتاج. أنشئ خطة ترحيل Firestore قابلة للمراجعة، وخذ Backup/Export قبل أي نقل، ولا تمسح بيانات قائمة.
15. عند الانتهاء، اكتب ملخصًا موجزًا بالملفات التي أُنشئت/عُدّلت، وما تم اختباره، وأي إعدادات أو Secrets مطلوبة.

**ترتيب الأولوية:** سلامة النظام الحالي > أمان الإجابات والصلاحيات > صحة البيانات والتراخيص > سرعة اللعب > التوسع.

---

# 1. الهدف ونطاق المشروع

تطوير Egyptian Trivia Engine داخل الموقع الحالي لإدارة بنك أسئلة مسابقات باللغة العامية المصرية الطبيعية، مع الإبقاء على طريقة عمل الموقع والألعاب الحالية وعدم إلغاء توليد الأسئلة بالذكاء الاصطناعي.

## المتطلبات الأساسية

- أكثر من 10,000 سؤال معتمد كهدف أول.
- التصنيفات:
  1. معلومات عامة
  2. تاريخ وجغرافيا
  3. رياضة
  4. علوم وتكنولوجيا
  5. ثقافة مصرية
  6. فن وأفلام ومسلسلات
  7. ألغاز وذكاء
  8. أسئلة دينية
- كل سؤال MCQ بأربعة اختيارات وإجابة صحيحة واحدة.
- مستويات الصعوبة: `easy`, `medium`, `hard`.
- لغة الأسئلة: عامية مصرية طبيعية ومفهومة، دون مبالغة أو ألفاظ محلية غامضة.
- قاعدة البيانات: **Firebase Cloud Firestore** هي المصدر الأساسي للأسئلة المعتمدة وبيانات إدارتها.
- حافظ على OpenRouter ومزودات/موديلات الذكاء الاصطناعي وآلية الاختيار والتوازي وإعادة المحاولة الموجودة حاليًا في المشروع. لا تعِد تصميمها أو تحذفها إلا إذا أثبت الفحص وجود ضرورة، ووثّق أي تغيير.
- نظام تكوين هجين:
  - توليد أسئلة أصلية عبر OpenRouter في الخلفية.
  - استيراد بيانات مفتوحة مسموح بها قانونيًا بعد التحقق من الترخيص.
  - مراجعة تلقائية لكل سؤال قبل نشره للاعبين.
- الأسئلة التي لا تجتاز شروط الجودة لا تظهر في اللعب.
- **تجربة اللعب Database-first:** عند فتح الموقع أو بدء لعبة، اجلب فورًا دفعة من الأسئلة المعتمدة الموجودة بالفعل في Firestore واعرضها دون انتظار الذكاء الاصطناعي.
- **توليد مستمر في الخلفية:** أثناء لعب المستخدم، شغّل عملية غير متزامنة تتحقق من مخزون الأسئلة وتطلب من OpenRouter توليد أسئلة جديدة عند انخفاض المخزون. افحص الأسئلة ثم احفظ المقبول منها في Firestore لتكون جاهزة للأسئلة التالية أو الجولات القادمة.
- لا تجعل توليد السؤال الجديد شرطًا لعرض السؤال الحالي أو الانتقال للسؤال التالي إذا كانت هناك أسئلة معتمدة جاهزة في المخزون.
- لا ترسل `correct_index` للمتصفح قبل إرسال إجابة اللاعب.
- قابل للتوسع إلى 50,000–100,000 سؤال وما بعدها.

## تجربة المستخدم المطلوبة (شرط أساسي)

1. عند دخول المستخدم إلى الصفحة الرئيسية، اعرض له سؤالًا افتتاحيًا/بطاقة سؤال سريعة من الأسئلة المعتمدة الموجودة في Firestore (بنص السؤال والاختيارات دون الإجابة الصحيحة)، أو اعرض أول سؤال فور اختياره اللعبة حسب تدفق الواجهة الحالي. لا تجعل الصفحة تنتظر توليد AI ولا تغيّر طريقة التنقل الحالية بلا داعٍ.
2. جهّز مسبقًا دفعة الأسئلة التالية من Firestore في الذاكرة/حالة التطبيق أثناء عرض السؤال الحالي، حتى يكون الانتقال للسؤال التالي سريعًا.
3. عندما يصل مخزون الأسئلة الجاهزة إلى حد منخفض قابل للإعداد، أرسل طلبًا آمنًا إلى Backend لبدء/استكمال Generation Job. لا تنتظر اكتمال هذا الطلب داخل مسار العرض.
4. يتولى Backend استدعاء OpenRouter، ويمكنه استخدام نفس توزيع الموديلات المتوازي الموجود حاليًا، ثم التحقق من الناتج وحفظ الأسئلة المعتمدة في Firestore.
5. يستمر المستخدم في اللعب بالأسئلة الجاهزة. عندما تنتهي الدفعة الحالية، اطلب دفعة أخرى من الأسئلة المعتمدة التي أصبحت متاحة. الأسئلة التي لم تنتهِ مراجعتها لا تظهر.
6. إذا تعذر الاتصال بالذكاء الاصطناعي، يستمر اللعب بالأسئلة المعتمدة الموجودة. أظهر تنبيهًا غير مزعج فقط عند الحاجة، ولا تجعل تعطل OpenRouter يعطل الموقع.
7. إذا كان مخزون Firestore فارغًا عند أول تشغيل، نفّذ عملية Bootstrap لتجهيز مخزون ابتدائي قبل تفعيل التحويل الكامل. احتفظ بمسار الرجوع الحالي كـ fallback مؤقت أثناء الترحيل، ولا تدّعِ أن العرض فوري من قاعدة البيانات قبل وجود أسئلة معتمدة فعلية.

## توزيع أولي مستهدف

| التصنيف | العدد |
|---|---:|
| معلومات عامة | 2,200 |
| تاريخ وجغرافيا | 1,500 |
| رياضة | 1,200 |
| علوم وتكنولوجيا | 1,400 |
| ثقافة مصرية | 1,200 |
| فن وأفلام ومسلسلات | 1,200 |
| ألغاز وذكاء | 800 |
| أسئلة دينية | 500 |
| **الإجمالي** | **10,000** |

هذه أهداف توزيع وليست ادعاءً بأن المصادر الحالية تحتوي على هذه الأعداد. احسب العدد الفعلي المعتمد لكل تصنيف، وولّد النقص فقط.

# 2. التصميم المعماري

قسّم النظام منطقيًا إلى أربع طبقات:

1. **Ingestion:** استيراد البيانات من Datasets ومصادر موثوقة.
2. **Generation:** توليد أسئلة أصلية مسبقًا وبشكل مستمر عبر OpenRouter من خلال Backend workers.
3. **Quality Control:** فحص البنية، اللغة، التكرار، المصدر، وصحة الإجابة قبل النشر.
4. **Game Delivery:** تقديم الأسئلة المعتمدة الجاهزة من Firestore والتحقق من الإجابات عبر Cloud Functions/Backend بسرعة.

## مساران متوازيان يجب عدم الخلط بينهما

**مسار اللعب السريع (Player path):**

```text
Player opens site / starts game
          |
          v
Read approved questions from Firebase Firestore
          |
          v
Render first question immediately
          |
          v
Prefetch next approved questions while player answers
          |
          v
Continue game from ready Firestore inventory
```

**مسار التوليد والتجهيز (Background AI path):**

```text
Inventory reaches low-water mark / scheduled worker
          |
          v
Firebase Cloud Function / Cloud Tasks / Pub/Sub
          |
          v
Existing OpenRouter provider + current model strategy
          |
          v
Candidate questions -> validation / duplicate checks
          |
          v
Save approved questions to Firestore
          |
          v
Questions become available to current/next game fetches
```

قواعد معمارية إلزامية:
- لا تنتظر واجهة اللعب انتهاء OpenRouter لتعرض السؤال الأول أو السؤال التالي طالما توجد أسئلة `approved` في المخزون.
- لا تستدعِ OpenRouter من المتصفح، ولا تكشف مفاتيحه.
- توليد الأسئلة يحصل في الخلفية، لكنه يظل جزءًا فعالًا من المنتج؛ لا تحوّله إلى نظام ثابت يعتمد على أسئلة seed فقط.
- الأسئلة الجديدة لا تدخل مخزون اللعب إلا بعد اجتياز Quality Control وتسجيلها كـ `approved`.
- إذا فشل التوليد أو تعطل OpenRouter، يكمل الموقع بالأسئلة الموجودة في Firestore.
- استخدم Firestore كقاعدة البيانات، وCloud Functions الجيل الثاني وCloud Tasks أو Pub/Sub للمهام الخلفية، وCloud Scheduler للمهام الدورية عند الحاجة.
- لا تحمّل بنك الأسئلة بالكامل إلى المتصفح؛ استخدم batches صغيرة وpagination/prefetch محدودًا.

# 3. فحص المشروع الحالي قبل التنفيذ

قبل كتابة الكود:

- افحص `package.json` أو ملفات إدارة الحزم لتحديد Framework والإصدارات.
- افحص بنية `src/` و`app/` و`components/` و`lib/` حسب المشروع.
- افحص إعداد Firebase الحالي وFirestore Rules وIndexes وCloud Functions وFirebase Authentication إن كانت مستخدمة.
- افحص أي سكربتات ترحيل/استيراد موجودة وأي بيانات حالية في قواعد البيانات.
- افحص تعريف الأدوار وصلاحيات Admin.
- افحص نظام الألعاب الحالي: بدء الجولة، اختيار الأسئلة، إرسال الإجابات، احتساب النقاط، إنهاء الجولة.
- ابحث عن كل استدعاءات OpenRouter ومكان استخدامها، بما فيها التوليد المتوازي بين أكثر من موديل، وإعادة المحاولة، والـ fallback، وحدود الاستخدام والتكلفة. حافظ على السلوك الحالي ما لم توجد مشكلة مثبتة.
- افحص طريقة اللعب كضيف إن وجدت، واللعب الجماعي أو عن بُعد إن وجد.
- افحص الاختبارات الحالية وطرق النشر.

أنشئ ملفًا داخليًا مختصرًا `docs/trivia-engine-integration-notes.md` يوثق نقاط التكامل المكتشفة وخطة الانتقال إلى Firebase، ثم تابع التنفيذ. لا تنتظر موافقة المستخدم على الخطة. لا تفترض أن المشروع يستخدم Firebase لمجرد أن هذه الوثيقة القديمة كانت تذكره؛ افحص المشروع الفعلي أولًا.

---

# 4. قاعدة البيانات — Firebase Cloud Firestore

استخدم **Cloud Firestore** كقاعدة البيانات الأساسية. لا تستخدم Supabase أو PostgreSQL أو SQL RPC في التنفيذ الجديد. Firestore قاعدة مستندات؛ لذلك صمّم Collections وDocuments وSubcollections بدل تحويل أنواع SQL حرفيًا.

نفّذ قواعد البيانات بطريقة متوافقة مع البيانات الحالية. قبل أي نقل:
- أنشئ Backup/Export للبيانات الحالية.
- اكتب migration/import scripts قابلة لإعادة التشغيل (idempotent).
- انقل البيانات على دفعات مع سجل بعدد المستندات الناجحة والفاشلة.
- لا تحذف المصدر القديم حتى اكتمال المقارنة والاختبارات والانتقال الناجح.
- استخدم Firebase Emulator Suite للاختبار المحلي متى أمكن.

## 4.1 Collections المقترحة

### `categories/{categoryId}`

حقول المستند:
- `name_ar: string`
- `slug: string`
- `description: string | null`
- `is_active: boolean`
- `sort_order: number`
- `created_at: Timestamp`
- `updated_at: Timestamp`

أضف التصنيفات الثمانية المذكورة في القسم الأول باستخدام seed script آمن قابل لإعادة التشغيل. استخدم IDs ثابتة أو slugs مستقرة لتجنب إنشاء تصنيفات مكررة.

### `questionSources/{sourceId}`

حقول مقترحة:
- `name: string`
- `source_url: string | null`
- `dataset_version: string | null`
- `license_spdx: string | null`
- `license_url: string | null`
- `license_text_snapshot: string | null`
- `commercial_allowed: boolean` (default false)
- `attribution_required: boolean` (default true)
- `share_alike_required: boolean` (default false)
- `source_terms_url: string | null`
- `rights_verified: boolean` (default false)
- `verification_status: unverified | approved | rejected | needs_legal_review`
- `verified_at: Timestamp | null`
- `verification_notes: string | null`
- `created_at: Timestamp`

لا يكفي وجود كلمة MIT في بطاقة Dataset وحدها. افحص ترخيص Dataset وترخيص المحتوى الأصلي وشروط المصدر، واحتفظ بنسخة/رابط للترخيص وتاريخ التحقق. عند عدم التأكد، امنع الاستيراد التجاري.

### `questions/{questionId}` — بيانات السؤال العامة

يحتوي هذا المستند على الحقول التي يمكن تقديمها للّاعب فقط:
- `category_id: string`
- `question: string`
- `options: string[]` (أربعة اختيارات فقط)
- `explanation: string` (لا تعرضه قبل الإجابة إذا كانت قواعد اللعبة الحالية تمنع ذلك)
- `difficulty: easy | medium | hard`
- `source_id: string | null`
- `source_question_id: string | null`
- `source_type: dataset | ai_generated | manual`
- `status: pending | approved | rejected | needs_review | disabled`
- `quality_score: number | null`
- `verification_data: map`
- `content_hash: string`
- `language_variant: ar-EG`
- `created_at: Timestamp`
- `updated_at: Timestamp`
- `approved_at: Timestamp | null`
- `usage_count: number` (اختياري، يتم تحديثه من Backend فقط)

**ممنوع إضافة `correct_index` أو الإجابة الصحيحة إلى مستند `questions` المقروء من اللاعب.**

### `questionAnswers/{questionId}` — بيانات الإجابة الخاصة

مستندات هذه المجموعة لا يمكن قراءتها أو كتابتها مباشرة من العميل:
- `correct_index: number` من 0 إلى 3
- `explanation_private: string | null` إذا لزم فصل الشرح الخاص
- `created_at: Timestamp`
- `updated_at: Timestamp`

الخادم وحده يستخدم Firebase Admin SDK للوصول إليها. افصل بيانات الإجابة عن مستند السؤال لأن Firestore Security Rules لا توفر حماية حقيقية على مستوى الحقول داخل المستند الواحد.

### `generationJobs/{jobId}`

- `category_id: string`
- `target_count: number`
- `generated_count: number`
- `approved_count: number`
- `rejected_count: number`
- `status: queued | processing | completed | failed | paused | cancelled`
- `provider: string`
- `models: string[]` أو `model: string` حسب نظام التوليد الحالي
- `error_message: string | null`
- `created_at: Timestamp`
- `updated_at: Timestamp`
- `completed_at: Timestamp | null`

### `generationBatches/{batchId}`

- `job_id: string`
- `idempotency_key: string`
- `requested_count: number`
- `received_count: number`
- `processed_count: number`
- `status: string`
- `attempt_count: number`
- `provider_request_ids: string[]`
- `token_usage: map`
- `estimated_cost: number | null`
- `error_message: string | null`
- `created_at: Timestamp`
- `updated_at: Timestamp`

### `questionUsage/{usageId}`

- `player_id: string` أو هوية اللاعب الموثقة حسب نظام الضيوف الحالي
- `question_id: string`
- `game_session_id: string`
- `used_at: Timestamp`

استخدم ID حتميًا أو transaction لمنع تسجيل الاستخدام المكرر. لا تفرض Firebase Authentication على الضيوف إذا كان الموقع يدعم اللعب دون تسجيل؛ لا تثق في player ID يرسله العميل دون تحقق من الجلسة.

### `questionReports/{reportId}`

- `player_id: string`
- `question_id: string`
- `game_session_id: string | null`
- `reason: string`
- `details: string | null`
- `status: open | reviewing | resolved | rejected`
- `created_at: Timestamp`

### `questionReviewLogs/{logId}`

- `question_id: string`
- `action: string`
- `old_status: string | null`
- `new_status: string`
- `review_data: map`
- `actor_id: string | system`
- `created_at: Timestamp`

### `gameSessions/{sessionId}` وSubcollections

احتفظ ببنية الجلسات الحالية قدر الإمكان. خزّن حالة الجولة واللاعبين والوقت والنتيجة وفق النظام القائم. أنشئ بيانات الأسئلة العامة التي ظهرت في الجلسة داخل `gameSessions/{sessionId}/items/{itemId}` عند الحاجة، وخزّن الإجابات الصحيحة/نتائج التحقق في مكان لا يستطيع العميل قراءته مثل `privateGameSessions/{sessionId}/answers/{itemId}`.

لا تغيّر بروتوكول اللعب الجماعي أو الضيف أو احتساب النقاط إلا عند الضرورة، ووثّق أي تغيير.

## 4.2 سلامة البيانات والفهارس

- تحقق من أن `options` مصفوفة من أربعة نصوص غير فارغة ومختلفة.
- تحقق من أن `correct_index` عدد صحيح من 0 إلى 3 داخل `questionAnswers`.
- السؤال والشرح والإجابة لا تكون فارغة.
- لا تسمح بنشر سؤال `approved` إذا كان مصدره غير مسموح تجاريًا أو غير موثق الحقوق.
- لا تضع إجابة السؤال في أي payload عام أو document متاح للعميل.
- أنشئ `content_hash` ثابتًا بعد تطبيع النص.
- لأن Firestore لا يفرض Unique Constraint مثل SQL، استخدم collection مثل `questionDedup/{contentHash}` أو Document ID حتميًا مع Transaction لمنع تكرار السؤال عند إدخاله من أكثر من Worker.
- أنشئ `firestore.indexes.json` للتركيبات التي تحتاجها الاستعلامات، مثل `status + category_id + difficulty + approved_at` وحقول الاستخدام/البلاغات. لا تضف فهارس عشوائية؛ استند إلى الاستعلامات الفعلية.
- استخدم pagination بمؤشر `startAfter` ودفعات محدودة. تجنب قراءة بنك الأسئلة كله أو الاعتماد على استعلام مكلف غير مدعوم بفهرس.
- إذا احتجت عدادات إجمالية، استخدم aggregation queries أو counters يتم تحديثها من Backend مع مراعاة التزامن، ولا تعتمد على عداد يرسله العميل.

# 5. Firestore Security Rules والأمان

استخدم Firestore Security Rules لتقييد وصول العميل، واستخدم Firebase Admin SDK داخل Cloud Functions/Backend للعمليات المميزة. تذكّر أن Admin SDK يتجاوز Security Rules؛ لذلك يجب تنفيذ التحقق من الصلاحيات داخل كل endpoint خادمي.

- فعّل قواعد Firestore صريحة لكل Collection؛ لا تستخدم `allow read, write: if true` في الإنتاج.
- اسمح بقراءة مستندات `questions` المنشورة (`status == approved`) والحقول العامة فقط؛ لذلك لا تخزّن الإجابة الصحيحة في هذه المستندات أصلًا.
- امنع العميل من قراءة أو كتابة `questionAnswers` و`privateGameSessions` وبيانات الأسرار وسجلات التوليد الداخلية.
- لا تسمح للمستخدم العادي بتعديل الأسئلة أو مصادرها أو Generation Jobs.
- اللاعب يستطيع تنفيذ العمليات المسموحة في جلساته فقط، وإرسال بلاغ عن سؤال ظهر له بالفعل.
- أعد استخدام نظام تسجيل الدخول والأدوار الحالي. لا تنشئ نظام Admin موازٍ ولا تنقل المصادقة إلى Firebase تلقائيًا دون حاجة.
- إذا كان المشروع يستخدم Firebase Authentication، استخدم Custom Claims للأدوار الإدارية بعد تعيينها والتحقق منها من الخادم، ولا تثق في role يرسله العميل.
- إذا كان المشروع يستخدم مزود مصادقة آخر، فحافظ عليه، وتحقق من رموزه/جلساته في Backend قبل العمليات الحساسة. لا تفترض أن قواعد Firestore تستطيع التحقق تلقائيًا من مزود خارجي.
- فعّل Firebase App Check للخدمات المدعومة، مع عدم اعتباره بديلًا عن Authentication أو Authorization.
- ضع rate limiting وحدودًا للطلبات على Cloud Functions الحساسة وعمليات البلاغات والتوليد.
- لا تسمح بتكرار الإجابة أو مضاعفة النقاط عبر race conditions؛ استخدم Firestore transactions والتحقق الخادمي.
- خزّن الأسرار في Google Cloud Secret Manager أو Firebase Functions Secrets، ولا تسجل مفاتيح API أو Authorization headers.
- قيد CORS للـ endpoints حسب نطاقات الموقع الفعلية، ولا تعتمد على CORS كوسيلة حماية وحيدة.

اختبر محاولات:
1. قراءة `correct_index` من أي Firestore document أو API عام.
2. قراءة `questionAnswers` أو `privateGameSessions` من لاعب عادي.
3. تعديل سؤال بواسطة لاعب.
4. إنشاء/تعديل Generation Job من لاعب.
5. بدء جولة لتصنيف غير نشط.
6. إرسال إجابة لجلسة لاعب آخر.
7. إرسال نفس الإجابة مرتين بالتوازي.
8. إنهاء جلسة ثم إرسال إجابة جديدة.
9. استدعاء Cloud Function دون هوية/صلاحية مناسبة.
10. محاولة Admin مزيفة أو تعديل Custom Claims من العميل.

# 6. Game API / Cloud Functions

ادمج النظام مع Game Engine الحالي بدل فرض شكل جديد للجولات. استخدم Cloud Functions for Firebase (يفضل الجيل الثاني) أو Backend server الحالي إذا كان قائمًا. لا تستخدم SQL RPC.

## 6.1 جلب الأسئلة وبدء الجولة

أنشئ endpoint خادميًا مثل `startGameRound` أو `getNextQuestions` وفق طريقة اللعب الحالية.

المدخلات:
- التصنيف.
- الصعوبة.
- عدد الأسئلة ضمن حد مسموح.
- بيانات وضع اللعبة المطلوبة وفق النظام الحالي.
- session/player identity وفق آلية المصادقة الحالية.

الوظائف:
- تحقق من هوية اللاعب/الجلسة وقيود اللعبة.
- تحقق من التصنيف والصعوبة.
- اختر أسئلة `approved` فقط من Firestore.
- استبعد الأسئلة المستخدمة سابقًا حسب سياسة منع التكرار.
- أنشئ/حدّث game session واربط الأسئلة بها.
- أعد `session_id` ونص السؤال والاختيارات فقط، دون `correct_index`.
- أعد دفعة أولية سريعة، وابدأ prefetch للدفعة التالية عند الحاجة.
- لا تنتظر OpenRouter في هذه الوظيفة. إذا كان المخزون أقل من الحد المحدد، أرسل طلبًا غير متزامن إلى Background Generation Dispatcher ثم أعد الأسئلة المتاحة فورًا.
- لا تستخدم `orderBy random` غير مدعوم في Firestore؛ اختر آلية توزيع مناسبة مدعومة بالفهرسة، وامنع التكرار وفق بيانات الاستخدام.

## 6.2 التحقق من الإجابة

أنشئ endpoint مثل `submitGameAnswer`.

المدخلات:
- session ID.
- question ID.
- answer index.

الوظائف:
- تحقق من ملكية الجلسة وحالتها.
- تحقق من أن السؤال جزء من الجلسة.
- تحقق من أن السؤال لم تتم الإجابة عنه.
- تحقق من أن index بين 0 و3.
- اقرأ الإجابة الصحيحة من `questionAnswers` باستخدام Admin SDK.
- استخدم Firestore transaction لتسجيل الإجابة وتحديث النتيجة بشكل ذري ومنع الإجابة المكررة.
- احسب النقاط في الخادم وفق قواعد اللعبة الحالية.
- أعد هل الإجابة صحيحة، والإجابة الصحيحة والتفسير بعد الإرسال فقط.
- لا تثق في score أو correct flag يرسله العميل.

## 6.3 إنهاء الجولة

- تأكد من قواعد إنهاء الجلسة الحالية.
- احسب النتيجة من سجلات الإجابات في الخادم.
- امنع تعديل نتيجة جلسة منتهية.
- سجّل وقت الإنهاء باستخدام server timestamp.
- لا تسمح بإعادة إرسال الإجابات أو زيادة النقاط بعد الإغلاق.

## 6.4 إمداد الأسئلة أثناء اللعب

- خزّن في واجهة اللعبة buffer صغيرًا من الأسئلة القادمة التي تم جلبها مسبقًا من Firestore.
- عندما ينخفض عدد الأسئلة المتاحة في مخزون اللاعب/الجلسة عن حد قابل للإعداد، نفّذ طلب prefetch إلى Backend لجلب أسئلة `approved` إضافية.
- بالتوازي، إذا انخفض مخزون البنك العام في تصنيف/صعوبة معينة، أطلق Background Generation Job لتوليد أسئلة جديدة عبر OpenRouter.
- لا تنتظر اكتمال التوليد لإكمال الجولة الحالية. الأسئلة الجديدة لا تُقدم إلا بعد حفظها واجتياز التحقق.
- تجنب إرسال نفس السؤال مرتين إلى نفس اللاعب أو نفس الجلسة وفق سياسة الموقع.

## 6.5 اللعب الجماعي والضيف

إذا كان الموقع يدعم اللعب الجماعي أو اللعب عن بُعد أو اللعب على نفس الهاتف:
- حافظ على البروتوكول الحالي.
- لا تفترض أن هوية اللاعب الموثقة متاح؛ استخدم آلية هوية المشروع الحالية.
- استخدم session/player tokens آمنة صادرة من الخادم عند الحاجة.
- لا تستخدم UUID عشوائي يرسله العميل كإثبات هوية.
- احمِ الإجابات الصحيحة في الخادم.
- اختبر أن لاعبًا لا يستطيع قراءة إجابات لاعب آخر.

# 7. Firebase Cloud Functions / Background Workers

أنشئ الوظائف التالية باستخدام Cloud Functions for Firebase (يفضل الجيل الثاني) أو Backend قائم بالفعل. استخدم Cloud Tasks أو Pub/Sub للمهام التي تحتاج Queue، ولا تنفذ توليدًا طويلًا داخل طلب المستخدم المتزامن:

## 7.1 importDataset

- استقبال dataset محددة من قائمة مصادر موثقة.
- تحقق من مستند المصدر داخل `questionSources` وأن `verification_status == approved`.
- تحقق من `commercial_allowed = true` إذا كان الموقع تجاريًا.
- تنزيل/قراءة البيانات بأمان.
- تحقق من format وschema.
- تحويل الأسئلة إلى الصيغة الموحدة.
- حفظ source ID وoriginal question ID.
- تنظيف اللهجة والتصنيفات دون تغيير الحقيقة.
- منع التكرار.
- إدخالها كـ `pending` أولًا.
- سجل إحصائيات الاستيراد وأسباب الرفض.
- لا تسمح بتمرير URL عشوائي من المستخدم وتنزيله مباشرة؛ استخدم allowlist لمنع SSRF.

## 7.2 generateQuestions

- تعمل فقط في الخلفية ولا تعمل ضمن request ينتظر اللاعب نتيجته.
- تقرأ Generation Job من Queue (Cloud Tasks أو Pub/Sub) أو من collection مخصصة للحالة.
- تختار category/difficulty والعدد الناقص.
- تطلب دفعات صغيرة من المزود.
- تستخدم JSON schema / structured output إن كان المزود يدعمه.
- لا تثق في JSON أو المعلومات القادمة من AI.
- احفظ raw response في سجل آمن عند الحاجة، مع عدم تخزين أسرار.
- حافظ على تكامل OpenRouter الحالي وطريقة توزيع الطلبات على أكثر من موديل بالتوازي إن كانت موجودة بالفعل، مع احترام rate limits والميزانية.
- تحقق من كل سؤال.
- استخدم idempotency key لكل batch.
- لا تعِد توليد Job كاملة عند فشل Batch واحدة.
- سجّل tokens والتكلفة والوقت والمزود والموديل.
- أوقف التوليد عند تجاوز حدود التكلفة أو عدد المحاولات.

## 7.3 validateQuestion

نفّذ التحقق البنيوي والمحوري:
- سؤال غير فارغ.
- 4 اختيارات نصية مختلفة.
- correct_index صحيح.
- لا توجد إجابة مكررة أو اختيار يفضح الصحيح.
- explanation موجود.
- category/difficulty صالحان.
- مصدر/دليل قابل للتحقق.
- الترخيص يسمح بالاستخدام.
- content hash غير مكرر.
- لا يحتوي على إساءة أو محتوى غير ملائم.
- الصياغة مصرية طبيعية ومفهومة.
- لا توجد صياغة غامضة أو أكثر من إجابة صحيحة.
- لا توجد حقائق آنية قديمة دون تاريخ/مصدر.

## 7.4 processQuestionBatch

- يقرأ رسائل Cloud Tasks أو Pub/Sub.
- يعالج الرسائل بأمان.
- يستخدم retry مع exponential backoff للأخطاء المؤقتة فقط.
- يرسل الرسائل غير القابلة للإصلاح إلى dead-letter/failure queue.
- يمنع المعالجة المكررة.
- يحد من concurrency ومعدل الطلبات.
- يحدّث Job/Batch metrics.

## 7.5 reportQuestion

- يستقبل بلاغ لاعب.
- يتحقق أن السؤال ظهر للاعب/الجلسة.
- يفرض rate limit.
- يمنع spam والتكرار.
- لا يسمح للاعب بتغيير status بنفسه.
- يضع السؤال في قائمة مراجعة إذا تجاوزت البلاغات عتبة مناسبة أو ظهرت إشارة قوية.

## 7.6 adminQuestionManager

- عمليات Admin فقط.
- البحث والفلترة والتعديل والتعطيل وإعادة التفعيل.
- إدارة Jobs والمصادر.
- سجل audit لكل تغيير.
- لا تعتمد على role في request body. تحقق من الصلاحية من هوية موثوقة/Custom Claims أو من نظام المصادقة الحالي.

---

# 8. توليد الأسئلة عبر OpenRouter

استخدم OpenRouter لتوليد الأسئلة في الخلفية بشكل مستمر، بما في ذلك أثناء وجود اللاعبين داخل الألعاب، واجعل provider adapter قابلًا للتبديل. المقصود أن التوليد يعمل بالتوازي ولا ينتظره اللاعب؛ لا تستخدمه لجلب السؤال الحالي بشكل متزامن.

Secrets المطلوبة في Firebase/Google Cloud Secret Manager (أو Firebase Functions Secrets):
- `FIREBASE_PROJECT_ID` (حسب بيئة التشغيل)
- اعتماد Firebase Admin SDK عبر Service Account/Workload Identity، وليس ملف مفتاح داخل Frontend أو Git
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` أو إعدادات الموديلات الحالية

إعدادات مبدئية قابلة للتعديل:
- batch size: 10 أسئلة.
- retries: 3 للأخطاء المؤقتة.
- timeout واضح.
- concurrency محدود.
- daily/monthly spend cap.
- generation budget لكل تصنيف.
- إيقاف تلقائي عند نفاد الميزانية.
- عدم تسجيل API key أو Authorization headers في logs.

لا تفترض أن كل موديل يدعم JSON Schema. اختبر structured output للموديل المختار، وإلا استخدم JSON parsing صارمًا مع validation وإعادة المحاولة.

## Prompt التوليد

```text
You are an expert Egyptian trivia question writer and fact-checking assistant.

Create original multiple-choice trivia questions in natural,
authentic Egyptian Arabic (Masri).

Requirements:
- Write naturally as Egyptians speak, while remaining clear to
  Egyptians from different regions.
- Avoid literal translations from English.
- Avoid excessive slang, offensive language, stereotypes,
  political persuasion, and ambiguous wording.
- Each question must have exactly four distinct options.
- Exactly one option must be factually correct.
- correct_index must be an integer from 0 to 3.
- Include a short, useful explanation.
- Follow the requested category and difficulty.
- Avoid duplicates and near-duplicates.
- Avoid subjective, disputed, unverifiable, or rapidly changing facts.
- Never invent sources, URLs, quotes, dates, or statistics.
- Provide a real evidence source for factual claims.
- If you cannot verify a fact, do not include that question.
- Return only valid JSON matching the supplied schema.
- Generate exactly the requested number of questions.
```

## JSON schema المنطقي

```json
{
  "questions": [
    {
      "question": "مين أول رئيس لجمهورية مصر العربية؟",
      "options": [
        "محمد نجيب",
        "جمال عبد الناصر",
        "أنور السادات",
        "حسني مبارك"
      ],
      "correct_index": 0,
      "explanation": "محمد نجيب كان أول رئيس لمصر بعد إعلان الجمهورية.",
      "category": "general_knowledge",
      "difficulty": "easy",
      "evidence": {
        "source_name": "اسم المصدر الفعلي",
        "source_url": "رابط حقيقي تم التحقق منه"
      }
    }
  ]
}
```

هذا المثال توضيحي؛ لا تستخدم روابط وهمية في البيانات الفعلية.

---

# 9. Automatic Quality Control

اعتمد مراحل منفصلة، ولا تجعل AI judge هو مصدر الحقيقة الوحيد.

## 9.1 Hard validation

أي فشل هنا يمنع الاعتماد:
- schema غير صحيح.
- عدد الاختيارات ليس 4.
- اختيارات مكررة.
- correct_index غير صالح.
- محتوى فارغ.
- مصدر غير موثق.
- ترخيص غير مسموح أو غير معروف.
- سؤال مكرر.
- إجابة غير قابلة للتحقق.
- محتوى مخالف لقواعد الموقع.

## 9.2 Semantic validation

استخدم مدققًا مستقلًا أو نموذجًا مختلفًا عند توفر الميزانية لفحص:
- هل الإجابة صحيحة؟
- هل هناك أكثر من إجابة صحيحة؟
- هل السؤال واضح؟
- هل الاختيارات منطقية؟
- هل الشرح يطابق الإجابة؟
- هل السؤال بالفعل باللهجة المصرية؟
- هل التصنيف مناسب؟
- هل الصعوبة مناسبة؟

لا تعتبر موافقة نموذج التوليد على إجابته تحققًا مستقلًا. استخدم evidence retrieval من مصادر موثوقة، واسمح بحالة `needs_review` عند الشك.

## 9.3 Decision policy

- `approved`: كل Hard checks ناجحة، ووجود دليل موثوق، وثقة التحقق تتجاوز الحد المحدد.
- `needs_review`: مصدر أو إجابة غير محسومة، أو اختلاف بين المدققات.
- `rejected`: بنية خاطئة، تكرار، ترخيص مرفوض، أو سؤال غير صالح.
- `disabled`: سؤال سبق اعتماده ثم ثبتت مشكلته.

يمكن استخدام score إرشادي:
- 90–100: مرشح للاعتماد فقط إذا اجتاز كل الشروط الإلزامية.
- 75–89: needs_review.
- أقل من 75: rejected.

لا تعتمد تلقائيًا أسئلة الدين أو المسائل الطبية/القانونية أو الحقائق الحساسة/المتنازع عليها دون سياسة مصادر خاصة. بالنسبة للدين:
- استخدم مصادر موثوقة محددة.
- تجنب المسائل الخلافية.
- لا تنسب حديثًا أو نصًا دون تحقق.
- إذا لم يكن المصدر قويًا، `needs_review` وليس `approved`.

---

# 10. مصادر البيانات وخطة التراخيص

ابدأ بفحص المصادر التالية، لكن لا تفترض مسبقًا أن كل محتواها صالح تجاريًا:

1. **EgyMMLU**  
   https://huggingface.co/datasets/UBC-NLP/EgyMMLU  
   Dataset مصرية متعددة الاختيارات. افحص بطاقة البيانات، الترخيص، مصدر كل subset، وترخيص المحتوى الأصلي. لا تستورد قبل توثيق الحقوق.

2. **MasrawiQA**  
   https://huggingface.co/datasets/JohnnyGeorge/MasrawiQA  
   مجموعة صغيرة مفيدة للثقافة المصرية. افحص الترخيص الفعلي وحقوق النصوص والمراجع قبل الاستيراد.

3. **EgyptianHellaSwag**  
   https://huggingface.co/datasets/MBZUAI-Paris/EgyptianHellaSwag  
   مناسبة أكثر لفهم المواقف واستكمال السيناريوهات؛ لا تعاملها تلقائيًا كبنك معلومات عامة. افحص ترخيص Dataset ومصدر المحتوى وشروطه.

4. **ArabicCulturalQA**  
   https://huggingface.co/datasets/QCRI/ArabicCulturalQA  
   قد تحتوي على أسئلة باللهجة المصرية، لكن إذا كان الترخيص `CC BY-NC-SA 4.0` فلا تستخدمها في منتج تجاري دون إذن منفصل مكتوب. اجعلها مستبعدة افتراضيًا إلى أن يثبت خلاف ذلك.

**لا تعتمد معلومات الترخيص المكتوبة هنا كبديل عن فحص بطاقة المصدر الحالية.** قد تتغير إصدارات البيانات أو تراخيصها. احتفظ بتاريخ التحقق ورابط license ونسخة من النص القانوني.

## مصادر معرفية للتحقق

أنشئ allowlist حسب المجال، مثل:
- الجهات الحكومية والمصادر الرسمية للتاريخ والجغرافيا والإحصاءات.
- الاتحادات الرياضية والجهات الرسمية للرياضة.
- الجامعات والمراجع العلمية المعتمدة للعلوم.
- مصادر موثوقة ومرخصة للمعلومات الثقافية.
- مصادر رسمية أو قواعد بيانات مرخصة للفن والأعمال.
- مصادر دينية موثوقة ومحددة للأسئلة الدينية.

لا تنسخ مقالات أو كتبًا أو نصوص أفلام أو كلمات أغاني أو أسئلة مسابقات محمية. يمكن إنشاء سؤال أصلي عن حقيقة عامة مع الاستشهاد بمصدر، لكن لا يعني ذلك أن نسخ نص المصدر مسموح.

## سجل حقوق لكل سؤال

احتفظ بـ:
- مصدر السؤال.
- URL.
- Dataset version.
- license.
- تاريخ التحقق.
- هل الاستخدام التجاري مسموح؟
- هل يلزم attribution؟
- هل يلزم share-alike؟
- نص attribution المطلوب.
- ملاحظات المراجعة.

إذا كان الترخيص غير معروف، لا تستورد السؤال إلى production.

---

# 11. خطة الوصول إلى 10,000+ سؤال

1. افحص كل Dataset وسجّل العدد الفعلي واللغة والتصنيف والترخيص.
2. أنشئ تقريرًا يوضح عدد الأسئلة المؤهلة تجاريًا قبل الاستيراد.
3. استورد المسموح فقط إلى staging/pending.
4. حوّل كل سؤال إلى صيغة موحدة.
5. صنّف الأسئلة الثمانية.
6. افحص اللهجة والجودة والتكرار والمصدر.
7. احسب approved count لكل تصنيف.
8. احسب العجز مقارنة بالتوزيع المستهدف.
9. أنشئ Generation Jobs للعجز فقط.
10. ولّد دفعات صغيرة، وتحقق من كل سؤال.
11. استمر حتى تصل إلى 10,000 سؤال معتمد، لا 10,000 سؤال خام.
12. إذا لم تتوفر مصادر كافية لبعض التصنيفات، لا تملأ العدد بأسئلة ضعيفة أو غير موثقة؛ وضّح العجز واستمر في التوليد الموثق.

---

# 12. منع التكرار

استخدم أكثر من مستوى:

1. Exact hash بعد التطبيع، مع سجل حتمي مثل `questionDedup/{contentHash}` وكتابة Transaction لمنع السباق بين Workers.
2. Similarity comparison للنصوص المتقاربة.
3. فحص تشابه الاختيارات والإجابة.
4. مراجعة semantic duplicates عبر embeddings أو AI عند الحاجة، وليس أثناء اللعب.

لا تحذف سؤالين لمجرد تشابه كلماتهما إذا كانا يسألان عن حقائق مختلفة. استخدم duplicate detection كإشارة، واحتفظ بسجل سبب الرفض.

---

# 13. Queue وScheduler

استخدم خدمات Google Cloud/Firebase للمهام الخلفية:
- **Cloud Tasks** للمهام الموجهة إلى Worker مع retry والتحكم في معدل التنفيذ.
- أو **Pub/Sub** للرسائل والأحداث وتوزيع المعالجة عند الحاجة.
- **Cloud Scheduler** لتشغيل Dispatcher دوريًا ومراجعة Jobs المتوقفة.
- استخدم Firestore لتخزين حالة Jobs وBatches، وليس كبديل مرتجل عن Queue موثوقة إذا كانت هناك حاجة إلى ضمانات جدولة/إعادة محاولة.

Queues/Topics مقترحة:
- `question-generation`
- `question-validation`
- `dataset-import`

متطلبات:
- durable jobs.
- retry للأخطاء المؤقتة فقط.
- exponential backoff.
- idempotency لكل Batch.
- dead-letter/failure handling.
- concurrency limits.
- batch size قابل للتعديل.
- إمكانية pause/resume/cancel.
- لا تعمل كل المهام في Cloud Function واحدة طويلة قد تتجاوز وقت التنفيذ.
- لا تنشئ أكثر من Scheduler لنفس المهمة.
- لا تُنشئ Generation Job جديدة مع كل render أو request من الواجهة؛ استخدم low-water mark مع lock/cooldown لمنع التوليد المتكرر.
- ضع حدًا يوميًا/شهريًا للتكلفة وعدد الأسئلة والطلبات بالتوازي.

أنشئ Cloud Scheduler لتشغيل worker/dispatcher على فترات مناسبة، ومراجعة Jobs المتوقفة وتحديث الإحصائيات. وثّق إعدادات المنطقة والـ runtime والـ retry والـ concurrency.

# 14. لوحة تحكم Admin

أضف قسمًا في لوحة الإدارة الحالية باسم **إدارة بنك الأسئلة**، بنفس التصميم ونظام الصلاحيات الحالي.

الشاشات:

1. Dashboard:
   - إجمالي الأسئلة.
   - approved / pending / needs_review / rejected / disabled.
   - أعداد حسب التصنيف والصعوبة.
   - عدد الأسئلة المستوردة والمولدة.
   - تكلفة التوليد.
   - Jobs النشطة والفاشلة.

2. Questions:
   - جدول بحث وفلترة.
   - السؤال والاختيارات والإجابة والتفسير.
   - التصنيف والصعوبة والحالة.
   - المصدر والترخيص.
   - تعديل وتعطيل وإعادة تفعيل.
   - عرض سجل المراجعة.
   - Bulk actions آمنة.

3. Generation:
   - إنشاء Job.
   - اختيار التصنيف والصعوبة والعدد.
   - عرض التقدم والتكلفة.
   - pause/resume/cancel.
   - retry للدفعات الفاشلة.
   - daily budget وspend cap.

4. Sources & Licenses:
   - إضافة مصدر.
   - عرض URL والترخيص.
   - حالة التحقق.
   - commercial allowed.
   - تاريخ المراجعة.
   - منع الاستيراد عند عدم التحقق.

5. Reports:
   - بلاغات اللاعبين.
   - تجميع البلاغات حسب السؤال.
   - تعطيل السؤال مؤقتًا.
   - تسجيل قرار المعالجة.

6. Review:
   - قائمة needs_review.
   - أسباب الفشل.
   - نتائج الفحص.
   - إعادة التحقق.
   - اعتماد/رفض بواسطة Admin عند الحاجة.

كل إجراء إداري يجب أن يُسجل في audit/review log.

---

# 15. الأداء والتوسع

- لا تحمل بنك الأسئلة كاملًا للمتصفح.
- أعد فقط عدد الأسئلة المطلوب.
- لا ترسل correct_index قبل الإجابة.
- استخدم Cloud Functions أو Backend خادمي للتحقق من الإجابات والنتائج.
- أنشئ Firestore composite indexes للاستعلامات الفعلية واحتفظ بتعريفاتها في `firestore.indexes.json`. اختبر الاستعلامات على بيانات قريبة من حجم الإنتاج، وراجع Query Explain/Performance Monitoring إذا كانت متاحة في بيئة المشروع.
- استخدم pagination بمؤشرات `startAfter` في لوحة الإدارة بدل تحميل كل السجلات.
- تجنب الاستعلامات غير المدعومة أو scans الواسعة، وقلّل قراءات Firestore غير الضرورية.
- راقب Firestore read/write usage وquery latency وCloud Functions errors وCloud Tasks/Pub/Sub backlog.
- اجعل اختيار الأسئلة عشوائيًا دون كلفة غير ضرورية.
- احتفظ بإمكانية توسع إلى 100k+ سؤال.
- لا تضف caching معقدًا قبل قياس الحاجة.

أهداف الأداء الأولية للاختبار:
- عرض سؤال افتتاحي/أول سؤال من Firestore دون انتظار AI.
- استهداف استجابة سريعة ومستقرة، وقياس p50/p95 بدل ادعاء رقم ثابت.
- لا يعتمد تقديم السؤال الجاهز والتحقق من الإجابة على استجابة OpenRouter؛ يظل OpenRouter يعمل في مسار التوليد الخلفي.

---

# 16. Secrets وEnvironment

استخدم Google Cloud Secret Manager أو Firebase Functions Secrets لتخزين:
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- مفاتيح أي خدمة تحقق خارجية إذا أضيفت لاحقًا.

استخدم إعدادات Firebase للمشروع الفعلي. لا تنشئ مفاتيح وهمية ولا تكتب أسرارًا في الملفات أو ملفات `.env` التي يتم رفعها إلى Git. استخدم `.env.example` لقيم توضيحية فقط، وSecret Manager في الإنتاج.

متغيرات إعداد اختيارية:
- `QUESTION_GENERATION_BATCH_SIZE=10`
- `QUESTION_MAX_RETRIES=3`
- `QUESTION_DAILY_BUDGET`
- `QUESTION_MONTHLY_BUDGET`
- `QUESTION_GENERATION_ENABLED=false` افتراضيًا حتى إعداد الأسرار واختبارها.
- `QUESTION_LOW_WATER_MARK` لتحديد متى يبدأ توليد مخزون جديد.
- `QUESTION_PREFETCH_BATCH_SIZE` لتحديد حجم الدفعة التي تُجلب للعبة.

اجعل إيقاف التوليد ممكنًا دون التأثير على اللعب.

---

# 17. الاختبارات المطلوبة

## Firestore / Security Rules
- لاعب لا يستطيع قراءة `questionAnswers` أو `correct_index`.
- لاعب لا يستطيع تعديل الأسئلة.
- لاعب لا يستطيع قراءة مصادر داخلية حساسة.
- Admin فقط يستطيع إدارة الأسئلة.
- لا يمكن بدء جولة بأسئلة pending/rejected/disabled.
- لا يمكن تعديل جلسة لاعب آخر.
- لا يمكن تكرار الإجابة أو مضاعفة النقاط.
- لا يمكن الإجابة بعد انتهاء الجلسة.

## Generation
- JSON غير صالح.
- سؤال بلا مصدر.
- ترخيص غير معروف.
- Dataset غير مسموح تجاريًا.
- اختيار مكرر.
- correct_index خارج النطاق.
- سؤال مكرر exact.
- سؤال مشابه معنويًا.
- مزود AI timeout.
- نفاد budget.
- إعادة معالجة نفس batch.
- فشل worker وإعادة المحاولة.
- Firestore مخزون الأسئلة فارغ/أقل من الحد.
- تشغيل low-water mark أكثر من مرة بالتوازي دون إنشاء Jobs مكررة.

## Game flow
- جولة سهلة/متوسطة/صعبة.
- بدء اللعب وعرض أول سؤال من Firestore دون انتظار OpenRouter.
- prefetch لأسئلة لاحقة أثناء اللعب.
- توليد أسئلة جديدة في الخلفية وحفظها ثم ظهورها في طلب لاحق.
- كل تصنيف.
- عدد أسئلة أقل من المطلوب.
- لاعب ضيف إن كان مدعومًا.
- Multiplayer/remote إن كان موجودًا.
- تسجيل الإجابة والنقاط.
- إنهاء الجولة.

## Regression
- تسجيل الدخول.
- التسجيل.
- الألعاب الحالية.
- لوحة الإدارة.
- نظام النقاط.
- الجلسات.
- أي اشتراكات/مدفوعات أو ميزات قائمة.

---

# 18. خطة التحويل مع الحفاظ على OpenRouter الحالي

**الهدف ليس إلغاء OpenRouter. الهدف هو فصل وقت عرض السؤال عن وقت توليد السؤال.**

1. افحص طريقة توليد الأسئلة الحالية، وحافظ على الـ prompts والموديلات وآلية الاختيار والتوازي والـ retries والـ fallback وحدود التكلفة الموجودة ما دامت تعمل بشكل سليم.
2. جهّز Firebase Cloud Firestore وSecurity Rules وIndexes وCloud Functions/Workers.
3. أنشئ مخزونًا ابتدائيًا من الأسئلة المعتمدة في Firestore عبر التوليد الحالي والتحقق، قبل تفعيل Database-first على كل المستخدمين.
4. اربط نسخة تجريبية من لعبة واحدة بجلب الأسئلة المعتمدة من Firestore.
5. عند فتح اللعبة، اعرض أسئلة Firestore الجاهزة فورًا، ولا تنتظر توليد OpenRouter.
6. أثناء اللعب، اجلب دفعة الأسئلة التالية مسبقًا من Firestore، وبالتوازي أطلق توليدًا خلفيًا عندما ينخفض المخزون.
7. بعد توليد AI، مرّر الأسئلة على Quality Control، ثم احفظ المعتمد فقط في Firestore.
8. اختبر جميع حالات اللعب، وأمان الإجابات، وسلوك الضيف/الجماعي، وقياس سرعة ظهور السؤال الأول.
9. استخدم feature flag للتحويل التدريجي وإمكانية الرجوع المؤقت.
10. لا توقف المسار القديم قبل التأكد من أن مخزون Firestore والتوليد الخلفي يعملان بصورة مستقرة. أبقِ fallback متوافقًا خلال فترة الانتقال.
11. بعد نجاح الانتقال، اجعل Firestore هو المصدر الأول للأسئلة المعروضة، وOpenRouter محركًا مستمرًا لتجديد المخزون في الخلفية، وليس مصدر انتظار مباشرًا للواجهة.
12. إذا فشل Firebase أو لم تتوفر أسئلة معتمدة، تعامل مع الحالة بوضوح وفعّل fallback المتفق عليه دون كشف الإجابة الصحيحة أو إفساد الجلسات.

لا تغيّر قواعد احتساب النقاط أو قواعد اللعب الحالية إلا إذا كان ذلك مطلوبًا صراحة أو ضروريًا للأمان، ووثّق أي تغيير.

# 19. المخرجات المطلوبة من Claude Code

نفّذ ووفّر:

- Firestore collection/document schema موثق.
- Firestore Security Rules كاملة.
- `firestore.indexes.json` للفهرسة المطلوبة.
- Cloud Functions كاملة.
- Cloud Tasks/Pub/Sub وCloud Scheduler setup instructions.
- Scripts آمنة لترحيل/استيراد البيانات ونسخها الاحتياطي.
- Seed categories.
- Dataset importer مع license gate.
- AI generation pipeline.
- Automatic validation pipeline.
- Admin UI داخل لوحة التحكم الحالية.
- ربط الألعاب الحالية بالنظام الجديد.
- Unit/integration/security tests.
- ملف `.env.example` بدون أسرار.
- `docs/trivia-engine-setup.md` لإعداد Firebase/Firestore وSecrets وRules وIndexes وCloud Functions.
- `docs/trivia-engine-operations.md` لإدارة التوليد الخلفي والميزانية والأخطاء ومخزون الأسئلة.
- `docs/trivia-engine-licenses.md` لتوثيق مصادر البيانات والتراخيص.
- `docs/trivia-engine-integration-notes.md` لتوثيق تكامل النظام مع المشروع الحالي.

لا تضع بيانات تجريبية على أنها أسئلة حقيقية معتمدة. يمكن إضافة seed تجريبي واضح وموسوم `demo` للاختبار فقط، ولا يظهر في الإنتاج.

---

# 20. شروط اعتبار التنفيذ مكتملًا

يُعتبر التنفيذ ناجحًا عندما:

- النظام يعمل داخل المشروع الحالي دون كسر وظائفه.
- Firestore collections وSecurity Rules وIndexes تعمل من البداية وبشكل آمن.
- لا يستطيع العميل قراءة الإجابات الصحيحة أو بيانات الجلسات الخاصة.
- يبدأ عرض الجولة من الأسئلة المعتمدة في Firestore دون انتظار OpenRouter.
- يستمر OpenRouter في توليد أسئلة جديدة في الخلفية أثناء اللعب، وتحفظ الأسئلة المعتمدة في Firestore.
- إرسال الإجابة والتحقق والنقاط تتم بأمان في الخادم.
- يمكن استيراد Dataset فقط بعد التحقق من حقوقها.
- يمكن إنشاء Generation Job وتشغيلها في الخلفية عبر Cloud Functions وCloud Tasks/Pub/Sub.
- يمكن تنفيذ prefetch للأسئلة الجاهزة وعرضها دون شاشة انتظار طويلة.
- كل سؤال يمر عبر Quality Control.
- الأسئلة غير المؤهلة لا تظهر للاعبين.
- لوحة الإدارة تعرض الإحصائيات وتدير الأسئلة والمصادر والـ Jobs.
- الاختبارات الأساسية والأمنية ناجحة.
- يوجد توثيق واضح لكل Secrets وخطوات التشغيل.
- لا يتم الادعاء بوجود 10,000 سؤال قبل وجود 10,000 سؤال معتمد فعليًا.

---

# 21. ابدأ التنفيذ الآن

ابدأ بفحص المشروع الحالي وقاعدة البيانات والتكاملات. بعد ذلك نفّذ Firebase Firestore تدريجيًا داخل نفس المشروع، مع الحفاظ على كل الوظائف الحالية وتوليد OpenRouter. أولوية تجربة المستخدم هي عرض سؤال محفوظ فورًا، مع استمرار توليد أسئلة جديدة في الخلفية أثناء اللعب.

**لا ترد بخطة فقط. لا تنتظر موافقة على الخطة. نفّذ الكود والملفات والاختبارات فعليًا، ثم اذكر ما اكتمل وما يحتاج إعدادًا خارجيًا أو سرًا من المستخدم.**
