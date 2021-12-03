import { writable } from 'svelte/store';
import _ from 'lodash'

//export const activeLocation = writable()

function createLocationStore() {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,
		//getActive: () => update(n => n + 1),
		toggleExpand: (_id=undefined) => { // expands one at a time only 
			return update(c => {
				return c.map(v => {
					//console.log(v)
					if(v._id === _id) {
						v.expand = !v.expand
					} else {
						v.expand = false
					}
					return v
				})
				/*const i = _.findIndex(c, {_id:_id})
				c[i].expand = !c[i].expand
				return c*/
			})
		},
		//getById: (_id) => _.find(get(), {_id: _id}), derived store ?? 
		//set,
		update: (data) => {
			return update(c => {

				return data.map(d => {
					const i = _.findIndex(c, {_id: d._id})
					if(i != -1) {
						return _.merge(c[i], d)

					} else {

						d.exand = false
						return d
					}
				})
			})
		},
		updateLocation: (data) => {
			return update(c => {
				const i = _.findIndex(c, {_id: data._id})
				c[i] = _.merge(c[i], data)
				return c
			})
		},

	  };
}

export const locationStore = createLocationStore()


/*export const activeLocation = derived(
	locations,
	$locations => return active
);*/