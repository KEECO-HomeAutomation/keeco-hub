import { intersection } from 'lodash';

const getGroupData = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db
			.all(
				`SELECT nt.id FROM group_members AS gm 
			INNER JOIN nodes AS n ON (n.id=gm.node)
			INNER JOIN node_templates AS nt ON (nt.node=n.id)
			WHERE gm.pgroup=$id`,
				{ $id: id }
			)
			.then(rows => {
				let templateIDs = rows.reduce((acc, cur) => [...acc, cur.id], []);
				getAllEndpoints(conn, templateIDs).then(endpoints => {
					let commonEndpoints = intersection(...endpoints);

					getValueForCommonEndpoints(
						conn,
						commonEndpoints,
						templateIDs[0]
					).then(result => {
						resolve(result);
					}, reject);
				}, reject);
			}, reject);
	});
};

const getAllEndpoints = (conn, ids) => {
	return Promise.all(
		ids.map(id => {
			return conn.db
				.all(
					'SELECT name FROM node_template_mappings WHERE node_template=$templateID',
					{ $templateID: id }
				)
				.then(rows => rows.reduce((acc, cur) => [...acc, cur.name], []));
		})
	).then(res => res.reduce((acc, cur) => [...acc, cur], []));
};

const getValueForCommonEndpoints = (conn, endpoints, templateID) => {
	return new Promise((resolve, reject) => {
		conn.db
			.get(
				'SELECT n.uuid FROM node_templates AS nt INNER JOIN nodes AS n ON (n.id=nt.node) WHERE nt.id=$templateID',
				{ $templateID: templateID }
			)
			.then(row => {
				Promise.all(
					endpoints.map(endpoint =>
						conn.getMapping(row.uuid, templateID, endpoint)
					)
				).then(mappings => {
					let res = [];
					endpoints.forEach((endpoint, i) => {
						res = [
							...res,
							{
								name: endpoint,
								value: conn.mqtt.store.get(mappings[i]).value
							}
						];
					});
					resolve(res);
				}, reject);
			}, reject);
	});
};

export default getGroupData;
