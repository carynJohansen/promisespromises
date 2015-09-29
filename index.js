var express = require('express')
var app = express()
var path = require('path')
var child = require('child_process')
var sys = require('sys')
var async = require('async')

var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('/Users/carynjohansen/Documents/NYUClasses/Purugganan_Lab/TFInteraction_db/michael.db')

app.set('port', (process.env.PORT || 5000))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

var template = 'Node app is running at localhost: {port~number}'
var txt = template.replace('{port~number}', app.get('port'))

app.get('/', function (request, response) {

	function get_regulator_coordinates() {
		return new Promise(function(resolve, reject) {
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
						//console.log(regGL)
						//console.log(rows[0]["start"])
						resolve(rows[0])
					}
				})//close db.all
			})//close db.serialize
		})
	}//close get_regulator_coordinates

	function vcf_python(coordJSON) {
		return new Promise(function(resolve, reject) {
			console.log("in vcf_python")
			//coordinates is a JSON object with start and stop
			//console.log(coordinates)
			var start = coordJSON["start"]
			var end = coordJSON["end"]
			var chrom = coordJSON["chrom"]
			console.log("start: " + start)
			console.log("end: " + end)

			var python = child.spawn('python',[ __dirname + '/vcf_get.py', start, end, chrom])
			var chunk = ''	

			python.stdout.on('data', function(data) {
				//sys.print(data.toString())
				console.log("In python std out!")
				chunk += data
				json = JSON.stringify(chunk)
				resolve(json)
			}) //close stdout.on
		})
	} //close vcf_python

	var rc = get_regulator_coordinates()
	rc.then(function(rcJSON) {
		console.log(rcJSON)
		return vcf_python(rcJSON)
		//response.json(rcJSON)
	}).then(function(vcf) {
		return vcf = JSON.parse(vcf)
	}).then(function(vcfJSON) {
		console.log(vcfJSON)
		response.json(vcfJSON)
	}).catch(function(reason) {
		console.log(reason)
	})


//	var someAsyncThing = function() {
//		return new Promise(function(resolve, reject) {
//			resolve(x+2)
//		})
//	}
//	someAsyncThing().then(function() {
//		console.log('everything is great')
//	}).catch(function(error) {
//		console.log('oh no!', error)
//	})
})

app.listen(app.get('port'), function() {
    console.log(txt)
})