const connect = require('./dbconnect')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const testSchema = new Schema({
	key:{
		unique:true,
		type:String
	},
  value:{type:String}
})

const Test = mongoose.model('Test', testSchema)


const set = function(req, res) {

  const {key, value} = req.body
  if(!key){
    res.json({
      isSuccess: false
    })
  }else{
		Test.findOne({key}, function(err, t){
			if(err){
				return res.json({
          isSuccess: false
        })
			}else if(t){
				Test.update({key}, value, function(err, t){
					if(err){
		        res.json({
		          isSuccess: false
		        })
		      }else{
		        res.json({
		          isSuccess: true
		        })
		      }
				})
			}else{
				const t = new Test({key, value})
				t.save(function(err, t){
					if(err){
						res.json({
							isSuccess: false
						})
					}else{
						res.json({
							isSuccess: true
						})
					}
				})
			}
		})
  }
}

const get = function(req, res) {
  const {key} = req.body
  if(!key){
    res.json({
      isSuccess: false
    })
  }else{
    Test.findOne({key}, function(err, t){
      if(err){
        res.json({
          isSuccess: false
        })
  		}else{
        res.json({
          isSuccess: true,
          value:t && JSON.parse(t.value)
        })
      }
    })
  }
}

const destroy = function(req, res) {
  const {key} = req.body
  if(!key){
    res.json({
      isSuccess: false
    })
  }else{
    Test.remove({key}, function(err, t){
      if(err){
        res.json({
          isSuccess: false
        })
  		}else{
        res.json({
          isSuccess: true
        })
      }
    })
  }
}

module.exports = {
  set,
  get,
  destroy
}
