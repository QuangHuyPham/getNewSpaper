const cheerio = require('cheerio');
const request = require('sync-request');
var entities = require("entities");

class TuoiTre {
    constructor(url) {
        this.myRequest = request('GET', url, {gzip: true}).getBody().toString();
        this.res = cheerio.load(this.myRequest);
        // console.log(myRequest.getBody().toString());
    }

    trimSpace(str) {
        return str.replace(/\)/gi, "").replace(/^\s*/gi, "").replace(/\n?\t?/gi, "").replace(/<ul>(.*)<\/ul>/gi, "");
    }

    regRemoveHtml(str) {
        return str.replace(/<[^>]*>/gi, "");
    }

    getTitle() {
        return this.trimSpace(this.res('h1.title-2').text());
    }

    getDesc() {
        return this.trimSpace(this.res('h2.txt-head').text());
    }

    getAuth() {
        return this.trimSpace(this.res('div.author').text());
    }

    getTime() {
        let timeArr = this.trimSpace(this.res('span.date').text()).split(/[\s\/:\/,\-]+/);
        let date  = new Date(timeArr[2], parseInt(timeArr[1])-1, timeArr[0], timeArr[3], timeArr[4], 0);
        return date.getTime();
    }

    getContent() {
        let content = [];
        let regPhoto = /<div>\s*<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gim;
        let regCaption = /<p\s[data-]*placeholder=".*">(.*)<\/p>/gim;
        this.res('div.fck', this.myRequest).each((index, element) => {
            this.res(element).html().toString().split(/<p[\sclass=""]*>/).forEach((value) => {
                if(value.search(regPhoto) >= 0) {
                    let p = this.res(`<p>${this.regRemoveHtml(value.slice(0,value.search(regPhoto)))}</p>`).text();
                    content.push({
                        type: 'paragraph',
                        content: this.trimSpace(p)
                    });
                    value = value.replace(regPhoto, (body, value1) => {
                        if(value !== null && value.length > 0) {
                            content.push({
                                type: 'image',
                                content: value1,
                            });
                        }
                    });
                }
                if(value.search(regCaption) >= 0) {
                    value = value.replace(regCaption, (body, value2) => {
                        content.push({
                            type: 'captionImg',
                            content: this.regRemoveHtml(entities.decodeHTML(value2)),
                        })
                    });
                } else {
                    value = value.slice(0, value.search(/<\/p>/));
                    let cont = this.trimSpace(this.res(`<div>${this.regRemoveHtml(value)}</div>`).text());
                    if(cont.toString().length > 0){
                        content.push({
                            type: 'paragraph',
                            content: cont,
                        });
                    }
                }
            });
        });
        return content;
    }

    getResult() {
        return {
            title: this.getTitle(),
            desc: this.getDesc(),
            author: this.getAuth(),
            time: this.getTime(),
            content: this.getContent()
        }
    }
}
module.exports = TuoiTre;