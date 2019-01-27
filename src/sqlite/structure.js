const structure = `
	CREATE TABLE users (
		id int PRIMARY KEY NOT NULL,
		username varchar(64) NOT NULL,
		password varchar(64) NOT NULL
	);

	CREATE TABLE auth_tokens (
		id int PRIMARY KEY NOT NULL,
		user int NOT NULL,
		token text NOT NULL,
		invalidated tinyint NOT NULL default 0,
		FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE
	);
`;

export default structure;
