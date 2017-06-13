var cheerio = require('cheerio'),
	request = require('request'),
	json2csv = require('json2csv'),
	fs = require('fs'),
	prompt = require('prompt');

function scrapASM(uri, cb) {
	var data = [];

	request(uri, function (error, response, html) {
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(html);

			$("tbody").eq(2).find('tr').each(function(i, elem) {
				var cells = $(this).children();
				data.push({"date": cells.first().text(),
					"score": cells.eq(2).text(),
					"resultat": cells.eq(12).find("img").attr("src") });
			});
			
			cb(data);
		}
	});
}

prompt.start();

console.log('Press enter to use default values.\n');

prompt.get(['from', 'to', 'filename'], function (err, result) {
	var from = result.from ? result.from : "1911";
	var to = result.to ? result.to : "2017";
	var filename = (result.filename ? result.filename : 'ASM') + '.csv';

	console.log('\nScraping ASM games from ' + from + " to " + to + '\n');

	var uri = 'http://www.cybervulcans.net/modules/bd/index.php' + '?' +
			'sai_de=' + from + '&' +
			'sai_a=' + to;

	console.log("Fetching data from " + uri +"\n\n...Please wait...\n");

	scrapASM(uri, function(res) {
		console.log(res.length + " results.\n");
		if (res.length > 0)
		{
			fs.writeFile(filename, json2csv({data: res}), function(err) {
				if (err) throw err;
				console.log("Results written to " + filename);
			});
		}
	});
});



