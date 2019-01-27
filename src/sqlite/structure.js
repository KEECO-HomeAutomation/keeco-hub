const structure = `
	CREATE TABLE users (
		id INTEGER PRIMARY KEY NOT NULL,
		username varchar(64) NOT NULL,
		password varchar(64) NOT NULL
	);

	CREATE TABLE auth_tokens (
		id INTEGER PRIMARY KEY NOT NULL,
		user int NOT NULL,
		token text NOT NULL,
		issued datetime NOT NULL default current_timestamp,
		invalidated tinyint NOT NULL default 0,
		FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE
	);

	INSERT INTO users (username, password) VALUES ('admin', 'sha1$a3fea30e$1$0b601805f023f82ad83177ba748c18ed87812856');
`;

export default structure;
