import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const DEFAULT_CITIES = [
  {
    "id": 1,
    "name": "اسفراین",
    "base": 469000,
    "total": 553000
  },
  {
    "id": 2,
    "name": "مشهد، چناران، شاهرود، بینالود",
    "base": 965000,
    "total": 1154000
  },
  {
    "id": 3,
    "name": "فریمان",
    "base": 1050000,
    "total": 1254000
  },
  {
    "id": 4,
    "name": "ایوانکی",
    "base": 1424000,
    "total": 1693000
  },
  {
    "id": 5,
    "name": "آمل، محمودآباد",
    "base": 1658000,
    "total": 1981000
  },
  {
    "id": 6,
    "name": "بوئین زهرا",
    "base": 1686000,
    "total": 2014000
  },
  {
    "id": 7,
    "name": "یزد",
    "base": 1763000,
    "total": 2107000
  },
  {
    "id": 8,
    "name": "سلفچگان",
    "base": 1723000,
    "total": 2150000
  },
  {
    "id": 9,
    "name": "همدان، تاکستان و ابهر",
    "base": 1909000,
    "total": 2281000
  },
  {
    "id": 10,
    "name": "مبارکه (موقت)",
    "base": 2041000,
    "total": 2335000
  },
  {
    "id": 11,
    "name": "خمین",
    "base": 2107000,
    "total": 2517000
  },
  {
    "id": 12,
    "name": "اصفهان، کوهپایه، سفیددشت و بروجن",
    "base": 2135000,
    "total": 2552000
  },
  {
    "id": 13,
    "name": "اردبیل، دزفول و بستان آباد",
    "base": 2601000,
    "total": 3108000
  },
  {
    "id": 14,
    "name": "اهواز و جلفا",
    "base": 2745000,
    "total": 3250000
  },
  {
    "id": 15,
    "name": "گرمسار",
    "base": 1385000,
    "total": 1650000
  },
  {
    "id": 16,
    "name": "کرمان",
    "base": 1890000,
    "total": 2258000
  },
  {
    "id": 17,
    "name": "قدس",
    "base": 945600,
    "total": 1130000
  },
  {
    "id": 18,
    "name": "بریکت",
    "base": 2135000,
    "total": 2552000
  },
  {
    "id": 19,
    "name": "کرمانشاه",
    "base": 2200000,
    "total": 2629000
  },
  {
    "id": 20,
    "name": "میانه",
    "base": 2500000,
    "total": 2987000
  },
  {
    "id": 21,
    "name": "مهربز یزد",
    "base": 1990000,
    "total": 2378000
  },
  {
    "id": 22,
    "name": "اردکان",
    "base": 1798000,
    "total": 2148000
  },
  {
    "id": 23,
    "name": "ارومیه",
    "base": 2768000,
    "total": 3308000
  },
  {
    "id": 24,
    "name": "خرمشهر",
    "base": 2869000,
    "total": 3463000
  }
];
const KEYS = { cities: "freight.cities.v2", settings: "freight.settings.v2" };
const DEFAULT_SETTINGS = { insurance: 500000, theme: "dark" };
const $ = id => document.getElementById(id);
const digits = value => String(value).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
const onlyDigits = value => digits(value).replace(/\D/g, "");
const number = value => Number(onlyDigits(value) || 0);
const fmt = value => Number(value || 0).toLocaleString("en-US");
const norm = value => digits(value).replace(/ي/g,"ی").replace(/ك/g,"ک").trim().toLowerCase();

function load(key, fallback) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
  catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { toast("ذخیره اطلاعات انجام نشد."); return false; }
}
let cities = load(KEYS.cities, null);
let settings = { ...DEFAULT_SETTINGS, ...load(KEYS.settings, {}) };
if (!Array.isArray(cities)) { cities = DEFAULT_CITIES.map(c => ({...c})); save(KEYS.cities, cities); }
if (!["dark","light"].includes(settings.theme)) settings.theme = "dark";
settings.insurance = Math.max(0, Number(settings.insurance) || 0);
settings.tax = Math.max(0, settings.tax || 0);
let selectedCity = null, filteredCities = [], activeIndex = -1, toastTimer;

