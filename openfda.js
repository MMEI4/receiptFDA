const BASE = "https://api.fda.gov/food/enforcement.json";

const sleep = ms => new Promise(r => setTimeout(r, ms));

function buildTerms(item){
    return item
        .toLowerCase()
        .split(" ");
}

async function checkItem(item){
    const terms = buildTerms(item);

    const search = `product_description:(${terms.join(" AND ")}) AND status:"Ongoing"`;
    const params = new URLSearchParams({search, limit: "1", sort: "report_date:desc"}); //https://open.fda.gov/apis/query-parameters/
    if (process.env.OPENFDA_API_KEY) params.set("api_key", process.env.OPENFDA_API_KEY);
    
    try {
        const res = await fetch(`${BASE}?${params}`);
        const json = await res.json();
        //console.log(json);
        return {
            item,
            query: search,
            total: json.meta?.results?.total,
            recalls: json.results.map(r => ({
                recallNumber: r.recall_number,
                classification: r.classification,
                product: r.product_description,
                reason: r.reason_for_recall,
                firm: r.recalling_firm,
                reportDate: r.report_date,
            })),
        };
    } catch (err) {
        return { item, query: search, status: "error", error: err.message, total: 0, recalls: [] };
    }
}

async function checkItems(items){
    const payloads = [];
    for (const item of items){
        payloads.push(await checkItem(item));
        await sleep(300); //request limit
    }
    return payloads;
}

//checkItem("banana")

module.exports = {checkItem, checkItems};
