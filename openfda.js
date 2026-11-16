const BASE = "https://api.fda.gov/food/enforcement.json";

const sleep = ms => new Promise(r => setTimeout(r, ms));

function buildTerms(item){
    return item
        .toLowerCase()
        .split(" ");
}

async function checkItem(item){
    const terms = buildTerms(item);

    const search = 'product_description:(${terms.join(" AND ")}) AND status:"Ongoing"';
    const params = new URLSearchParams({search, limit: "5", sort: "report_date:desc"}); //https://open.fda.gov/apis/query-parameters/
    if (process.env.OPENFDA_API_KEY) params.set("api_key", process.env.OPENFDA_API_KEY);
    
    console.log(params);
}

async function checkItems(items){
    const payloads = [];
    for (const item of items){
        payloads.push(await checkItem(item));
        await sleep(300); //request limit
    }
    return payloads;
}

module.exports = {checkItem, checkItems};
