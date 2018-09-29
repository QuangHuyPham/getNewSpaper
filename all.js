// Bỏ khoảng trắng thừa
exports.trimAll = (val) =>  {
    if(val !== null && val.length !== 0) {
        val = val.trim()
            .replace(/\s+/gi, (value)=>{
                return ' ';
            });
        return val;
    } else {
        return null;
    }
};
exports.type = {
    img: "image",
    cap: "caption",
    paragraph: "paragraph"
};


exports.deleteTagHtml= (str) => {
    return str.replace(/<\/?[^>]+(>|$)/g, "")
};

exports.getTimeStamp = (timestamp)=>{

};

// Lấy body báo (HTML)
// exports.getContentSyncRequest = (method, url)=> {
//     const request = require('sync-request');
//     return request(method, url, {
//         'headers': {
//             'user-agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.19 (KHTML, like Gecko) Chrome/1.0.154.53 Safari/525.19'
//         }
//     }).getBody().toString();
// };
//
//
// // Cherrio
// exports.getContentCheerio = (body)=> {
//     const cheerio = require('cheerio');
//     return cheerio.load(body);
// };