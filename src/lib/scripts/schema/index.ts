import { configs } from "@/src/lib"

type Props = Parameters<typeof configs>[number]

export const schema = async (props: Props = {}) => {
	props
	// for (const config of await configs(props)) {
	// 	// config.out.schema
	// }
}
