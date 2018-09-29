const cheerio = require('cheerio');
const request = require('sync-request');
var entities = require("entities");

class AutoDaily {
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
        return this.trimSpace(this.res('h1.single-title').text());
    }

    getDesc() {
        return this.trimSpace(this.res('p.description').text());
    }

    getAuth() {
        return this.getContent()[this.getContent().length-1].content;
    }

    getTime() {
        let timeArr = this.trimSpace(this.res('p.datetime').text()).split(/[\s\/:\/,\-]+/);
        let date;
        console.log(timeArr);
        date  = new Date(timeArr[5], parseInt(timeArr[4])-1, timeArr[3], timeArr[0], timeArr[1], 0);
        return date.getTime();
    }

    getContent() {
        let content = [];
        let regPhoto = /<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gim;
        let regCaption = /<em\sstyle="[^>]*">(.*)/gim;
        this.res('div.news-content', this.myRequest).each((index, element) => {
            this.res(element).html().toString().split('<p>').join('<p>').split(/<p\s?/).forEach((value) => {
                if(value.search('>' ))
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
                    })
                } else if(value.search(regCaption) >= 0) {
                    value = value.replace(regCaption, (body, value2) => {
                        content.push({
                            type: 'captionImg',
                            content: this.regRemoveHtml(entities.decodeHTML(value2)),
                        })
                    });
                } else {
                    value = value.slice(0, value.search(/<\/p>/));
                    let cont = this.trimSpace(this.res(`<p>${this.regRemoveHtml(value)}</p>`).text());
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
module.exports = AutoDaily;