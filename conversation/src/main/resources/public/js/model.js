function User(data){
	if(data){
		this.updateData(data);
	}

	this.toString = function(){
		return (this.displayName || '') + (this.name || '');
	};

	this.receivers = function(){
		var that = this;
		return _map(this.to, function(id){
			return new User({ id: id, displayName: that.displayNames})
		})
	};
}

User.prototype.mapUser = function(displayNames, id){
	return _.map(_.filter(displayNames, function(user){
		return user[0] === id;
	}), function(user){
		return new User({ id: user[0], displayName: user[1] });
	})[0];
};

function Mail(){
	this.sentDate = function(){
		return moment(parseInt(this.date)).calendar();
	};

	this.longDate = function(){
		return moment(parseInt(this.date)).format('dddd DD MMMM YYYY')
	};

	this.sender = function(){
		var that = this;
		return User.prototype.mapUser(this.displayNames, this.from);
	};

	this.map = function(id){
		return User.prototype.mapUser(this.displayNames, id);
	};

	this.saveAsDraft = function(){
		var that = this;
		var data = { subject: this.subject, body: this.body };
		data.to = _.pluck(this.to, 'id');
		data.cc = _.pluck(this.cc, 'id');
		http().postJson('/conversation/draft', data).done(function(newData){
			that.updateData(newData);
			Model.folders.draft.mails.refresh();
		});
	};

	this.send = function(cb){
		var data = { subject: this.subject, body: this.body };
		data.to = _.pluck(this.to, 'id');
		data.cc = _.pluck(this.cc, 'id');
		var path = '/conversation/send?';
		if(this.id){
			path += 'id=' + this.id + '&';
		}
		if(this.parentConversation){
			path += 'In-Reply-To=' + this.parentConversation.id;
		}
		http().postJson(path, data).done(function(result){
			Model.folders.outbox.mails.refresh();
			Model.folders.draft.mails.refresh();
			if(typeof cb === 'function'){
				cb(result);
			}
		});
	};

	this.open = function(){
		var that = this;
		this.unread = false;
		http().getJson('/conversation/message/' + this.id).done(function(data){
			that.updateData(data);
			Model.folders.current.trigger('mails.change');
		});
	};
}

function Folder(api){
	this.pageNumber = 0;

	this.collection(Mail, {
		refresh: function(){
			this.pageNumber = 0;
			this.sync();
		},
		sync: function(pageNumber, emptyList){
			if(!pageNumber){
				pageNumber = 0;
			}
			var that = this;
			http().get(this.api.get + '?page=' + pageNumber).done(function(data){
				data.sort(function(a, b){ return b.date - a.date})
				if(emptyList === false){
					that.addRange(data);
					if(data.length === 0){
						that.full = true;
					}
				}
				else{
					that.load(data);
				}
			});
		},
		removeMails: function(){
			http().put('/conversation/trash?' + http().serialize({ id: _.pluck(this.selection(), 'id') }));
			this.removeSelection();
		},
		api: api
	});

	this.nextPage = function(){
		if(!this.mails.full){
			this.pageNumber++;
			this.mails.sync(this.pageNumber, false);
		}
	};
}

function buildModel(){
	Model.collection(User, {
		sync: function(){
			var that = this;
			http().get('/conversation/visible').done(function(data){
				that.addRange(data.groups);
				that.addRange(data.users);
			});
		},
		find: function(search, include, exclude){
			var searchTerm = lang.removeAccents(search).toLowerCase();
			if(!searchTerm){
				return [];
			}
			var found = _.filter(this.all.concat(include), function(user){
				var testDisplayName = '', testNameReversed = '';
				if(user.displayName){
					testDisplayName = lang.removeAccents(user.displayName).toLowerCase();
					testNameReversed = lang.removeAccents(user.displayName.split(' ')[1] + ' '
						+ user.displayName.split(' ')[0]).toLowerCase();
				}
				var testName = '';
				if(user.name){
					testName = lang.removeAccents(user.name).toLowerCase();
				}

				return testDisplayName.indexOf(searchTerm) !== -1 ||
					testNameReversed.indexOf(searchTerm) !== -1 ||
					testName.indexOf(searchTerm) !== -1;
			});
			return _.reject(found, function(element){
				return exclude.indexOf(element) !== -1;
			});
		}
	});

	Model.collection(Folder, {
		sync: function(){
			if(this.current === null){
				this.current = this.inbox;
			}

			this.current.mails.sync(this.pageNumber);
		},
		openFolder: function(folderName){
			this.current = this[folderName];
			if(this.current.mails.all.length === 0){
				this.current.mails.sync();
			}
		},
		systemFolders: ['inbox', 'draft', 'outbox', 'trash']
	});

	Model.folders.systemFolders.forEach(function(folderName){
		Model.folders[folderName] = new Folder({
			get: '/conversation/list/' + folderName.toUpperCase()
		});
		Model.folders[folderName].folderName = folderName;
	});

	Model.folders.draft.saveDraft = function(draft){
		draft.saveAsDraft();
		this.mails.push(draft);
	};

	Model.folders.trash.mails.removeMails = function(){
		http().delete('/conversation/delete?' + http().serialize({ id: _.pluck(this.selection(), 'id') }));
		this.removeSelection();
	}
}