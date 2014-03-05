package org.entcore.auth.oauth;

import fr.wseduc.mongodb.MongoDb;
import jp.eisbahn.oauth2.server.data.DataHandler;
import jp.eisbahn.oauth2.server.data.DataHandlerFactory;
import jp.eisbahn.oauth2.server.models.Request;
import org.entcore.common.neo4j.Neo;

public class OAuthDataHandlerFactory implements DataHandlerFactory {

	private final Neo neo;
	private final MongoDb mongo;

	public OAuthDataHandlerFactory(Neo neo, MongoDb mongo) {
		this.neo = neo;
		this.mongo = mongo;
	}

	@Override
	public DataHandler create(Request request) {
		return new OAuthDataHandler(request, neo, mongo);
	}

}
