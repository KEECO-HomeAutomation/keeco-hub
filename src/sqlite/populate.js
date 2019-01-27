import structure from './structure';

const populate = (db, callback) => {
	db.exec(structure, callback);
};

export default populate;
