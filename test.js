import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
    const res = await axios.get('https://kashoob.com/audio/E5xab/%d8%b9%d9%84%db%8c-%d8%b9%d9%84%db%8c-%d8%b9%d9%84%db%8c-%d8%a8%d8%a7%d8%a8%d8%a7%d9%85%d9%87-%d8%b9%d9%84%db%8c');
    const $ = cheerio.load(res.data);
    let hrefs = []
    $('a').each((i, el) => {
        hrefs.push($(el).attr('href'))
    });
    console.log(hrefs);
}
test();
