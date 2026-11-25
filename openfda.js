const { scoreRecall } = require("./risk");
const BASE = "https://api.fda.gov/food/enforcement.json";

const sleep = ms => new Promise(r => setTimeout(r, ms));

function buildTerms(item){
    return item
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
}

async function checkItem(item, location){
    const terms = buildTerms(item);
    if (terms.length === 0) return { item, query: "", total: 0, recalls: [] };

    let search = `product_description:(${terms.join(" AND ")}) AND status:"Ongoing"`;
    if (location?.code && location?.name) {
        search += ` AND distribution_pattern:("${location.code}" OR "${location.name}" OR "Nationwide")`;
    }

    const params = new URLSearchParams({search, limit: "5", sort: "report_date:desc"}); //https://open.fda.gov/apis/query-parameters/
    if (process.env.OPENFDA_API_KEY) params.set("api_key", process.env.OPENFDA_API_KEY);
    
    try {
        const res = await fetch(`${BASE}?${params}`);
        if (res.status === 404) return { item, query: search, total: 0, recalls: [] };
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        // console.log("--------------------------------------------------------------------------------") //debugging
        // console.log(json);
        const recalls = (json.results ?? []).map(r => {
            const recall = {
                    recallNumber: r.recall_number,
                    classification: r.classification,
                    product: r.product_description,
                    reason: r.reason_for_recall,
                    firm: r.recalling_firm,
                    reportDate: r.report_date,
                    codeInfo: r.code_info,     
            }
            return {...recall, riskScore: scoreRecall(recall)};
        }).sort((a,b) => b.riskScore - a.riskScore);

        return {item, query: search, total: json.meta?.results?.total ?? 0, recalls}
    } catch (err) {
        return { item, query: search, status: "error", error: err.message, total: 0, recalls: [] };
    }
}

async function checkItems(items, location){
    const payloads = [];
    for (const item of items){
        payloads.push(await checkItem(item, location));
        await sleep(300); //request limit
    }
    return payloads;
}

// if (require.main === module) {
//     (async () => {
//         console.log(JSON.stringify(await checkItem("hoagie rolls", { code: "CA", name: "California" }), null, 2));    })();
// }

module.exports = {checkItem, checkItems};
