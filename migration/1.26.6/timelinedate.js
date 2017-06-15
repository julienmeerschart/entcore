db.timeline.find({}, {"_id":1, "date":1}).forEach(function(doc) {
      db.timeline.update({"_id" : doc._id}, { $set : { "created" : doc.date}});
});

