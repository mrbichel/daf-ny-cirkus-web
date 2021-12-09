import { writable, get } from 'svelte/store';
import _ from 'lodash'

import dayjs from 'dayjs'
//export const activeLocation = writable()

const maxAgeSeconds = 120

function createLocationStore() {
	const { subscribe, update } = writable([]);

	let lastFetched = undefined

	const store = {
		subscribe,
		//getActive: () => update(n => n + 1),
		toggleExpand: (_id=undefined) => { // expands one at a time only 
			return update(c => {
				return c.map(v => {
					//console.log(v)
					if(v._id === _id) {
						v.expand = true
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
			lastFetched = dayjs();

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
		updateDetails: (data) => {
			return update(c => {
				const i = _.findIndex(c, {_id: data._id})
				c[i] = _.merge(c[i], data)
				c[i].lastFetchedDetail = dayjs()
				return c
			})
		},
		isExpired: (slug = undefined) => {

			const current : location[] = get(store)

			if(current.length < 1) return true

			const isExp = (t) => {
				if(!t) {
					return true
				}
				return dayjs().isAfter(dayjs(t).add(maxAgeSeconds, 'seconds'))
			}

			if(slug) {
				const l = _.find(current, {slug: slug})
				if(!l || isExp(l.lastFetchedDetail)) {
					return true
				}
				return false
			}

			
			return isExp(lastFetched)
		},

		getBySlug: (slug) => {
			const current : location[] = get(store)
			return _.find(current, {slug: slug})
		}

	  };

	  return store
}

export const locationStore = createLocationStore()


/*export const activeLocation = derived(
	locations,
	$locations => return active
);*/