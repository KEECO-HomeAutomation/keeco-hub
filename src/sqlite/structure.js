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

	CREATE TABLE nodes (
		id INTEGER PRIMARY KEY NOT NULL,
		uuid text NOT NULL,
		name text
	);

	CREATE TABLE node_endpoints (
		id INTEGER PRIMARY KEY NOT NULL,
		node int NOT NULL,
		name text NOT NULL,
		output tinyint NOT NULL default 0,
		range text,
		FOREIGN KEY (node) REFERENCES nodes(id) ON DELETE CASCADE
	);

	CREATE TABLE node_templates (
		id INTEGER PRIMARY KEY NOT NULL,
		node int NOT NULL,
		name text NOT NULL,
		FOREIGN KEY (node) REFERENCES nodes(id) ON DELETE CASCADE
	);

	CREATE TABLE node_template_mappings (
		id INTEGER PRIMARY KEY NOT NULL,
		node_template int NOT NULL,
		name text NOT NULL,
		endpoint int NOT NULL,
		FOREIGN KEY (node_template) REFERENCES node_templates(id) ON DELETE CASCADE,
		FOREIGN KEY (endpoint) REFERENCES node_endpoints(id) ON DELETE CASCADE
	);

	CREATE TABLE groups (
		id INTEGER PRIMARY KEY NOT NULL,
		name text NOT NULL,
		is_room tinyint NOT NULL default 0
	);

	CREATE TABLE group_members (
		id INTEGER PRIMARY KEY NOT NULL,
		pgroup int NOT NULL,
		node int NOT NULL,
		FOREIGN KEY (pgroup) REFERENCES groups(id) ON DELETE CASCADE,
		FOREIGN KEY (node) REFERENCES nodes(id) ON DELETE CASCADE
	);

	/* add default admin account. Credintials: admin-admin */
	INSERT INTO users (username, password) VALUES ('admin', 'sha1$a3fea30e$1$0b601805f023f82ad83177ba748c18ed87812856');
`;

export default structure;