function toast(message) {
  $("toast").textContent = message; $("toast").classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $("toast").classList.remove("show"), 1800);
}
function setTheme(theme) {
  settings.theme = theme;
  document.documentElement.dataset.theme = theme;
  $("themeToggle").textContent = theme === "dark" ? "☼" : "☾";
  $("darkMode").classList.toggle("active", theme === "dark");
  $("lightMode").classList.toggle("active", theme === "light");
  save(KEYS.settings, settings);
}
setTheme(settings.theme);

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === id));
  document.querySelectorAll(".bottom-item").forEach(b => b.classList.toggle("active", b.dataset.page === id));
  const subtitles = { calculatorPage:"اطلاعات بار و محاسبه کرایه", citiesPage:"افزودن و مدیریت تعرفه شهرها", settingsPage:"تنظیمات برنامه" };
  $("pageSubtitle").textContent = subtitles[id];
  if (id === "citiesPage") renderCities();
}
document.querySelectorAll(".bottom-item").forEach(b => b.addEventListener("click", () => showPage(b.dataset.page)));
$("themeToggle").addEventListener("click", () => setTheme(settings.theme === "dark" ? "light" : "dark"));
$("darkMode").addEventListener("click", () => setTheme("dark"));
$("lightMode").addEventListener("click", () => setTheme("light"));
$("refresh").addEventListener("click",() => { $("taxInput").value = fmt(settings.tax); calculate(); });
function formatInput(input) {
  const raw = onlyDigits(input.value);
  input.value = raw ? fmt(raw) : "";
  return raw;
}
document.querySelectorAll(".numeric-input").forEach(input => {
  input.addEventListener("input", () => {
    formatInput(input);
    if (["weightInput","insuranceInput","taxInput"].includes(input.id)) calculate();
  });
  input.addEventListener("keydown", e => {
    const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Tab","Home","End","Enter"];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^[0-9۰-۹٠-٩]$/.test(e.key)) e.preventDefault();
  });
});

// با Enter از یک ورودی به ورودی بعدی برو؛ در فرم شهر، Enter در آخرین ورودی ثبت می‌کند.
function enterNext(inputIds, submitLast = false) {
  inputIds.forEach((id, index) => {
    $(id).addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (index < inputIds.length - 1) $(inputIds[index + 1]).focus();
      else if (submitLast) $("cityForm").requestSubmit();
      else if (id === "weightInput") $("cityInput").focus();
      else if (id === "insuranceInput") $("clearCalculator").focus();
    });
  });
}
enterNext(["weightInput","cityInput","insuranceInput"]);
enterNext(["newId","newName","newBase","newTotal"], true);

function clearCityChoice() {
  selectedCity = null;
  $("baseRate").value = ""; $("totalRate").value = "";
  calculate();
}
function renderSuggestions() {
  const query = norm($("cityInput").value), box = $("cityResults");
  box.innerHTML = ""; filteredCities = []; activeIndex = -1;
  if (!query) { box.classList.remove("open"); clearCityChoice(); return; }
  filteredCities = cities.filter(c => norm(c.name).includes(query) || String(c.id) === query)
    .sort((a,b) => (String(a.id) === query ? -1 : 0) - (String(b.id) === query ? -1 : 0));
  if (!filteredCities.length) {
    const empty = document.createElement("div"); empty.className = "no-result"; empty.textContent = "شهری پیدا نشد."; box.appendChild(empty);
  } else {
    filteredCities.forEach((city,index) => {
      const item = document.createElement("div"); item.className = "result-item"; item.textContent = `${city.id} - ${city.name}`;
      item.addEventListener("mousedown", e => { e.preventDefault(); chooseCity(city); });
      box.appendChild(item);
    });
  }
  box.classList.add("open"); clearCityChoice();
}
function chooseCity(city) {
  selectedCity = city; $("cityInput").value = `${city.id} - ${city.name}`;
  $("baseRate").value = fmt(city.base); $("totalRate").value = fmt(city.total);
  $("cityResults").classList.remove("open"); $("cityError").textContent = "";
  calculate(); $("insuranceInput").focus();
}
$("cityInput").addEventListener("input", renderSuggestions);
$("cityInput").addEventListener("keydown", e => {
  const items = [...$("cityResults").querySelectorAll(".result-item")];
  if (e.key === "ArrowDown" && items.length) { e.preventDefault(); activeIndex = (activeIndex + 1) % items.length; }
  else if (e.key === "ArrowUp" && items.length) { e.preventDefault(); activeIndex = (activeIndex - 1 + items.length) % items.length; }
  else if (e.key === "Enter") {
    e.preventDefault();
    if (!filteredCities.length) { $("insuranceInput").focus(); return; }
    const q = norm($("cityInput").value), exact = cities.find(c => String(c.id) === q);
    if (exact) chooseCity(exact);
    else if (filteredCities.length === 1) chooseCity(filteredCities[0]);
    else if (activeIndex >= 0) chooseCity(filteredCities[activeIndex]);
    else $("cityError").textContent = "با کلیدهای بالا و پایین شهر را انتخاب کنید.";
  } else if (e.key === "Escape") $("cityResults").classList.remove("open");
  items.forEach((item,i) => item.classList.toggle("active", i === activeIndex));
  if (items[activeIndex]) items[activeIndex].scrollIntoView({block:"nearest"});
});
document.addEventListener("click", e => {
  if (!$("cityRow").contains(e.target)) $("cityResults").classList.remove("open");
});

