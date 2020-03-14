var express = require('express');
var async = require('async');
var router = express.Router();

/*sign in*/
router.post('/signin', function(req, res) {
  var db = req.db;
  var userList = db.get('userList');
  var postList = db.get('postList');
  var commentList = db.get('commentList');
  var time = new Date();
  res.set({
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": true,
  });
  if (req.cookies.userId) {
    userList.findOne({'_id': req.cookies.userId}, function(err8, doc8) {
      if (err8 === null) {
        userList.update({'_id': req.cookies.userId},
        {$set: {'lastCommentRetrievalTime': formateTime(time)}});
        loadDataForLoginS(doc8, userList, postList, commentList, res);
      } else {
        res.send({'msg': err8});
      }
    })
  } else {
    if (req.body.name !== '' || req.body.password !== '') {
      userList.findOne({'name': req.body.name}, function(err8, doc8) {
        if (err8 === null) {
          if (doc8 === null || doc8.password !== req.body.password) {
            res.json({'msg': "Login failure"});
          } else {
            res.cookie('userId', doc8._id);
            userList.update({'name': req.body.name},
            {$set: {'lastCommentRetrievalTime': formateTime(time)}});
            loadDataForLoginS(doc8, userList, postList, commentList, res);
          }
        } else {
          res.send({'msg': err8});
        }
      })
    } else {
      res.send({'msg': ''});
    }
  }
});

/* log out*/
router.get('/logout', function(req, res) {
  res.set({
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": true,
  });
  var db = req.db;
  var collection = db.get('userList');
  var filter = {
    '_id': req.cookies.userId
  };
  collection.update(filter, {$set: {'lastCommentRetrievalTime': ''}
  }, function(err, result) {
    res.send((err === null) ? {msg: ''} : {msg: err});
  });
  res.clearCookie('userId');
});

/*get user profile*/
router.get('/getuserprofile', function(req, res) {
  res.set({
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": true,
  });
  var db = req.db;
  var collection = db.get('userList');
  var filter = {'_id': req.cookies.userId};
  collection.findOne(filter, function(err, doc) {
    if (err === null)
      res.json({
        'mobileNumber': doc.mobileNumber,
        'homeNumber': doc.homeNumber,
        'address': doc.address
      });
    else
      res.send({msg: err});
  })
});

/*save user profile*/
router.put('/saveuserprofile', function(req, res) {
  res.set({
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": true,
  });
  var db = req.db;
  var collection = db.get('userList');
  var filter = {'_id': req.cookies.userId};
  collection.update(filter, {
      $set: {
        'mobileNumber': req.body.mobileNumber,
        'homeNumber': req.body.homeNumber,
        'address': req.body.address
      }
    },
    function(err, result) {
      res.send((err === null) ? {msg: ''} : {msg: err});
    })
});

/* update star*/
router.get('/updatestar/:friendid', function(req, res) {
  res.set({
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": true,
  });
  var db = req.db;
  var collection = db.get('userList');
  var friendToUpdate = req.params.friendid;
  var filter = {'_id': req.cookies.userId};
  collection.findOne(filter, function(err, doc) {
    var tempList = doc.friends;
    var i = doc.friends.findIndex(function(each) {
      return each.friendId === friendToUpdate;
    });
    if (tempList[i].starredOrNot === 'N') {
      tempList[i].starredOrNot = 'Y';
      collection.update(filter, {$set: {'friends': tempList}});
    } else {
      tempList[i].starredOrNot = 'N';
      collection.update(filter, {$set: {'friends': tempList}});
    }
    res.send((err === null) ? {msg: ''} : {msg: err});
  });
});

/*post comment*/
router.post('/postcomment/:postid', function(req, res) {
  res.set({
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": true,
  });
  var db = req.db;
  var collection = db.get('commentList');
  var time = new Date();
  collection.insert({
      'postId': req.params.postid,
      'userId': req.cookies.userId,
      'postTime': formateTime(time),
      'comment': req.body.comment,
      'deleteTime': ''
    },
    function(err, result) {
      res.send((err === null) ? {msg: ''} : {msg: err});
    }
  )
});

/*delete comment*/
router.delete('/deletecomment/:commentid', function(req, res) {
  res.set({
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": true,
  });
  var db = req.db;
  var collection = db.get('commentList');
  var filter = {'_id': req.params.commentid};
  var time = new Date();
  collection.update(filter, {$set: {'deleteTime': formateTime(time)}}, function(err, result) {
    res.send((err === null) ? {msg: ''} : {msg: err});
  })
});



