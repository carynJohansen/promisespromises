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
//	function coordinates() {
//		var regGL = "LOC_Os03g12350"
//		var sql_query = "SELECT gm.start, gm.end, gm.seqid as chrom \
//				FROM gene_model as gm \
//				WHERE (gm.gene_locus = ?)"
//		this.get_regulator_coordinates = function(callback){
//			this.db.all(sql_query, regGL, function(err, rows) {
//				//console.log("In db.all in get_coordinates()")
//				if (err) {
//					console.log('Error: ' + err)
//				} else {
//					console.log("rows in get_regulator_coordinates: " + rows[0])
//					callback(rows)
//					return
//				}
//			}) //close db.all
//		} //close get_regulator_coordinates
//	}

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
					//console.log(regGL)
					//console.log(rows[0]["start"])
					return rows[0]
				}
			})//close db.all
		})//close db.serialize
	}//close get_regulator_coordinates

	function vcf_python() {
		console.log("in vcf_python")
//		var coordinates
//		coordinates.get_regulator_coordinates(function(err, rows) {
//			coordinates = rows
//		})
//		console.log(coordinates)
		//coordinates is a JSON object with start and stop
		//console.log(coordinates)
		//var start = json["start"]
		//var end = coordinates["end"]
		var python = child.spawn('python',[ __dirname + '/vcf_get.py', 6512743, 6518792, 'Chr3'])
		var chunk = ''

		python.stdout.on('data', function(data) {
			sys.print(data.toString())
			return data.toString()
			//console.log("In python std out!")
			//chunk += data
			//json = JSON.stringify(chunk)
			//json = json.replace(/(\n)/, "")
			//response = JSON.parse(json)
			//console.log(json)
			//return json

		}) //close stdout.on
	} //close vcf_python
	
	async.series([
		function(callback){
			vcf_python()
			callback(null, 'one')
		},
		function(callback) {
			var stuff = get_regulator_coordinates()
			console.log("here's stuff: " + stuff)
			callback(null, 'two')
		}
	])
//	var promise = vcf_python()//
//	
//	var promise2 = promise.then(function (data) {
//		return coordinates()
//	}, function (err) {
//		console.error(err)
//	})
//	promise2.then(console.log, console.error)//

//	var coords = ''


//	var asyncCoordinates = function() {
//		return new Promise(function(resolve, reject) {
//			resolve(get_regulator_coordinates())
//		})
//	}
//	var asyncVCF = function(data) {
//		return new Promise(function(resolve, reject) {
//			resolve(vcf_python(data))
//		})
//	}//

//	asyncCoordinates().then(function(data) {
//		console.log('in asyncCoordinates and this is data: ' + data)
//		return asyncVCF(data)
//	}).then(function(data) {
//		console.log(data)
//	})
		//response.render('content', { coordinates : coord, vcf_block : vcf_stuff })

	
	//promises()

	var someAsyncThing = function() {
		return new Promise(function(resolve, reject) {
			resolve(x+2)
		})
	}
	someAsyncThing().then(function() {
		console.log('everything is great')
	}).catch(function(error) {
		console.log('oh no!', error)
	})
})

app.listen(app.get('port'), function() {
    console.log(txt)
})