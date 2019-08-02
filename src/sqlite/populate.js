import structure from './structure';

const populate = db => {
	return db.exec(structure);
};

export default populate;