/*load new comment*/
router.get('/loadcommentupdates', function(req, res) {
  res.set({
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Credentials": true,
  });
  var db = req.db;
  var userList = db.get('userList');
  var commentList = db.get('commentList');
  userList.findOne({'_id': req.cookies.userId}, function(err2, doc2) {
    var lastTime = doc2.lastCommentRetrievalTime;
    commentList.find({}, {}, function(err, docs) {
      async.map(docs, function(doc, callback){
        if ((doc.deleteTime === '' && compareTime(lastTime, doc.postTime)) ||
          (doc.deleteTime !== '' && compareTime(lastTime, doc.deleteTime))) {
          userList.findOne({'_id': doc.userId}, function(err2, doc2) {
            if (err2 === null){
              callback(null, {
                'postId': doc.postId,
                'commentId': doc._id,
                'userId': doc.userId,
                'userName': doc2.name,
                'postTime': doc.postTime,
                'comment': doc.comment,
                'deleteTime': doc.deleteTime
              });
            }else{
              res.send({'msg':err2});
            }
          });
        }else {
          callback(null, null);
        }
      }, function(err3, result){
          var time = new Date();
          userList.update({'_id': req.cookies.userId},
          {$set: {'lastCommentRetrievalTime': formateTime(time)}});
          res.send(result);
      });
    });
  });
});

var loadDataForLoginS = function(doc8, userList, postList, commentList, res) {
  var name = doc8.name;
  var icon = doc8.icon;
  var friends = doc8.friends;
  async.mapSeries(friends, function(friend, callback) {
    userList.findOne({'_id': friend.friendId}, function(err2, doc2) {
      if (err2 === null) {
        postList.findOne({'userId': friend.friendId}, function(err3, doc3) {
          if (err3 === null) {
            var postId = doc3._id;
            commentList.find({'postId': postId.toString()}, function(err4, docs) {
              if (err4 === null) {
                async.mapSeries(docs, function(doc, callback2) {
                  userList.findOne({'_id': doc.userId}, function(err5, doc5) {
                    if (err5 === null) {
                      callback2(null, {
                        'postId': postId,
                        'commentId': doc._id,
                        'userId': doc.userId,
                        'userName': doc5.name,
                        'comment': doc.comment,
                        'postTime': doc.postTime,
                        'deleteTime': doc.deleteTime
                      })
                    } else {
                      res.send({'msg': err5});
                    }
                  })
                }, function(err3, result2) {
                  result2.sort(commentSort);
                  callback(null, {
                    'friendId': friend.friendId,
                    'friendName': doc2.name,
                    'friendIcon': doc2.icon,
                    'starredOrNot': friend.starredOrNot,
                    'time': doc3.time,
                    'location': doc3.location,
                    'postId': doc3._id,
                    'content': doc3.content,
                    'commentList': result2
                  });
                });
              } else {
                res.send({'msg': err4});
              }
            })
          } else {
            res.send({'msg': err3});
          }
        })
      } else {
        res.send({'msg': err2});
      }
    })
  }, function(err, result) {
    result.sort(friendsBlocksSort);
    res.json({
      'friendsBlocks': result,
      'name': name,
      'icon': icon
    });
  });

}

var formateTime = function(time) {
  var hour = time.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  var min = time.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  var sec = time.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;
  var date = time.toDateString();
  return hour + ":" + min + ":" + sec + " " + date;
}

var compareTime = function(fullTime1, fullTime2) {
  var date1 = fullTime1.toString().substr(9);
  var date2 = fullTime2.toString().substr(9);
  var time1 = fullTime1.toString().substr(0, 8);
  var time2 = fullTime2.toString().substr(0, 8);
  if (Date.parse(date1) === Date.parse(date2)) {
    if (Date.parse('01/01/2019 ' + time1) >= Date.parse('01/01/2019 ' + time2))
      return false;
    else
      return true;
  } else if (Date.parse(date1) > Date.parse(date2)) {
    return false;
  } else {
    return true;
  }
}

var commentSort = function(a, b) {
  if (compareTime(a.postTime, b.postTime))
    return -1;
  else
    return 1;
}

var friendsBlocksSort = function(a, b) {
  if (compareTime(a.time, b.time))
    return -1;
  else
    return 1;
}

/*
 * Handle preflighted request
 */
router.options("/*", function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', true);
  res.sendStatus(200);
});

module.exports = router;
