import structure from './structure';

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @module sqllite/populate
 * @summary Populate the database.
 */

/**
 * @author Gergő Fándly <gergo@systemtest.tk>
 * @function populate
 * @param {*} db - A database.
 * @summary Populate the database.
 */
const populate = db => {
	return db.exec(structure);
};

export default populate;
