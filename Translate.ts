import { Menu, Utils } from "wrapper/Imports"

const path = "scripts_files/translate"
const base = "github.com/octarine-public/trees-rings"
const Load = (name: string) => {
	return new Map<string, string>
		(Object.entries(Utils.readJSON(`${base}/${path}/${name}.json`)))
}
Menu.Localization.AddLocalizationUnit("russian", Load("ru"))
Menu.Localization.AddLocalizationUnit("english", Load("en"))
Menu.Localization.AddLocalizationUnit("сhinese", Load("cn"))