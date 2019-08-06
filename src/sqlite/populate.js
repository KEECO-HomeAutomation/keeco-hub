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
 * @param {*} callback - A callback function.
 * @summary Populate the database.
 */
const populate = (db, callback) => {
	db.exec(structure, callback);
};

export default populate;
