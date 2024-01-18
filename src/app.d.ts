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

		interface Picture {
			url: string
		}

		interface Status {
			state: string
		}

		interface Stats {
			height: string | string[],
			ΔElevation: string
		}

		interface Coaster {
			id: number,
			name: string,
			model: string,  // add option to include mountain coasters ("Alpine Coaster")
			country: string,
			type: string,
			design: string,
			pictures: Picture[],
			status: Status,
			park: Park,
			fullName: string,
			stats: Stats
		}

		interface FilterConfig {
			includeMountainCoasters: boolean,
			allowedType: "Wood" | "Steel" | "Both",
			operatingOnly: boolean,
			minHeight: number,
			canadaUSOnly: boolean
		}
	}
}

export {};
