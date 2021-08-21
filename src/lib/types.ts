import { Setting, ToggleComponent, TextComponent, } from 'obsidian'

//////////////////////////
// small helper types
type allValueTypes = string | boolean
export type allSettingComponentTypes = TextComponent | ToggleComponent
export type allSettingComponentOptionTypes = TextOptionType | ToggleOptionType

//////////////////////////
// main type
export type SettingType = {
	[propName: string] : any,
	name: string,
	description?: string,
	html?: boolean,
}

//////////////////////////
// function types
export type onChangeType = (
	value : allValueTypes,
	component : allSettingComponentTypes,
	setting : Setting
)=>any

//////////////////////////
// return types
export type SettingPackageType = {
	setting: Setting,
	components: Array<allSettingComponentTypes>
}

//////////////////////////
// component types
export type TextOptionType = {
	[propName: string] : any,
	key: string,
	placeholder?: string,
	autoSave?: boolean,
	value?: boolean,
	onChange?: onChangeType,
}

export type ToggleOptionType = {
	[propName: string] : any,
	key: string,
	value?: boolean,
	autoSave? : boolean,
	onChange?: onChangeType,
}
/*
export function isTextType(component: allSettingComponentTypes): component is TextType {
   return (<TextType>component).swim !== undefined;
}
*/
