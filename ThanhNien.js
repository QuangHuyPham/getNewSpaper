const cheerio = require('cheerio');
const request = require('sync-request');
var entities = require("entities");

class ThanhNien {
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
        return this.trimSpace(this.res('h1.main-title.cms-title').text());
    }

    getDesc() {
        return this.trimSpace(this.res('div.sapo.cms-desc').text());
    }

    getAuth() {
        // return this.getContent()[this.getContent().length-1].content;
        return this.trimSpace(this.res('p[style="text-align: right;"] > strong').text());
    }

    getTime() {
        let timeArr = this.trimSpace(this.res('time').text()).split(/[\s\/:\/,\-]+/);
        let date;

        if(timeArr[2] === 'PM') {
            date  = new Date(timeArr[5], parseInt(timeArr[4])-1, timeArr[3], parseInt(timeArr[0])+12, timeArr[1], 0);
        } else {
            date  = new Date(timeArr[5], parseInt(timeArr[4])-1, timeArr[3], timeArr[0], timeArr[1], 0);
        }
        return date.getTime();
    }

    getContent() {
        let content = [];
        let regPhoto = /<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?/gim;
        let regCaption = /<div\sclass="caption">\s*(.*)/gim;
        this.res('div.cms-body', this.myRequest).each((index, element) => {
            this.res(element).html().toString().split('<div>').forEach((value) => {
                if(value.search(regPhoto) >= 0) {
                    // .replace(/<article\sclass="story\sclearfix">\s*<figure>\s*<a\s[^>]*><img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*/, "")
                    value = value.replace(/<article\b[^>]*>([\s\S]*?)<\/article>/, "").replace(regPhoto, (body, value1) => {
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
                }
                else {
                    value = value.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/, "").slice(0, value.lastIndexOf(/<\/div>/));
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
module.exports = ThanhNien;