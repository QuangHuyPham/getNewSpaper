const cheerio = require('cheerio');
const request = require('sync-request');
const entities = require("entities");

class BongDaPlus {
    constructor(url) {
        this.myRequest = request('GET', url, {gzip: true}).getBody().toString();
        this.res = cheerio.load(this.myRequest);
        // console.log(myRequest.getBody().toString());
    }

    trimSpace(str) {
        return str.replace(/\)/gi, "").replace(/^\s*/gi, "").replace(/\n?\t?/gi, "");
    }

    regRemoveHtml(str) {
        return str.replace(/<[^>]*>/gi, "");
    }

    getTitle() {
        return this.trimSpace(this.res('h1.tit').text());
    }

    getDesc() {
        let des = this.trimSpace(this.res('div.summ').html()).split(/<div\sclass="nref">/);
        return this.regRemoveHtml(entities.decodeHTML(des[0]));
    }

    getAuth() {
        return this.trimSpace(this.res('div.auth > b').text());
    }

    getTime() {
        let timeArr = this.trimSpace(this.res('div.period').text()).split(/[\s\/:\/,\-]+/);
        let date  = new Date(timeArr[5], parseInt(timeArr[4])-1, timeArr[3], timeArr[0], timeArr[1], 0);
        return date.getTime();
    }

    getContent() {
        let content = [];
        let regPhoto = /<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gim;
        let regCaption = /<div\sclass="thumcap"[^>]*>(.*)/gim;
        this.res('div.content', this.myRequest).each((index, element) => {
            this.res(element).html().toString().split(/<div\sstyle="[^>]*">/).join('<div>').split('<h2>').join('<div>').split(/<div>/).forEach((value) => {
                if(value.search(regPhoto) >= 0) {
                    // let p = this.res(`<p>${this.regRemoveHtml(value.slice(0,value.search(regPhoto)))}</p>`).text();
                    // content.push({
                    //     type: 'paragraph',
                    //     content: this.trimSpace(p)
                    // });
                    value = value.replace(regPhoto, (body, value1) => {
                        if(value !== null && value.length > 0) {
                            content.push({
                                type: 'image',
                                content: value1,
                            });
                        }
                    });
                    if(value.search(regCaption) >= 0) {
                        value = value.replace(regCaption, (body, value2) => {
                            content.push({
                                type: 'captionImg',
                                content: this.regRemoveHtml(entities.decodeHTML(value2)),
                            });
                        });
                    };
                }
                else {
                    value = value.slice(0, value.search(/<\/div>/));
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
module.exports = BongDaPlus;