function calculate() {
  const weightRaw = number($("weightInput").value);
  const insurance = number($("insuranceInput").value);
  const tax=($("taxInput").value);
  const validWeight = weightRaw >= 1 && weightRaw <= 28000;
  $("weightError").textContent = $("weightInput").value && !validWeight ? "وزن باید بین ۱ تا ۲۸۰۰۰ کیلوگرم باشد." : "";
  if (!selectedCity || !validWeight) {
    $("finalBase").textContent = "۰ "; $("finalTotal").textContent = "۰ "; $("finaltax").textContent = "۰ "; return;
  }
  const weight = weightRaw / 1000;
  const basetotal=selectedCity.base * weight*10
  console.log((basetotal*tax)/100,tax);

  $("finalBase").textContent = `${fmt(selectedCity.base * weight*10)} `;
  $("finalTotal").textContent = `${fmt((selectedCity.total * weight + (insurance))*10)} `;
  $("finaltax").textContent=`${fmt(((basetotal*tax)/100)+(insurance*10))}`;
}
$("clearCalculator").addEventListener("click", () => {
  $("weightInput").value = ""; $("cityInput").value = ""; $("insuranceInput").value = fmt(settings.insurance);
  $("taxInput").value = fmt(settings.tax);
  $("baseRate").value = ""; $("totalRate").value = ""; $("weightError").textContent = ""; $("cityError").textContent = "";
  $("cityResults").classList.remove("open"); selectedCity = null; calculate(); $("weightInput").focus();
});
document.querySelectorAll(".copy-btn").forEach(btn => btn.addEventListener("click", async () => {
  const value = $(btn.dataset.copy).textContent;
  try {
    await navigator.clipboard.writeText(value); btn.textContent = "کپی شد"; setTimeout(() => btn.textContent = "کپی", 1300);
  } catch {
    const t = document.createElement("textarea"); t.value = value; document.body.appendChild(t); t.select();
    const ok = document.execCommand("copy"); t.remove(); toast(ok ? "مبلغ کپی شد." : "کپی انجام نشد.");
  }
}));

// مدیریت شهرها
function resetCityForm() {
  $("cityForm").reset(); $("editingId").value = ""; $("saveCity").textContent = "ثبت شهر"; $("cancelEdit").classList.add("hidden");
}
$("cancelEdit").addEventListener("click", resetCityForm);
function renderCities() {
  const query = norm($("citySearch").value), list = $("cityList"); list.innerHTML = "";
  const matches = cities.filter(c => norm(c.name).includes(query) || String(c.id).includes(query)).sort((a,b) => a.id-b.id);
  if (!matches.length) { const empty = document.createElement("p"); empty.className = "no-result"; empty.textContent = "شهری پیدا نشد."; list.appendChild(empty); }
  matches.forEach(city => {
    const row = document.createElement("div"); row.className = "city-row";
    const code = document.createElement("span"); code.className = "city-code"; code.textContent = city.id;
    const name = document.createElement("span"); name.className = "city-name"; name.textContent = city.name;
    const prices = document.createElement("span"); prices.className = "city-prices"; prices.textContent = `${fmt(city.base)} / ${fmt(city.total)}`;
    const actions = document.createElement("div"); actions.className = "city-actions";
    const edit = document.createElement("button"); edit.textContent = "ویرایش"; edit.type = "button";
    edit.addEventListener("click", () => {
      $("editingId").value = city.id; $("newId").value = city.id; $("newName").value = city.name;
      $("newBase").value = fmt(city.base); $("newTotal").value = fmt(city.total);
      $("saveCity").textContent = "ذخیره تغییرات"; $("cancelEdit").classList.remove("hidden"); $("newId").focus();
      $("cityForm").scrollIntoView({behavior:"smooth",block:"start"});
    });
    const del = document.createElement("button"); del.textContent = "حذف"; del.type = "button"; del.className = "delete";
    del.addEventListener("click", () => {
      if (!confirm(`شهر «${city.name}» حذف شود؟`)) return;
      cities = cities.filter(c => c.id !== city.id); save(KEYS.cities,cities);
      if (selectedCity && selectedCity.id === city.id) $("clearCalculator").click();
      renderCities(); toast("شهر حذف شد.");
    });
    actions.append(edit,del); row.append(code,name,prices,actions); list.appendChild(row);
  });
}
$("citySearch").addEventListener("input", renderCities);
$("cityForm").addEventListener("submit", e => {
  e.preventDefault();
  const idText = onlyDigits($("newId").value), id = Number(idText), name = $("newName").value.trim();
  const base = number($("newBase").value), total = number($("newTotal").value), editing = $("editingId").value;
  if (!idText || !Number.isSafeInteger(id) || id <= 0 || !name || base <= 0 || total <= 0) { toast("همه فیلدها را کامل و صحیح وارد کنید."); return; }
  if (cities.some(c => c.id === id && String(c.id) !== editing)) { toast("این کد شهر قبلاً ثبت شده است."); $("newId").focus(); return; }
  if (editing) {
    const i = cities.findIndex(c => String(c.id) === editing);
    if (i >= 0) cities[i] = {id,name,base,total};
    toast("شهر ویرایش شد.");
  } else { cities.push({id,name,base,total}); toast("شهر جدید اضافه شد."); }
  save(KEYS.cities,cities); resetCityForm(); renderCities();
  if (selectedCity && selectedCity.id === id) chooseCity(cities.find(c => c.id === id));
});

