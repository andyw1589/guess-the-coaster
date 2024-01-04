// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Park {
			id: number,
			name: string
		}

		interface Coaster {
			id: number,
			name: string,
			park: Park
		}
	}
}

export {};
