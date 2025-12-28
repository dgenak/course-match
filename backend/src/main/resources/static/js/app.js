// ================== ELEMENTS ==================
const descA = document.getElementById("descA");
const descB = document.getElementById("descB");
const outcomesA = document.getElementById("outcomesA");
const outcomesB = document.getElementById("outcomesB");

const countA = document.getElementById("countA");
const countB = document.getElementById("countB");

const btnCompare = document.getElementById("btnCompare");
const btnClear = document.getElementById("btnClear");
const standardSelect = document.getElementById("standardSelect");

// ================== COUNTERS ==================
function updateCounts() {
  countA.textContent = (descA.value + outcomesA.value).length;
  countB.textContent = (descB.value + outcomesB.value).length;
}

// ================== RESULT ==================
function setResult(sim) {
  const result = document.getElementById("result");
  const percent = document.getElementById("percent");
  const badge = document.getElementById("badge");
  const interp = document.getElementById("interpretation");
  const fill = document.getElementById("barFill");

  result.classList.remove("hidden");

  percent.textContent = `${sim.toFixed(2)}%`;
  fill.style.width = `${sim}%`;

  if (sim < 40) {
    fill.style.background = "#e74c3c";
    badge.textContent = "LOW";
    interp.textContent = "Χαμηλή αντιστοίχιση. Μάλλον διαφορετικές θεματικές.";
  } else if (sim < 70) {
    fill.style.background = "#f1c40f";
    badge.textContent = "MEDIUM";
    interp.textContent = "Μέτρια αντιστοίχιση. Υπάρχουν κοινά σημεία.";
  } else {
    fill.style.background = "#2ecc71";
    badge.textContent = "HIGH";
    interp.textContent = "Υψηλή αντιστοίχιση. Πολύ κοντινό περιεχόμενο.";
  }
}

// ================== MISSING TOPICS ==================
function showMissing(missing) {
  const section = document.getElementById("missingSection");
  const box = document.getElementById("missingTopics");

  box.innerHTML = "";
  section.classList.remove("hidden");

  if (!missing || missing.length === 0) {
    box.innerHTML = "<p>✔ Δεν λείπουν βασικές θεματικές.</p>";
    return;
  }

  const ul = document.createElement("ul");
  missing.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });

  box.appendChild(ul);
}

// ================== COMPARE ==================
async function compare() {
  if (
    !descA.value.trim() ||
    !descB.value.trim() ||
    !outcomesA.value.trim() ||
    !outcomesB.value.trim()
  ) {
    alert("Συμπλήρωσε περιγραφή και learning outcomes και για τα δύο μαθήματα.");
    return;
  }

  btnCompare.disabled = true;
  btnCompare.textContent = "⏳ Σύγκριση...";

  try {
    const response = await fetch("http://127.0.0.1:8000/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base_course: {
          title: "Course A",
          description: descA.value,
          learning_outcomes: outcomesA.value
        },
        other_course: {
          title: "Course B",
          description: descB.value,
          learning_outcomes: outcomesB.value
        }
      })
    });

    if (!response.ok) {
      throw new Error("API error: " + response.status);
    }

    const data = await response.json();

    setResult(Number(data.similarity));
    showMissing(data.analysis?.missing_from_B || []);

  } catch (err) {
    console.error(err);
    alert("Σφάλμα στο NLP service. Δες console.");
  } finally {
    btnCompare.disabled = false;
    btnCompare.textContent = "🔍 Σύγκριση";
  }
}

// ================== CLEAR ==================
function clearAll() {
  descA.value = "";
  descB.value = "";
  outcomesA.value = "";
  outcomesB.value = "";

  descA.disabled = false;
  outcomesA.disabled = false;

  standardSelect.value = "";

  updateCounts();

  document.getElementById("result").classList.add("hidden");
  document.getElementById("missingSection").classList.add("hidden");
}

// ================== STANDARD COURSES ==================
async function loadStandardCourses() {
  try {
    const res = await fetch("/api/standard-courses");
    const courses = await res.json();

    courses.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.title;
      opt.dataset.desc = c.description;
      opt.dataset.outcomes = c.learning_outcomes;
      standardSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to load standard courses", err);
  }
}

function onStandardChange(e) {
  const opt = e.target.selectedOptions[0];

  // χειροκίνητη εισαγωγή
  if (!opt || !opt.value) {
    descA.value = "";
    outcomesA.value = "";
    descA.disabled = false;
    outcomesA.disabled = false;
    updateCounts();
    return;
  }

  descA.value = opt.dataset.desc;
  outcomesA.value = opt.dataset.outcomes;

  descA.disabled = true;
  outcomesA.disabled = true;

  updateCounts();
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  loadStandardCourses();

  descA.addEventListener("input", updateCounts);
  descB.addEventListener("input", updateCounts);
  outcomesA.addEventListener("input", updateCounts);
  outcomesB.addEventListener("input", updateCounts);

  btnCompare.addEventListener("click", compare);
  btnClear.addEventListener("click", clearAll);
  standardSelect.addEventListener("change", onStandardChange);

  updateCounts();
});
