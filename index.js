var express = require('express')
var app = express()
var path = require('path')
var child = require('child_process')

var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('/Users/carynjohansen/Documents/NYUClasses/Purugganan_Lab/TFInteraction_db/michael.db')

app.set('port', (process.env.PORT || 5000))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

var template = 'Node app is running at localhost: {port~number}'
var txt = template.replace('{port~number}', app.get('port'))

app.get('/', function (request, response) {
	function get_regulator_coordinates() {
		db.serialize( function () {
			var regGL = "LOC_Os03g12350"
			var sql_query = "SELECT gm.start, gm.end, gm.seqid as chrom \
			FROM gene_model as gm \
			WHERE (gm.gene_locus = ?)"
			db.all(sql_query, regGL, function(err, rows) {
				//console.log("In db.all in get_coordinates()")
				if (err) {
					console.log(err)
				} else {
					console.log(regGL)
					console.log(rows[0]["start"])
					return rows[0]
				}
			})//close db.all
		})//close db.serialize
	}//close get_regulator_coordinates

	function vcf_python(coordinates) {
		console.log("in vcf_python")
		//coordinates is a JSON object with start and stop
		//console.log(coordinates)
		//var start = json["start"]
		//var end = coordinates["end"]
		var python = child.spawn('python',[ __dirname + '/vcf_get.py', 6512743, 6518792, 'Chr3'])
		var chunk = ''

		python.stdout.on('data', function(data) {
			chunk += data
			json = JSON.stringify(chunk)
			json = json.replace(/(\n)/, "")
			response = JSON.parse(json)
			console.log(json)
			return json

		}) //close stdout.on
	} //close vcf_python

	function promises() {
		var promise = get_regulator_coordinates()

		var promise2 = promise.then(function(data) {
			return vcf_python(data)
		}, function(err) {
			console.error(err)
		})
			
		promise2.then(response.end("fullfilled?"), console.error)

		//response.render('content', { coordinates : coord, vcf_block : vcf_stuff })

	}
	promises()
})

app.listen(app.get('port'), function() {
    console.log(txt)
})