import { intersection } from 'lodash';

const getGroupData = (conn, id) => {
	return new Promise((resolve, reject) => {
		conn.db.all(
			`SELECT nt.id FROM group_members AS gm 
			INNER JOIN nodes AS n ON (n.id=gm.node)
			INNER JOIN node_templates AS nt ON (nt.node=n.id)
			WHERE gm.pgroup=$id`,
			{ $id: id },
			(err, rows) => {
				if (err) {
					reject(err);
				} else {
					let templateIDs = rows.reduce((acc, cur) => [...acc, cur.id], []);
					getAllEndpoints(conn, templateIDs).then(
						endpoints => {
							let commonEndpoints = intersection(...endpoints);

							getValueForCommonEndpoints(
								conn,
								commonEndpoints,
								templateIDs[0]
							).then(
								result => {
									resolve(result);
								},
								err => {
									reject(err);
								}
							);
						},
						err => {
							reject(err);
						}
					);
				}
			}
		);
	});
};

const getAllEndpoints = (conn, ids) => {
	return new Promise((resolve, reject) => {
		let res = [];

		const getEndpoint = i => {
			conn.db.all(
				'SELECT name FROM node_template_mappings WHERE node_template=$templateID',
				{ $templateID: ids[i] },
				(err, rows) => {
					if (err) {
						reject(err);
					} else {
						let cur = rows.reduce((acc, cur) => [...acc, cur.name], []);
						res.push(cur);

						if (i < ids.length - 1) {
							getEndpoint(i + 1);
						} else {
							resolve(res);
						}
					}
				}
			);
		};

		getEndpoint(0);
	});
};

const getValueForCommonEndpoints = (conn, endpoints, templateID) => {
	return new Promise((resolve, reject) => {
		let res = [];

		conn.db.get(
			'SELECT n.uuid FROM node_templates AS nt INNER JOIN nodes AS n ON (n.id=nt.node) WHERE nt.id=$templateID',
			{ $templateID: templateID },
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					let promises = [];

					endpoints.forEach(endpoint => {
						promises.push(conn.getMapping(row.uuid, templateID, endpoint));
					});

					Promise.all(promises).then(
						mappings => {
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
						},
						err => {
							reject(err);
						}
					);
				}
			}
		);
	});
};

export default getGroupData;
