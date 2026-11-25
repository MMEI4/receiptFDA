const US_STATES = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
    MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
    NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
    OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
    SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
    VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
    DC: "District of Columbia"
};

const STATE_KEY = "user_state";
const select = document.getElementById("state-select");
const form = document.getElementById("receipt-form");
const resultsEl = document.getElementById("results");

for (const [code, name] of Object.entries(US_STATES)) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = name;
    select.appendChild(opt);
}

const saved = localStorage.getItem(STATE_KEY);
if (saved && US_STATES[saved]) select.value = saved;

select.addEventListener("change", () => {
    if (select.value) localStorage.setItem(STATE_KEY, select.value);
    else localStorage.removeItem(STATE_KEY);
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    resultsEl.textContent = "Scanning receipt and checking recalls...";

    const formData = new FormData(form);

    try {
        const res = await fetch("/api/check", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

        resultsEl.innerHTML = `<pre>${JSON.stringify(data.results, null, 2)}</pre>`;
    } catch (err) {
        resultsEl.textContent = `Error: ${err.message}`;
    }
});