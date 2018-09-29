const cheerio = require('cheerio');
const request = require('sync-request');

class DanTri {
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
        return this.trimSpace(this.res('h1.fon31.mgb15').text());
    }

    getDesc() {
        return this.trimSpace(this.res('h2.fon33.mt1.sapo').text());
    }

    getAuth() {
        return this.trimSpace(this.res('div#divNewsContent > p[style="text-align: right;"] > strong').text().trim());
    }

    getTime() {
        let timeArr = this.trimSpace(this.res('span.fr.fon7.mr2.tt-capitalize').text()).split(/[\s\/:\-]+/);
        let date  = new Date(timeArr[4], timeArr[3], parseInt(timeArr[2])-1, timeArr[5], timeArr[6], 0, 0);
        return date.getTime();
    }

    getContent() {
        let content = [];
        let regPhoto = /<div>\s*<img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?><\/div>/gim;
        let regCaption = /((<div\sclass="PhotoCMS_Caption">(.*)<\/div>)|(<p\sstyle="text-align:center;margin:0px;">(.*)<\/p>))/gi;
        this.res('div#divNewsContent', this.myRequest).each((index, element) => {
            this.res(element).html().toString().split(/<p[\sstyle="text\-align:\sjustify;"]*>/).forEach((value) => {
                if(value.search(regPhoto) >= 0) {
                    let p = this.res(`<p>${this.regRemoveHtml(value.slice(0,value.search(regPhoto)))}</p>`).text();
                    content.push({
                        type: 'paragraph',
                        content: this.trimSpace(p)
                    });
                    value = value.replace(regPhoto, (body, value1) => {
                        if(value !== null && value.length > 0) {
                            content.push({
                                enum: 'image',
                                content: value1,
                            });
                        }
                    })
                }
                if(value.search(regCaption) >= 0) {
                    value = value.replace(regCaption, (body, value2) => {
                        content.push({
                            enum: 'captionImg',
                            content: this.regRemoveHtml(value2),
                        });
                    })
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
            contents: this.getContent()
        }
    }
}
module.exports = DanTri;