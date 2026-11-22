/* جدولي الأسبوعي — Medical Informatics Program */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const arDigits = (s) => String(s).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
  const byId = Object.fromEntries(COURSES.map((c) => [c.id, c]));
  const dayAr = Object.fromEntries(DAYS.map((d) => [d.id, d.ar]));
  const dayOrder = Object.fromEntries(DAYS.map((d, i) => [d.id, i]));
  const MAX_SPAN = 3;
  const STORE_KEY = "mi-schedule-v1";

  /* ---------------- الحالة ---------------- */
  let state = {
    step: 1,
    name: "",
    level: null,
    seededLevel: null,
    tab: null,
    selected: {},   // courseId -> { lec: bool, sec: bool, opt: number }
    changes: {},    // sessionKey -> { day, from, to, room }
    answered: false,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (saved && typeof saved === "object") state = Object.assign(state, saved, { step: 1 });
    // تجاهل أي مادة لم تعد موجودة في البيانات
    for (const id of Object.keys(state.selected)) if (!byId[id]) delete state.selected[id];
  } catch (e) { /* التخزين غير متاح — لا مشكلة */ }
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} };

  const timeRange = (from, to) => `${SLOTS[from - 1].from} – ${SLOTS[to - 1].to}`;

  /* ---------------- الجلسات المختارة ---------------- */
  function sessionTitle(course, type, kind) {
    if (type === "lec") return course.short;
    return "سكشن " + course.short + (kind ? " " + kind : "");
  }

  function selectedSessions() {
    const out = [];
    for (const c of COURSES) {
      const sel = state.selected[c.id];
      if (!sel) continue;
      if (sel.lec) c.lectures.forEach((s, i) => out.push(mk(c, "lec", s, `${c.id}|L|${i}`)));
      if (sel.sec && c.sections.length) {
        const oi = Math.min(sel.opt || 0, c.sections.length - 1);
        c.sections[oi].sessions.forEach((s, i) => out.push(mk(c, "sec", s, `${c.id}|S|${oi}|${i}`)));
      }
    }
    return out;
    function mk(c, type, s, key) {
      const ch = state.changes[key];
      return {
        key, course: c, type, kind: s.kind || "",
        title: sessionTitle(c, type, s.kind),
        who: s.who,
        orig: { day: s.day, from: s.from, to: s.to, room: s.room },
        day: ch ? ch.day : s.day,
        from: ch ? ch.from : s.from,
        to: ch ? ch.to : s.to,
        room: ch && ch.room ? ch.room : s.room,
        changed: !!ch,
      };
    }
  }

  function findConflicts(list) {
    const res = [];
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if (a.day === b.day && a.from <= b.to && b.from <= a.to) res.push([a, b]);
      }
    return res;
  }

  /* ---------------- التنقل ---------------- */
  function go(step) {
    state.step = step;
    $$(".step").forEach((el) => (el.hidden = el.id !== "step" + step));
    $$("#stepper li").forEach((li) => {
      const n = +li.dataset.step;
      li.classList.toggle("active", n === step);
      li.classList.toggle("done", n < step);
    });
    if (step === 2) renderStep2();
    if (step === 3) renderStep3();
    if (step === 4) renderStep4();
    save();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => go(+b.dataset.go)));

  /* ---------------- الخطوة 1 ---------------- */
  const nameInput = $("#studentName");
  nameInput.value = state.name || "";
  nameInput.addEventListener("input", () => { state.name = nameInput.value; save(); $("#err1").textContent = ""; });

  function renderLevelPick() {
    $("#levelPick").innerHTML = LEVELS.map((l) =>
      `<button type="button" class="level-btn ${state.level === l.n ? "on" : ""}" data-level="${l.n}">${l.ar}<small>${l.en}</small></button>`
    ).join("");
    $$("#levelPick .level-btn").forEach((b) => b.addEventListener("click", () => {
      state.level = +b.dataset.level; $("#err1").textContent = ""; renderLevelPick(); save();
    }));
  }
  renderLevelPick();

  $("#toStep2").addEventListener("click", () => {
    state.name = nameInput.value.trim();
    if (!state.name) { $("#err1").textContent = "اكتب اسمك أولا"; nameInput.focus(); return; }
    if (!state.level) { $("#err1").textContent = "اختر المستوى"; return; }
    if (state.seededLevel !== state.level) {
      // أول مرة لهذا المستوى: نختار مواد البرنامج في مستواه تلقائيا
      state.selected = {};
      state.changes = {};
      for (const c of COURSES) if (c.level === state.level && c.src === "mi") state.selected[c.id] = { lec: true, sec: true, opt: 0 };
      state.seededLevel = state.level;
      state.tab = state.level;
      state.answered = false;
    }
    go(2);
  });

  /* ---------------- الخطوة 2 ---------------- */
  function renderStep2() {
    if (!state.tab) state.tab = state.level;
    $("#levelTabs").innerHTML = LEVELS.map((l) => {
      const n = COURSES.filter((c) => c.level === l.n && state.selected[c.id]).length;
      return `<button type="button" role="tab" class="tab ${state.tab === l.n ? "on" : ""}" data-tab="${l.n}">${l.ar}` +
        (n ? `<span class="count">${n}</span>` : "") +
        (l.n === state.level ? `<span class="mine">(مستواك)</span>` : "") + `</button>`;
    }).join("");
    $$("#levelTabs .tab").forEach((t) => t.addEventListener("click", () => { state.tab = +t.dataset.tab; renderStep2(); save(); }));

    const list = COURSES.filter((c) => c.level === state.tab);
    $("#courseList").innerHTML = list.map(courseCard).join("");
    $$("#courseList .course").forEach(bindCourse);
    renderSummary();
  }

  function sessLine(label, s) {
    return `<div><b>${label}:</b> ${dayAr[s.day]} ${timeRange(s.from, s.to)} — ${esc(s.who)} — ${esc(s.room)}</div>`;
  }

  function courseCard(c) {
    const sel = state.selected[c.id];
    const on = !!sel;
    let meta = c.lectures.map((s) => sessLine("محاضرة", s)).join("");
    if (c.sections.length === 1) meta += c.sections[0].sessions.map((s) => sessLine("سكشن" + (s.kind ? " " + s.kind : ""), s)).join("");
    if (c.sections.length > 1) meta += `<div><b>سكشن:</b> ${c.sections.length} مجموعات — اختر مجموعتك بعد تحديد المادة</div>`;
    let body = "";
    if (on) {
      const t = [];
      if (c.lectures.length) t.push(`<button type="button" class="toggle ${sel.lec ? "on" : ""}" data-t="lec">${sel.lec ? "✓ " : ""}المحاضرة</button>`);
      if (c.sections.length) t.push(`<button type="button" class="toggle ${sel.sec ? "on" : ""}" data-t="sec">${sel.sec ? "✓ " : ""}السكشن</button>`);
      body += `<div class="toggles">${t.join("")}</div>`;
      if (c.sections.length > 1 && sel.sec) {
        body += `<label><span class="opt-label">مجموعة السكشن</span><select data-opt>` +
          c.sections.map((o, i) => `<option value="${i}" ${i === (sel.opt || 0) ? "selected" : ""}>${esc(o.label)}: ` +
            o.sessions.map((s) => `${s.kind ? s.kind + " " : ""}${dayAr[s.day]} ${timeRange(s.from, s.to)}`).join(" + ") +
            `</option>`).join("") + `</select></label>`;
      }
    }
    return `<div class="course ${on ? "on" : ""}" data-id="${c.id}">
      <div class="course-head" role="checkbox" aria-checked="${on}" tabindex="0">
        <span class="check"></span>
        <div>
          <div class="course-name">${esc(c.ar)}${c.src !== "mi" ? `<span class="badge">${esc(SOURCES[c.src])}</span>` : ""}</div>
          <div class="course-en">${esc(c.en)}</div>
          <div class="course-meta">${meta}</div>
        </div>
      </div>
      ${on && body ? `<div class="course-body">${body}</div>` : ""}
    </div>`;
  }

  function bindCourse(el) {
    const id = el.dataset.id;
    const head = $(".course-head", el);
    const toggle = () => {
      if (state.selected[id]) {
        delete state.selected[id];
        for (const k of Object.keys(state.changes)) if (k.startsWith(id + "|")) delete state.changes[k];
      } else state.selected[id] = { lec: true, sec: true, opt: 0 };
      renderStep2(); save();
    };
    head.addEventListener("click", toggle);
    head.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
    $$(".toggle", el).forEach((b) => b.addEventListener("click", () => {
      const sel = state.selected[id];
      sel[b.dataset.t] = !sel[b.dataset.t];
      if (!sel.lec && !sel.sec) delete state.selected[id];
      renderStep2(); save();
    }));
    const s = $("select[data-opt]", el);
    if (s) s.addEventListener("change", () => {
      state.selected[id].opt = +s.value;
      for (const k of Object.keys(state.changes)) if (k.startsWith(id + "|S|")) delete state.changes[k];
      renderStep2(); save();
    });
  }

  function renderSummary() {
    const courses = Object.keys(state.selected).length;
    const sess = selectedSessions();
    const clashes = findConflicts(sess);
    const bar = $("#summaryBar");
    bar.classList.toggle("bad", clashes.length > 0);
    let html = courses
      ? `اخترت ${courses} ${courses <= 10 && courses > 2 ? "مواد" : "مادة"} — ${sess.length} ${sess.length <= 10 && sess.length > 2 ? "مواعيد" : "موعد"} في الأسبوع.`
      : "لم تختر أي مادة بعد.";
    if (clashes.length) html += " ⚠ يوجد تعارض: " + clashes.map(([a, b]) => `${esc(a.title)} مع ${esc(b.title)} (${dayAr[a.day]})`).join("، ") +
      " — لو تغير أحد الموعدين عدله في الخطوة التالية.";
    bar.innerHTML = html;
    $("#err2").textContent = "";
  }

  $("#toStep3").addEventListener("click", () => {
    if (!Object.keys(state.selected).length) { $("#err2").textContent = "اختر مادة واحدة على الأقل"; return; }
    go(3);
  });

  /* ---------------- الخطوة 3 ---------------- */
  let editKey = null;
  let draft = null;

  function renderStep3() {
    const anyChange = Object.keys(state.changes).length > 0;
    $("#noChange").classList.toggle("on", state.answered && !anyChange && !$("#yesChange").classList.contains("on"));
    if (anyChange) $("#yesChange").classList.add("on");
    $("#changePanel").hidden = !$("#yesChange").classList.contains("on");
    $("#toStep4").hidden = !state.answered && !anyChange;
    renderSessionList();
    closeEditor();
  }

  $("#noChange").addEventListener("click", () => {
    state.answered = true; save();
    $("#yesChange").classList.remove("on");
    go(4);
  });
  $("#yesChange").addEventListener("click", () => {
    state.answered = true; save();
    $("#yesChange").classList.add("on");
    $("#noChange").classList.remove("on");
    $("#changePanel").hidden = false;
    $("#toStep4").hidden = false;
    renderSessionList();
  });

  function renderSessionList() {
    const list = selectedSessions().sort((a, b) => dayOrder[a.orig.day] - dayOrder[b.orig.day] || a.orig.from - b.orig.from);
    $("#sessionList").innerHTML = list.map((s) => {
      const o = s.orig;
      const when = `${dayAr[o.day]} ${timeRange(o.from, o.to)}`;
      return `<div class="sess ${editKey === s.key ? "on" : ""}" data-key="${s.key}" role="button" tabindex="0">
        <span class="t">${esc(s.title)}</span>
        <span class="w">${esc(s.who)}</span>
        ${s.changed
          ? `<span class="old">${when}</span><span class="new">← ${dayAr[s.day]} ${timeRange(s.from, s.to)}${state.changes[s.key].room ? " — " + esc(s.room) : ""}</span><button type="button" class="undo" data-undo="${s.key}">إلغاء التعديل</button>`
          : `<span class="w">${when} — ${esc(o.room)}</span>`}
      </div>`;
    }).join("");
    $$("#sessionList .sess").forEach((el) => {
      const open = (e) => { if (e.target.closest("[data-undo]")) return; openEditor(el.dataset.key); };
      el.addEventListener("click", open);
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); } });
    });
    $$("#sessionList [data-undo]").forEach((b) => b.addEventListener("click", () => {
      delete state.changes[b.dataset.undo]; save();
      if (editKey === b.dataset.undo) closeEditor();
      renderSessionList();
    }));
  }

  function openEditor(key) {
    const s = selectedSessions().find((x) => x.key === key);
    if (!s) return;
    editKey = key;
    draft = { day: s.day, from: s.from, to: Math.min(s.to, s.from + MAX_SPAN - 1), room: state.changes[key] ? state.changes[key].room || "" : "", fresh: true };
    $("#editName").textContent = s.title;
    $("#newRoom").value = draft.room;
    $("#editor").hidden = false;
    renderEditor();
    renderSessionList();
    $("#editor").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function closeEditor() { editKey = null; draft = null; $("#editor").hidden = true; }

  function renderEditor() {
    $("#dayChips").innerHTML = DAYS.map((d) => `<button type="button" class="chip ${draft.day === d.id ? "on" : ""}" data-day="${d.id}">${d.ar}</button>`).join("");
    $$("#dayChips .chip").forEach((b) => b.addEventListener("click", () => { draft.day = b.dataset.day; draft.fresh = true; renderEditor(); }));

    const busy = new Set();
    for (const s of selectedSessions()) if (s.key !== editKey && s.day === draft.day) for (let n = s.from; n <= s.to; n++) busy.add(n);
    $("#slotChips").innerHTML = SLOTS.map((t) => {
      const on = draft.from && t.n >= draft.from && t.n <= draft.to;
      return `<button type="button" class="slot ${on ? "on" : ""} ${busy.has(t.n) ? "busy" : ""}" data-n="${t.n}" title="${busy.has(t.n) ? "عندك موعد آخر في هذه الفترة" : ""}"><b>${t.from}</b>${t.to}</button>`;
    }).join("");
    $$("#slotChips .slot").forEach((b) => b.addEventListener("click", () => pickSlot(+b.dataset.n)));
    $("#slotHint").textContent = draft.fresh
      ? `اضغط على أول فترة في الموعد الجديد، ثم الفترة المجاورة لها (حتى ${MAX_SPAN} فترات متتالية).`
      : draft.from
      ? `الموعد الجديد: ${dayAr[draft.day]} ${timeRange(draft.from, draft.to)} (${draft.to - draft.from + 1} ${draft.to - draft.from + 1 === 1 ? "فترة" : "فترات"}). اضغط فترة مجاورة لإضافتها، أو فترة طرفية لحذفها.`
      : "اختر فترة البداية.";
  }

  function pickSlot(n) {
    const { from, to } = draft;
    const len = from ? to - from + 1 : 0;
    // أول ضغطة بعد فتح المحرر أو تغيير اليوم تبدأ اختيارا جديدا
    if (!from || draft.fresh) { draft.from = draft.to = n; draft.fresh = false; }
    else if (n === to + 1 && len < MAX_SPAN) draft.to = n;
    else if (n === from - 1 && len < MAX_SPAN) draft.from = n;
    else if (n === from && len > 1) draft.from++;
    else if (n === to && len > 1) draft.to--;
    else draft.from = draft.to = n;
    renderEditor();
  }

  $("#cancelEdit").addEventListener("click", () => { closeEditor(); renderSessionList(); });
  $("#saveEdit").addEventListener("click", () => {
    if (!draft || !draft.from) return;
    draft.room = $("#newRoom").value.trim();
    const s = selectedSessions().find((x) => x.key === editKey);
    const o = s.orig;
    if (draft.day === o.day && draft.from === o.from && draft.to === o.to && !draft.room) delete state.changes[editKey];
    else state.changes[editKey] = { day: draft.day, from: draft.from, to: draft.to, room: draft.room };
    save(); closeEditor(); renderSessionList();
  });

  $("#toStep4").addEventListener("click", () => go(4));

  /* ---------------- ورقة الجدول (نفس تصميم «الجدول الأسبوعي») ---------------- */
  function buildSheet() {
    const sess = selectedSessions();
    const maxSlot = Math.max(10, ...sess.map((s) => s.to));
    const days = DAYS.filter((d) => d.id !== "sat" || sess.some((s) => s.day === "sat"));

    // دليل المواد (عربي – إنجليزي)
    const courses = COURSES.filter((c) => state.selected[c.id]);
    const rows = [];
    for (let i = 0; i < courses.length; i += 2) rows.push(courses.slice(i, i + 2));
    const item = (c) => `<span class="legend-item"><span class="ar">${esc(c.short)}</span> – <span class="en" dir="ltr">${esc(c.en)}</span></span>`;
    const legend = rows.map((r) => `<div class="legend-row ${r.length === 1 ? "single" : ""}">${r.map(item).join("")}</div>`).join("");

    const head = `<tr><th class="corner"><div class="corner-in"><span>الوقت</span><span>اليوم</span></div></th>` +
      SLOTS.slice(0, maxSlot).map((t) => `<th><span class="time">${t.from}</span><span class="time">${t.to}</span></th>`).join("") + `</tr>`;

    // ارتفاع الصفوف بحيث يملأ الجدول الصفحة كما في التصميم الأصلي
    const avail = 794 - 86 - 64 - (rows.length * 34 + 22) - 42 - 16;
    const rowH = Math.max(64, Math.min(110, Math.floor(avail / days.length)));

    const body = days.map((d) => {
      const list = sess.filter((s) => s.day === d.id).sort((a, b) => a.from - b.from);
      // تجميع المواعيد المتداخلة في خلية واحدة
      const clusters = [];
      for (const s of list) {
        const last = clusters[clusters.length - 1];
        if (last && s.from <= last.to) { last.items.push(s); last.to = Math.max(last.to, s.to); }
        else clusters.push({ from: s.from, to: s.to, items: [s] });
      }
      let cells = "", n = 1;
      for (const c of clusters) {
        for (; n < c.from; n++) cells += "<td></td>";
        const html = c.items.map((s) => `<div class="entry">${esc(arDigits(s.title))}<br>${esc(arDigits(s.who))}<br>${esc(arDigits(s.room))}</div>`).join("");
        cells += `<td colspan="${c.to - c.from + 1}" class="filled ${c.items.length > 1 ? "clash" : ""}">${html}</td>`;
        n = c.to + 1;
      }
      for (; n <= maxSlot; n++) cells += "<td></td>";
      return `<tr style="height:${rowH}px"><th>${d.ar}</th>${cells}</tr>`;
    }).join("");

    const el = document.createElement("div");
    el.className = "sheet";
    el.innerHTML = `
      <div class="s-title">${esc(TERM_TITLE)}</div>
      <div class="s-name">${esc(state.name)} — برنامج المعلوماتية الطبية <span class="en" dir="ltr">(Medical Informatics Program)</span></div>
      <div class="legend">${legend}</div>
      <table><thead>${head}</thead><tbody>${body}</tbody></table>`;
    return el;
  }

  // بعد إضافة الورقة للصفحة: نصغر ارتفاع الصفوف لو تجاوزت صفحة A4 واحدة
  function fitSheet(sheet) {
    const trs = $$("tbody tr", sheet);
    let h = trs.length ? parseInt(trs[0].style.height, 10) : 0;
    while (sheet.offsetHeight > 794 && h > 40) {
      h -= 4;
      trs.forEach((tr) => (tr.style.height = h + "px"));
    }
  }

  /* ---------------- الخطوة 4 ---------------- */
  function renderStep4() {
    const sess = selectedSessions();
    const clashes = findConflicts(sess);
    const w = $("#conflicts");
    w.hidden = !clashes.length;
    if (clashes.length) {
      w.innerHTML = `<b>تنبيه: يوجد تعارض في المواعيد</b> — سيظهر الموعدان في نفس الخانة بلون مختلف. لو أحدهما تغير، ارجع وعدله.<ul>` +
        clashes.map(([a, b]) => `<li>${esc(a.title)} و${esc(b.title)} — ${dayAr[a.day]}</li>`).join("") + `</ul>`;
    }
    const holder = $("#previewScale");
    holder.innerHTML = "";
    const sheet = buildSheet();
    holder.appendChild(sheet);
    fitSheet(sheet); fitPreview();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitSheet(sheet); fitPreview(); });
    $("#pdfStatus").textContent = "";
  }

  function fitPreview() {
    const frame = $("#previewFrame"), holder = $("#previewScale"), sheet = $(".sheet", holder);
    if (!sheet || $("#step4").hidden) return;
    const avail = frame.clientWidth - 24;
    const k = Math.min(1, avail / 1123);
    holder.style.width = "1123px";
    holder.style.transform = `scale(${k})`;
    frame.style.height = sheet.offsetHeight * k + 24 + "px";
  }
  window.addEventListener("resize", fitPreview);

  function fileName() {
    const n = (state.name || "جدول").replace(/[\\/:*?"<>|]+/g, " ").trim();
    return `الجدول الأسبوعي - ${n}.pdf`;
  }

  $("#pdfBtn").addEventListener("click", async () => {
    const btn = $("#pdfBtn"), status = $("#pdfStatus");
    if (!window.html2canvas || !window.jspdf) {
      status.textContent = "تعذر تحميل أداة الـ PDF (تأكد من الاتصال بالإنترنت)، أو استخدم زر «طباعة» واختر «حفظ كـ PDF».";
      return;
    }
    btn.disabled = true; status.textContent = "جاري تجهيز الملف…";
    const host = $("#printHost");
    host.innerHTML = "";
    const sheet = buildSheet();
    host.appendChild(sheet);
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      fitSheet(sheet);
      const canvas = await html2canvas(sheet, { scale: 2.5, backgroundColor: "#ffffff", useCORS: true, logging: false });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pw = 297, ph = 210;
      let w = pw, h = (canvas.height / canvas.width) * pw;
      if (h > ph) { h = ph; w = (canvas.width / canvas.height) * ph; }
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", (pw - w) / 2, 0, w, h);
      pdf.save(fileName());
      status.textContent = "تم تحميل الملف ✓";
    } catch (e) {
      console.error(e);
      status.textContent = "حدث خطأ أثناء إنشاء الملف. جرب زر «طباعة» واختر «حفظ كـ PDF».";
    } finally {
      host.innerHTML = "";
      btn.disabled = false;
    }
  });

  $("#printBtn").addEventListener("click", async () => {
    const host = $("#printHost");
    host.innerHTML = "";
    const sheet = buildSheet();
    host.appendChild(sheet);
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    fitSheet(sheet);
    window.print();
  });
  window.addEventListener("afterprint", () => { $("#printHost").innerHTML = ""; });

  /* ---------------- البداية ---------------- */
  go(1);
})();
