/*
 * بيانات جدول الفصل الأول 2026 / 2027 — برنامج المعلوماتية الطبية
 * المصدر: «جدول الخاص - المعلوماتية الطبية» + مواد من جدولي «أمن المعلومات» و«تكنولوجيا الشبكات»
 * موجودة في لائحة برنامج المعلوماتية الطبية لكنها غير موجودة في جدول البرنامج.
 *
 * الفترات (slots) مرقمة 1..12 كما في الجدول الرسمي:
 *  1=09:00  2=09:45  3=10:30  4=11:15  5=12:00  6=12:45
 *  7=01:30  8=02:15  9=03:00 10=03:45 11=04:30 12=05:15   (كل فترة 45 دقيقة)
 * from/to = أول وآخر فترة (شاملة).
 * type: "lec" محاضرة | "sec" سكشن.  kind: نوع السكشن (عملي / تمارين) إن وجد.
 *
 * لتحديث الجدول في ترم جديد: عدل TERM_TITLE والمواد بالأسفل فقط.
 */

const TERM_TITLE = "جدول الفصل الأول للعام الدراسي 2026 / 2027";

const SLOTS = [
  { n: 1, from: "09:00", to: "09:45" },
  { n: 2, from: "09:45", to: "10:30" },
  { n: 3, from: "10:30", to: "11:15" },
  { n: 4, from: "11:15", to: "12:00" },
  { n: 5, from: "12:00", to: "12:45" },
  { n: 6, from: "12:45", to: "01:30" },
  { n: 7, from: "01:30", to: "02:15" },
  { n: 8, from: "02:15", to: "03:00" },
  { n: 9, from: "03:00", to: "03:45" },
  { n: 10, from: "03:45", to: "04:30" },
  { n: 11, from: "04:30", to: "05:15" },
  { n: 12, from: "05:15", to: "06:00" },
];

const DAYS = [
  { id: "sat", ar: "السبت" },
  { id: "sun", ar: "الأحد" },
  { id: "mon", ar: "الإثنين" },
  { id: "tue", ar: "الثلاثاء" },
  { id: "wed", ar: "الأربعاء" },
  { id: "thu", ar: "الخميس" },
];

const LEVELS = [
  { n: 1, ar: "المستوى الأول", en: "Level 1" },
  { n: 2, ar: "المستوى الثاني", en: "Level 2" },
  { n: 3, ar: "المستوى الثالث", en: "Level 3" },
];

const SOURCES = {
  mi: "المعلوماتية الطبية",
  sec: "أمن المعلومات",
  net: "تكنولوجيا الشبكات",
  secnet: "أمن المعلومات / الشبكات",
};

/* helper: one section option */
const opt = (label, sessions) => ({ label, sessions });

