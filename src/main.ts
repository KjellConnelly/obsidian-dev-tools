import { Plugin } from 'obsidian'
import ConsoleHelper from './Classes/ConsoleHelper'
import Commands from './Classes/Commands'
import SettingTab from './Classes/SettingTab'

interface MyPluginSettings {
	[index: string]: any,
	consoleOn: boolean,
	consoleHeight: number,
}
const DEFAULT_SETTINGS: MyPluginSettings = {
	consoleOn: false,
	consoleHeight:250,
}

export default class ObsidianDevToolsPlugin extends Plugin {
  settings: MyPluginSettings
	defaultSettings: MyPluginSettings
	consoleHelper: ConsoleHelper

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}

	optionalLog(evaluate : boolean = false) {
		let text = ''
    if (window.getSelection) {
      text = window.getSelection().toString();
    }
		if (text.length > 0) {
	    this.consoleHelper[evaluate ? 'logEval' : 'log'](text)
		}
	}

  async onload() {
    await this.loadSettings()
		this.defaultSettings = DEFAULT_SETTINGS
		this.addSettingTab(new SettingTab(this))
		this.consoleHelper = new ConsoleHelper(this, this.settings.consoleOn)
		new Commands(this)
	}
}
