const CLASS_WEIGHTS = {
    "Class I": 1.0,
    "Class II": 0.6,
    "Class III": 0.2,
};

function daysSince (yyyymmdd, scanDate = new Date()){
    if (!yyyymmdd || yyyymmdd.length !== 8) return 0;
    const y = Number(yyyymmdd.slice(0, 4));
    const m = Number(yyyymmdd.slice(4, 6)) - 1;
    const d = Number(yyyymmdd.slice(6, 8));
    const reportDate = new Date(y, m, d);
    return Math.max(0, (scanDate - reportDate) / (1000 * 60 * 60 * 24)); //return as days
}

function scoreRecall(recall, scanDate = new Date()){ //class * recency
    const key = recall.classification?.trim();
    const classWeight = CLASS_WEIGHTS[key] ?? 0.5;
    const ageDays = daysSince(recall.reportDate, scanDate);

    const recency = Math.exp(-ageDays / 180); //recency decay
    return Number((classWeight * recency).toFixed(2));
}

module.exports = { scoreRecall };