const COURSES = [
  /* ===================== المستوى الأول ===================== */
  {
    id: "intro-informatics", level: 1, src: "mi",
    ar: "أساسيات علوم الحاسب", short: "أساسيات علوم الحاسب", en: "Introduction to Informatics",
    lectures: [{ day: "sun", from: 1, to: 2, who: "د/ أحمد طه", room: "مدرج 3" }],
    sections: [opt("", [{ day: "thu", from: 7, to: 8, who: "م/ ندى جمال", room: "معمل هواوي" }])],
  },
  {
    id: "physics", level: 1, src: "mi",
    ar: "فيزياء", short: "فيزياء", en: "Physics",
    lectures: [{ day: "sun", from: 7, to: 8, who: "د/ إبراهيم ماجد", room: "مدرج 1" }],
    sections: [opt("", [{ day: "wed", from: 5, to: 6, who: "م/ فرح محمد", room: "معمل فيزياء 1", kind: "عملي" }])],
  },
  {
    id: "math0", level: 1, src: "mi",
    ar: "تأهيلي رياضيات", short: "تأهيلي رياضيات", en: "Math 0",
    lectures: [{ day: "wed", from: 2, to: 3, who: "د/ أحمد مصطفى", room: "مدرج 4" }],
    sections: [opt("", [{ day: "mon", from: 7, to: 8, who: "م/ تقى أحمد", room: "قاعة 10" }])],
  },
  {
    id: "calculus", level: 1, src: "mi",
    ar: "حساب التفاضل والتكامل", short: "حساب التفاضل والتكامل", en: "Calculus",
    lectures: [{ day: "thu", from: 4, to: 5, who: "د/ رضا جمال", room: "مدرج 2" }],
    sections: [opt("", [{ day: "mon", from: 9, to: 10, who: "م/ تقى أحمد", room: "قاعة 10" }])],
  },
  {
    id: "healthcare", level: 1, src: "mi",
    ar: "مقدمة في الرعاية الصحية والمصطلحات الطبية", short: "مقدمة في الرعاية الصحية", en: "Intro To Healthcare",
    lectures: [{ day: "tue", from: 1, to: 2, who: "أ.د/ نصر الله", room: "قاعة 5" }],
    sections: [],
  },
  {
    id: "structured-prog", level: 1, src: "mi",
    ar: "برمجة هيكلية", short: "برمجة هيكلية", en: "Structured Programming",
    lectures: [{ day: "tue", from: 7, to: 8, who: "د/ نجلاء فتحي", room: "قاعة 6" }],
    sections: [opt("", [{ day: "thu", from: 1, to: 2, who: "م/ منيرة منير", room: "معمل 5" }])],
  },
  {
    id: "english1", level: 1, src: "mi",
    ar: "لغة إنجليزية 1", short: "لغة إنجليزية 1", en: "English 1",
    lectures: [{ day: "wed", from: 7, to: 8, who: "د/ سارة رضوان", room: "مدرج 1" }],
    sections: [],
  },
  {
    id: "linear-algebra", level: 1, src: "secnet",
    ar: "جبر خطي", short: "جبر خطي", en: "Linear Algebra",
    note: "من جدول أمن المعلومات / الشبكات (المستوى الثاني عندهم)",
    lectures: [{ day: "thu", from: 1, to: 3, who: "د/ رضا جمال", room: "مدرج 2" }],
    sections: [
      opt("الأحد — مجموعات أمن المعلومات 1، 2", [{ day: "sun", from: 9, to: 12, who: "م/ آلاء إبراهيم", room: "قاعة 3" }]),
      opt("الأربعاء — مجموعات أمن المعلومات 3، 4 والشبكات", [{ day: "wed", from: 4, to: 6, who: "م/ آلاء إبراهيم", room: "قاعة 5" }]),
    ],
  },

  /* ===================== المستوى الثاني ===================== */
  {
    id: "diff-eq", level: 2, src: "mi",
    ar: "معادلات تفاضلية", short: "معادلات تفاضلية", en: "Differential Equations",
    lectures: [{ day: "tue", from: 3, to: 4, who: "د/ مصطفى حسن", room: "قاعة 5" }],
    sections: [opt("", [{ day: "mon", from: 1, to: 2, who: "م/ نهى عماد", room: "قاعة 1" }])],
  },
  {
    id: "data-structures", level: 2, src: "mi",
    ar: "هياكل البيانات والخوارزميات", short: "هياكل البيانات والخوارزميات", en: "Data Structures & Algorithms",
    lectures: [{ day: "mon", from: 5, to: 6, who: "د/ منى عرفه", room: "قاعة 9" }],
    sections: [opt("", [{ day: "thu", from: 2, to: 3, who: "م/ رويدا عادل", room: "معمل 14" }])],
  },
  {
    id: "histology", level: 2, src: "mi",
    ar: "أساسيات علم الأنسجة", short: "أساسيات علم الأنسجة", en: "Basic of Histopathology",
    lectures: [{ day: "tue", from: 9, to: 10, who: "أ.م.د/ سامح ذكي", room: "قاعة 6" }],
    sections: [],
  },
  {
    id: "database", level: 2, src: "mi",
    ar: "قواعد البيانات", short: "قواعد البيانات", en: "Data Base",
    lectures: [{ day: "thu", from: 5, to: 6, who: "د/ كرم جوده", room: "قاعة 1" }],
    sections: [opt("", [{ day: "wed", from: 7, to: 8, who: "م/ شيرين عادل", room: "معمل 14" }])],
  },
  {
    id: "logic-design", level: 2, src: "secnet",
    ar: "التصميم المنطقي", short: "تصميم منطقي", en: "Logic Design",
    note: "من جدول أمن المعلومات / الشبكات",
    lectures: [{ day: "thu", from: 4, to: 6, who: "د/ فاطمة صقر", room: "مدرج 4" }],
    sections: [
      opt("مجموعة 1 (أمن المعلومات) — الأحد", [
        { day: "sun", from: 3, to: 4, who: "م/ محمد مصطفى", room: "معمل تصميم منطقي 1", kind: "عملي" },
        { day: "sun", from: 5, to: 6, who: "م/ مصطفى سامي", room: "قاعة 1", kind: "تمارين" },
      ]),
      opt("مجموعة 2 (أمن المعلومات) — الأحد", [
        { day: "sun", from: 5, to: 6, who: "م/ محمد مصطفى", room: "معمل تصميم منطقي 1", kind: "عملي" },
        { day: "sun", from: 7, to: 8, who: "م/ مصطفى سامي", room: "قاعة 1", kind: "تمارين" },
      ]),
      opt("مجموعة 3 (أمن المعلومات) — الإثنين", [
        { day: "mon", from: 3, to: 4, who: "م/ محمد مصطفى", room: "معمل تصميم منطقي 1", kind: "عملي" },
        { day: "mon", from: 5, to: 6, who: "م/ مصطفى سامي", room: "قاعة 11", kind: "تمارين" },
      ]),
      opt("مجموعة 4 (أمن المعلومات) — الإثنين", [
        { day: "mon", from: 5, to: 6, who: "م/ محمد مصطفى", room: "معمل تصميم منطقي 1", kind: "عملي" },
        { day: "mon", from: 7, to: 9, who: "م/ مصطفى سامي", room: "قاعة 11", kind: "تمارين" },
      ]),
      opt("الشبكات — الأحد والإثنين", [
        { day: "sun", from: 5, to: 6, who: "م/ محمد مصطفى", room: "معمل تصميم منطقي 1", kind: "عملي" },
        { day: "mon", from: 5, to: 6, who: "م/ مصطفى سامي", room: "قاعة 11", kind: "تمارين" },
      ]),
    ],
  },
  {
    id: "technical-writing", level: 2, src: "net",
    ar: "الكتابة التقنية", short: "الكتابة التقنية", en: "Technical Writing",
    note: "من جدول تكنولوجيا الشبكات",
    lectures: [{ day: "sun", from: 3, to: 4, who: "د/ محمد فوزي", room: "مدرج 3" }],
    sections: [],
  },

  /* ===================== المستوى الثالث ===================== */
  {
    id: "bioinformatics", level: 3, src: "mi",
    ar: "مقدمة في المعلوماتية الحيوية", short: "مقدمة في المعلوماتية الحيوية", en: "Introduction to Bioinformatics",
    lectures: [{ day: "sat", from: 3, to: 4, who: "د/ محمد فوزي", room: "مدرج 4" }],
    sections: [opt("", [{ day: "sat", from: 5, to: 6, who: "م/ الزهراء إسلام", room: "معمل 5" }])],
  },
  {
    id: "selected-topics", level: 3, src: "mi",
    ar: "موضوعات مختارة في المعلوماتية الطبية الذكية 1", short: "موضوعات مختارة 1", en: "Selected Topics in IMI 1",
    lectures: [{ day: "mon", from: 7, to: 8, who: "د/ أحمد يسري", room: "قاعة 1" }],
    sections: [opt("", [{ day: "sat", from: 7, to: 8, who: "م/ حسام السيد", room: "معمل 1" }])],
  },
  {
    id: "image-processing", level: 3, src: "mi",
    ar: "معالجة الصور", short: "معالجة الصور", en: "Medical Image Processing",
    lectures: [{ day: "tue", from: 7, to: 8, who: "د/ وفاء شلش", room: "قاعة 8" }],
    sections: [opt("", [{ day: "sun", from: 3, to: 4, who: "م/ جهاد منصور", room: "معمل 14" }])],
  },
  {
    id: "graphics", level: 3, src: "mi",
    ar: "الرسم بالحاسب", short: "الرسم بالحاسب", en: "Computer Graphics",
    lectures: [{ day: "sun", from: 5, to: 6, who: "د/ رشا عربان", room: "قاعة 6" }],
    sections: [opt("", [{ day: "tue", from: 3, to: 4, who: "م/ فاطمة إبراهيم", room: "معمل 4" }])],
  },
  {
    id: "ai", level: 3, src: "mi",
    ar: "الذكاء الاصطناعي", short: "الذكاء الاصطناعي", en: "Artificial Intelligence",
    lectures: [{ day: "tue", from: 10, to: 11, who: "د/ سارة سويدان", room: "قاعة 8" }],
    sections: [opt("", [{ day: "sun", from: 8, to: 10, who: "م/ ريهام إبراهيم", room: "معمل 12" }])],
  },
  {
    id: "nlp", level: 3, src: "mi",
    ar: "معالجة اللغات الطبيعية", short: "معالجة اللغات الطبيعية", en: "Natural Language Processing",
    lectures: [{ day: "thu", from: 3, to: 4, who: "د/ إسراء عبدالحميد", room: "قاعة 1" }],
    sections: [opt("", [{ day: "mon", from: 4, to: 6, who: "م/ خالد أحمد", room: "معمل 3" }])],
  },
];
