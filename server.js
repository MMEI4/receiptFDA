const express = require("express");
const multer = require("multer");
const path = require("path");
const Tesseract = require("tesseract.js");
const { parseReceipt } = require("./parseReceipt");
const { checkItems } = require("./openfda");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

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

function resolveState(stateCode) {
    if (typeof stateCode !== "string") return null;
    const code = stateCode.toUpperCase();
    return US_STATES[code] ? { code, name: US_STATES[code] } : null;
}

app.use(express.static(path.join(__dirname, "public")));

app.post("/api/check", upload.single("receipt"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No receipt image uploaded." });
    }

    try {
        const { data } = await Tesseract.recognize(req.file.buffer, "eng");
        const lines = data.text.split("\n").map(l => l.trim()).filter(Boolean);

        const parsed = parseReceipt(lines);
        const itemNames = parsed.map(item => (typeof item === "string" ? item : item.name));

        const location = resolveState(req.body.state);
        const results = await checkItems(itemNames, location);

        res.json({ location, results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));