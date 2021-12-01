import { writable } from 'svelte/store';

export const activeLocation = writable()



function locationsStore() {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,
		//getActive: () => update(n => n + 1),
		//setActive: () => 
		//set: () => ,
		set,
		update,
		//update: () => set(0)
	  };
}

export const locations = locationsStore()


/*export const activeLocation = derived(
	locations,
	$locations => return active
);*/