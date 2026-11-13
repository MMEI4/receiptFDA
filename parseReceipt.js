
const ITEM_PRICE = /(\d+\.\d{2})/;

function cleanName(line){
    const words = line.replace(/\$/g," ").split(/\s+/).filter(Boolean);
    const result = words.filter(word => {
        return !(word.length === 1 || /\d{4,}\S?/.test(word) || ITEM_PRICE.test(word) || /[^A-Za-z0-9]/g.test(word)); //strips singles, long serial numbers, and price
    });
    if (result.length > 1 && /^[A-Z]{1,2}(\s|$)/.test(result.at(-1))){ //remove item flags
        result.length -= 1;
    }
    return result.join(" ");
}

//lines with items most likely do not conntain any of these words
const NOT_ITEM = /(sub\s*total|t?otal|tax|saving|reg(ular)?|change|cash|paid|net|items|mastercard|visa|amex|debit|credit)/i;

function parseReceipt(lines) {
    const result = [];
    for (const line of lines){
        if (NOT_ITEM.test(line) || !ITEM_PRICE.test(line)) continue;
        result.push(cleanName(line));
    }
    return result.filter(Boolean);
}

module.exports = {parseReceipt};