// تنظیمات
$("defaultInsurance").value = fmt(settings.insurance);
$("insuranceInput").value = fmt(settings.insurance);
$("defaultTAX").value = settings.tax;

$("saveInsurance").addEventListener("click", () => {
  settings.insurance = number($("defaultInsurance").value); 
  settings.tax=$("defaultTAX").value;
  save(KEYS.settings,settings);
  $("defaultTAX").value = settings.tax;
  $("defaultInsurance").value = fmt(settings.insurance); toast("تنظیمات پیش‌فرض  ذخیره شد.");
});
$("exportBackup").addEventListener("click", async () => {
  const backup = JSON.stringify({cities,settings},null,2);
  try {
    if (Capacitor.isNativePlatform()) {
      const file = await Filesystem.writeFile({
        path: "freight-backup.json",
        data: backup,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });
      await Share.share({
        title: "نسخه پشتیبان محاسبه کرایه بار",
        text: "فایل پشتیبان شهرها و تنظیمات برنامه",
        url: file.uri,
        dialogTitle: "ذخیره یا ارسال نسخه پشتیبان"
      });
      toast("نسخه پشتیبان آماده اشتراک‌گذاری است.");
    } else {
      const blob = new Blob([backup],{type:"application/json"});
      const url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = "freight-backup.json"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  } catch (error) {
    console.error(error);
    toast("ساخت نسخه پشتیبان انجام نشد.");
  }
});
$("importBackup").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.cities) || !data.settings || !data.cities.every(c => Number(c.id)>0 && String(c.name||"").trim() && Number(c.base)>0 && Number(c.total)>0)) throw Error();
    if (!confirm("اطلاعات فعلی با نسخه پشتیبان جایگزین شود؟")) return;
    cities = data.cities.map(c => ({id:Number(c.id),name:String(c.name),base:Number(c.base),total:Number(c.total)}));
    settings = {...DEFAULT_SETTINGS,...data.settings}; settings.theme = settings.theme === "light" ? "light" : "dark";
    settings.insurance = Math.max(0,Number(settings.insurance)||0);
    settings.tax = Math.max(0,settings.tax||0);
    save(KEYS.cities,cities); save(KEYS.settings,settings); setTheme(settings.theme);
    $("defaultInsurance").value = fmt(settings.insurance); $("insuranceInput").value = fmt(settings.insurance);
    $("defaultTAX").value = settings.tax; $("defaultTAX").value = settings.tax;
    $("clearCalculator").click(); renderCities(); toast("نسخه پشتیبان بازیابی شد.");
  } catch { toast("فایل پشتیبان معتبر نیست."); }
  e.target.value = "";
});
$("restoreDefaults").addEventListener("click", () => {
  if (!confirm("فهرست شهرها به اطلاعات اولیه برگردد؟")) return;
  cities = DEFAULT_CITIES.map(c => ({...c})); save(KEYS.cities,cities); renderCities(); $("clearCalculator").click(); toast("شهرهای اولیه بازگردانی شدند.");
});

renderCities();
$("clearCalculator").click();
