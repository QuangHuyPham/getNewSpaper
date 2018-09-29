const DanTri    = require('./get');
const TriThucTre     = require('./getTriThucTre');
const AutoDaily     = require('./getAutoDaily');
const ThanhNien     = require('./ThanhNien');
const TuoiTre     = require('./TuoiTre');
const BongDaPlus     = require('./BongDaPlus');

let url       = {
    dantri: 'https://dantri.com.vn/su-kien/australia-canh-giac-truoc-cuoc-do-bo-cua-nha-giau-trung-quoc-20180929154845623.htm',

    trithuctre: 'http://ttvn.vn/chinh-tri/thu-tuong-chua-de-cap-viec-tang-cac-loai-thue-phi-20170830215317036.htm',

    autodaily: 'http://autodaily.vn/2017/09/dai-gia-dinh-navara-cung-dam-me-chinh-phuc-moi-dia-hinh/',

    thanhnien: 'http://thanhnien.vn/giao-duc/nhung-ngoi-truong-cho-sap-875309.html',

    tuoitre: 'http://tuoitre.vn/tesla-nang-cap-xe-ho-tro-khach-hang-giua-bao-irma-20170911164438346.htm',

    bongdaplus:
        'http://bongdaplus.vn/tin-tuc/champions-league/nhan-dinh-bong-da-barcelona-vs-juventus-01h45-ngay-13-9-ngay-barca-phuc-han-1964001709.html',
}
let getUrl    = new DanTri(url["dantri"]);
console.log(JSON.stringify(getUrl.getResult(), null, 2));