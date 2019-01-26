const resolvers = {
	Query: {
		hello: () => 'World',
		users: () => {
			return [
				{
					name: 'Kis Kakas',
					age: 20
				},
				{
					name: 'Nagy Pal',
					age: 30
				},
				{
					name: 'Kozepes Joska',
					age: 25
				}
			];
		}
	}
};

export default resolvers;
